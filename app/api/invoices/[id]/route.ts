import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { invoiceCreateSchema } from "@/lib/validators/invoice";

async function verifyInvoiceOwnership(invoiceId: string, userId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      businessProfile: { select: { userId: true } },
      lineItems: true,
      customFields: true,
      client: true,
    },
  });

  if (!invoice || invoice.businessProfile.userId !== userId) {
    return null;
  }
  return invoice;
}

// GET — get a single invoice
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await verifyInvoiceOwnership(id, session.userId);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json({ invoice });
}

// PUT — update an invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await verifyInvoiceOwnership(id, session.userId);
  if (!existing) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = invoiceCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid invoice data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      clientId,
      templateId,
      invoiceNo,
      status,
      currency,
      dueDate,
      notes,
      lineItems,
      customFields = [],
    } = parsed.data;

    // Verify client belongs to the business profile
    const client = await prisma.client.findFirst({
      where: { id: clientId, businessProfileId: existing.businessProfileId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found under this business profile" }, { status: 404 });
    }

    // Recalculate total amount
    let totalAmount = 0;
    const computedLineItems = lineItems.map((item) => {
      const rate = item.rate;
      const qty = item.qty;
      const taxPercent = item.taxPercent || 0;
      const subtotal = rate * qty;
      const taxAmount = subtotal * (taxPercent / 100);
      const amount = subtotal + taxAmount;
      totalAmount += amount;

      return {
        description: item.description,
        qty,
        rate,
        taxPercent,
        amount,
      };
    });

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // 1. Delete existing line items
      await tx.invoiceLineItem.deleteMany({
        where: { invoiceId: id },
      });

      // 2. Delete existing custom fields
      await tx.invoiceCustomField.deleteMany({
        where: { invoiceId: id },
      });

      // 3. Update the invoice details and recreate relations
      return tx.invoice.update({
        where: { id },
        data: {
          invoiceNo,
          clientId,
          templateId: templateId || null,
          status,
          totalAmount,
          currency,
          dueDate: dueDate ? new Date(dueDate) : null,
          notes,
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
          customFields: true,
        },
      });
    });

    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

// DELETE — delete an invoice
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await verifyInvoiceOwnership(id, session.userId);
  if (!existing) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete associated line items
      await tx.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
      // 2. Delete custom fields
      await tx.invoiceCustomField.deleteMany({ where: { invoiceId: id } });
      // 3. Delete payments
      await tx.payment.deleteMany({ where: { invoiceId: id } });
      // 4. Delete activity logs
      await tx.activityLog.deleteMany({ where: { invoiceId: id } });
      // 5. Delete invoice itself
      await tx.invoice.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
