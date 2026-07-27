import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { invoiceCreateSchema } from "@/lib/validators/invoice";

// GET — list all invoices with GST & Client details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    let businessProfileId = searchParams.get("businessProfileId");

    if (!businessProfileId) {
      const defaultProfile = await prisma.businessProfile.findFirst();
      if (defaultProfile) {
        businessProfileId = defaultProfile.id;
      }
    }

    const where: any = {};
    if (businessProfileId) {
      where.businessProfileId = businessProfileId;
    }
    if (clientId) {
      where.clientId = clientId;
    }
    if (status) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        businessProfile: true,
        lineItems: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch invoices" }, { status: 500 });
  }
}

// POST — create new invoice with GST tax breakdown, Inventory auto-deduction, and Khatabook ledger update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = invoiceCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid invoice data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    let {
      businessProfileId,
      clientId,
      templateId,
      invoiceNo: inputInvoiceNo,
      billingType,
      placeOfSupply,
      status,
      currency,
      dueDate,
      notes,
      terms,
      vehicleNo,
      ewayBillNo,
      transportMode,
      documentType = "INVOICE",
      lineItems,
      customFields = [],
      paidAmount = 0,
    } = parsed.data;

    // Fetch default business profile if not provided
    if (!businessProfileId) {
      const defaultProfile = await prisma.businessProfile.findFirst();
      if (!defaultProfile) {
        return NextResponse.json({ error: "No business profile found. Please set up profile." }, { status: 400 });
      }
      businessProfileId = defaultProfile.id;
    }

    const businessProfile = await prisma.businessProfile.findUnique({
      where: { id: businessProfileId },
    });

    if (!businessProfile) {
      return NextResponse.json({ error: "Business profile not found" }, { status: 404 });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client/Party not found" }, { status: 404 });
    }

    // Auto-generate GST invoice number if not provided
    let finalInvoiceNo = inputInvoiceNo;
    if (!finalInvoiceNo) {
      const count = await prisma.invoice.count({
        where: { businessProfileId },
      });
      const seq = (count + 1).toString().padStart(3, "0");
      finalInvoiceNo = `INV-2026-${seq}`;
    }

    // Determine GST Tax Logic: Intra-state (CGST + SGST) vs Inter-state (IGST)
    const supplierStateCode = businessProfile.stateCode || "27";
    const placeOfSupplyCode = placeOfSupply || client.stateCode || supplierStateCode;
    const isIntraState = supplierStateCode === placeOfSupplyCode;

    let totalTaxableAmount = 0;
    let totalCgstAmount = 0;
    let totalSgstAmount = 0;
    let totalIgstAmount = 0;

    const computedLineItems = lineItems.map((item) => {
      const rate = item.rate;
      const qty = item.qty;
      const discountPercent = item.discountPercent || 0;
      const taxPercent = item.taxPercent || 0;

      const baseAmount = rate * qty;
      const discountAmount = baseAmount * (discountPercent / 100);
      const taxableValue = baseAmount - discountAmount;
      totalTaxableAmount += taxableValue;

      const taxValue = taxableValue * (taxPercent / 100);

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (isIntraState) {
        cgst = taxValue / 2;
        sgst = taxValue / 2;
        totalCgstAmount += cgst;
        totalSgstAmount += sgst;
      } else {
        igst = taxValue;
        totalIgstAmount += igst;
      }

      const totalItemAmount = taxableValue + taxValue;

      return {
        itemId: item.itemId || null,
        description: item.description,
        hsnCode: item.hsnCode || "8517",
        qty,
        unit: item.unit || "Pcs",
        rate,
        discountPercent,
        taxPercent,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        amount: taxableValue,
      };
    });

    const grandTotal = totalTaxableAmount + totalCgstAmount + totalSgstAmount + totalIgstAmount;

    // Create Invoice with LineItems, CustomFields, Stock Deductions, and Khatabook Transaction in a Transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const createdInvoice = await tx.invoice.create({
        data: {
          invoiceNo: finalInvoiceNo,
          businessProfileId,
          clientId,
          templateId: templateId || "vyapar_gst_v1",
          documentType,
          billingType: billingType || "B2B",
          placeOfSupply: placeOfSupplyCode,
          status: status || (paidAmount >= grandTotal ? "paid" : paidAmount > 0 ? "partially_paid" : "pending"),
          taxableAmount: totalTaxableAmount,
          cgstAmount: totalCgstAmount,
          sgstAmount: totalSgstAmount,
          igstAmount: totalIgstAmount,
          totalAmount: grandTotal,
          paidAmount: paidAmount,
          currency: currency || "INR",
          dueDate: dueDate ? new Date(dueDate) : null,
          notes,
          terms: terms || "Payment due within 15 days of invoice date.",
          vehicleNo,
          ewayBillNo,
          transportMode: transportMode || "road",
          lineItems: {
            create: computedLineItems,
          },
          customFields: {
            create: customFields.map((cf) => ({
              fieldKey: cf.fieldKey,
              fieldValue: cf.fieldValue,
            })),
          },
        },
        include: {
          lineItems: true,
          client: true,
          businessProfile: true,
        },
      });

      // 1. Deduct Stock for mapped items & record stock movements (ONLY FOR INVOICES)
      if (documentType === "INVOICE") {
        for (const item of computedLineItems) {
          if (item.itemId) {
            const currentItem = await tx.item.findUnique({ where: { id: item.itemId } });
            if (currentItem) {
              await tx.item.update({
                where: { id: item.itemId },
                data: {
                  stockQty: currentItem.stockQty - item.qty,
                  stockMovements: {
                    create: {
                      changeQty: -item.qty,
                      movementType: "sale",
                      referenceId: createdInvoice.id,
                      notes: `Sale in Invoice #${finalInvoiceNo}`,
                    }
                  }
                }
              });
            }
          }
        }
      }

      // 2. Record Khatabook Party Udhaar Entry (GAVE) for full invoice amount (ONLY FOR INVOICES)
      if (documentType === "INVOICE") {
        await tx.partyTransaction.create({
          data: {
            businessProfileId,
            clientId,
            invoiceId: createdInvoice.id,
            type: "GAVE", // Bill Issued
            amount: grandTotal,
            paymentMode: "Invoice",
            notes: `Invoice #${finalInvoiceNo} issued`,
            date: new Date(),
          }
        });
      }

      // 3. Record Khatabook Payment Entry (GOT) if upfront paidAmount exists (ONLY FOR INVOICES)
      if (documentType === "INVOICE" && paidAmount > 0) {
        await tx.partyTransaction.create({
          data: {
            businessProfileId,
            clientId,
            invoiceId: createdInvoice.id,
            type: "GOT",
            amount: paidAmount,
            paymentMode: "upi",
            notes: `Upfront payment received for Invoice #${finalInvoiceNo}`,
            date: new Date(),
          }
        });
      }

      return createdInvoice;
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: error.message || "Failed to create invoice" }, { status: 500 });
  }
}
