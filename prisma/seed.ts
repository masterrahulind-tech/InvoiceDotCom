import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with Vyapar & Khatabook demo data...");

  // 1. Seed Templates
  const templates = [
    {
      id: "vyapar_gst_v1",
      name: "Vyapar GST Professional",
      vertical: "retail",
      schemaJson: JSON.stringify({
        custom_fields: [
          { key: "po_number", label: "PO / Ref Number", type: "text", required: false },
          { key: "vehicle_no", label: "E-Way / Vehicle No.", type: "text", required: false },
          { key: "delivery_location", label: "Place of Delivery", type: "text", required: false },
        ]
      })
    },
    {
      id: "khatabook_pos_v1",
      name: "Khatabook POS Thermal",
      vertical: "retail",
      schemaJson: JSON.stringify({
        custom_fields: [
          { key: "counter_no", label: "Counter No.", type: "text", required: false },
        ]
      })
    },
    {
      id: "real_estate_broker_v1",
      name: "Real Estate Broker Template",
      vertical: "real_estate",
      schemaJson: JSON.stringify({
        custom_fields: [
          { key: "property_address", label: "Property Address", type: "text", required: true },
          { key: "rera_number", label: "RERA Registration No.", type: "text", required: false },
        ]
      })
    }
  ];

  for (const t of templates) {
    await prisma.invoiceTemplate.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }

  // 2. Demo User
  const user = await prisma.user.upsert({
    where: { phone: "+919876543210" },
    update: { name: "Rajesh Kumar", email: "rajesh@apextech.in" },
    create: {
      phone: "+919876543210",
      name: "Rajesh Kumar",
      email: "rajesh@apextech.in",
    },
  });

  // 3. Demo Business Profile
  let business = await prisma.businessProfile.findFirst({
    where: { userId: user.id },
  });

  if (!business) {
    business = await prisma.businessProfile.create({
      data: {
        userId: user.id,
        businessName: "Apex Digital Solutions & Traders",
        businessType: "registered",
        vertical: "retail",
        gstin: "27AAACA1234A1Z5",
        pan: "AAACA1234A",
        stateCode: "27", // Maharashtra
        address: "Plot 42, Electronics Zone, MIDC Industrial Area, Andheri East, Mumbai - 400093",
        bankName: "HDFC Bank",
        bankAccountNo: "50200084920192",
        ifscCode: "HDFC0000240",
        branchName: "Andheri East Branch",
        upiId: "apextech@hdfcbank",
        logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      },
    });
  } else {
    await prisma.businessProfile.update({
      where: { id: business.id },
      data: {
        gstin: "27AAACA1234A1Z5",
        stateCode: "27",
        address: "Plot 42, Electronics Zone, MIDC Industrial Area, Andheri East, Mumbai - 400093",
        bankName: "HDFC Bank",
        bankAccountNo: "50200084920192",
        ifscCode: "HDFC0000240",
        branchName: "Andheri East Branch",
        upiId: "apextech@hdfcbank",
      }
    });
  }

  // 4. Seed Inventory Items
  const itemsData = [
    {
      sku: "ITEM-101",
      name: "Dual-Band AC1200 WiFi Router",
      category: "Networking",
      unit: "Pcs",
      hsnCode: "8517",
      salePrice: 2499,
      purchasePrice: 1650,
      taxRate: 18,
      stockQty: 45,
      lowStockThreshold: 10,
    },
    {
      sku: "ITEM-102",
      name: "27-inch 4K IPS Monitor",
      category: "Hardware",
      unit: "Pcs",
      hsnCode: "8528",
      salePrice: 18500,
      purchasePrice: 14200,
      taxRate: 18,
      stockQty: 8,
      lowStockThreshold: 10, // Will show low stock warning!
    },
    {
      sku: "ITEM-103",
      name: "Cat6 Ethernet Cable (300m Roll)",
      category: "Cables",
      unit: "Roll",
      hsnCode: "8544",
      salePrice: 4200,
      purchasePrice: 2900,
      taxRate: 18,
      stockQty: 18,
      lowStockThreshold: 5,
    },
    {
      sku: "ITEM-104",
      name: "USB-C Multiport Adapter Hub 7-in-1",
      category: "Accessories",
      unit: "Pcs",
      hsnCode: "8504",
      salePrice: 1299,
      purchasePrice: 750,
      taxRate: 18,
      stockQty: 3, // Low stock warning!
      lowStockThreshold: 15,
    },
    {
      sku: "ITEM-105",
      name: "Ergonomic Wireless Optical Mouse",
      category: "Accessories",
      unit: "Pcs",
      hsnCode: "8471",
      salePrice: 899,
      purchasePrice: 450,
      taxRate: 18,
      stockQty: 60,
      lowStockThreshold: 10,
    }
  ];

  for (const item of itemsData) {
    const existing = await prisma.item.findFirst({
      where: { businessProfileId: business.id, name: item.name },
    });
    if (!existing) {
      await prisma.item.create({
        data: {
          ...item,
          businessProfileId: business.id,
          stockMovements: {
            create: {
              changeQty: item.stockQty,
              movementType: "purchase",
              notes: "Initial inventory seed stock",
            }
          }
        }
      });
    }
  }

  // 5. Seed Parties (Customers & Suppliers)
  const partiesData = [
    {
      name: "Sharma Enterprises",
      partyType: "customer",
      phone: "+919820123456",
      email: "accounts@sharmaent.in",
      address: "102 Commercial Chambers, MG Road, Pune, Maharashtra 411001",
      gstin: "27AAAFS9876K1Z9",
      stateCode: "27", // Intra-state (CGST + SGST)
      openingBalance: 24500,
      balanceType: "receivable", // "You'll Receive"
      creditLimit: 50000,
    },
    {
      name: "Mehta Wholesalers & Distributors",
      partyType: "supplier",
      phone: "+919930456789",
      email: "sales@mehtawholesale.com",
      address: "G-14 Industrial Estate, Ring Road, Ahmedabad, Gujarat 380015",
      gstin: "24AABCM1122D1Z1",
      stateCode: "24", // Inter-state (IGST)
      openingBalance: 8200,
      balanceType: "payable", // "You'll Give"
      creditLimit: 100000,
    },
    {
      name: "Metro Cyber Cafe & Tech Hub",
      partyType: "customer",
      phone: "+919711002233",
      email: "metrocyber@gmail.com",
      address: "Shop 12, Station Plaza, Thane West, Maharashtra 400601",
      gstin: "27AABCM5544P1Z3",
      stateCode: "27",
      openingBalance: 5600,
      balanceType: "receivable",
      creditLimit: 25000,
    },
    {
      name: "Rohan Varma (Walk-in Customer)",
      partyType: "customer",
      phone: "+919123456789",
      email: "rohan.v@gmail.com",
      address: "B-402 Sun Towers, Borivali, Mumbai",
      gstin: "",
      stateCode: "27",
      openingBalance: 0,
      balanceType: "receivable",
    }
  ];

  const createdParties: any = {};

  for (const party of partiesData) {
    let existing = await prisma.client.findFirst({
      where: { businessProfileId: business.id, name: party.name }
    });
    if (!existing) {
      existing = await prisma.client.create({
        data: {
          ...party,
          businessProfileId: business.id,
        }
      });
    }
    createdParties[party.name] = existing;
  }

  // 6. Seed Sample Khatabook Ledger Transactions
  const sharma = createdParties["Sharma Enterprises"];
  if (sharma) {
    const txCount = await prisma.partyTransaction.count({ where: { clientId: sharma.id } });
    if (txCount === 0) {
      await prisma.partyTransaction.createMany({
        data: [
          {
            businessProfileId: business.id,
            clientId: sharma.id,
            type: "GAVE", // Udhaar / Bill created
            amount: 34500,
            paymentMode: "bank",
            notes: "Invoice #INV-2026-001 issued for IT Equipment supply",
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            businessProfileId: business.id,
            clientId: sharma.id,
            type: "GOT", // Payment Received
            amount: 10000,
            paymentMode: "upi",
            notes: "Partial payment received via PhonePe UPI",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          }
        ]
      });
    }
  }

  // 7. Seed Sample Business Expenses
  const expCount = await prisma.expense.count({ where: { businessProfileId: business.id } });
  if (expCount === 0) {
    await prisma.expense.createMany({
      data: [
        {
          businessProfileId: business.id,
          category: "Rent",
          amount: 25000,
          taxAmount: 4500,
          vendorName: "Godrej Commercial Real Estate",
          gstin: "27AAACG1111A1Z2",
          paymentMode: "bank",
          notes: "Monthly office space rent for July 2026",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          businessProfileId: business.id,
          category: "Utility",
          amount: 4200,
          taxAmount: 756,
          vendorName: "Airtel Broadband Ltd",
          paymentMode: "upi",
          notes: "Leased line internet bill",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          businessProfileId: business.id,
          category: "Office",
          amount: 1500,
          taxAmount: 270,
          vendorName: "Stationery Mart",
          paymentMode: "cash",
          notes: "Printing paper & toner cartridges",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        }
      ]
    });
  }

  // 8. Seed Sample GST Invoice
  const invCount = await prisma.invoice.count({ where: { businessProfileId: business.id } });
  if (invCount === 0 && sharma) {
    const routerItem = await prisma.item.findFirst({ where: { name: "Dual-Band AC1200 WiFi Router" } });
    const monitorItem = await prisma.item.findFirst({ where: { name: "27-inch 4K IPS Monitor" } });

    const qty1 = 5;
    const rate1 = 2499;
    const amount1 = qty1 * rate1; // 12495
    const cgst1 = amount1 * 0.09; // 9% CGST
    const sgst1 = amount1 * 0.09; // 9% SGST

    const qty2 = 1;
    const rate2 = 18500;
    const amount2 = qty2 * rate2; // 18500
    const cgst2 = amount2 * 0.09;
    const sgst2 = amount2 * 0.09;

    const totalTaxable = amount1 + amount2; // 30995
    const totalCgst = cgst1 + cgst2; // 2789.55
    const totalSgst = sgst1 + sgst2; // 2789.55
    const totalAmount = totalTaxable + totalCgst + totalSgst; // 36574.10

    await prisma.invoice.create({
      data: {
        invoiceNo: "INV-2026-001",
        businessProfileId: business.id,
        clientId: sharma.id,
        templateId: "vyapar_gst_v1",
        billingType: "B2B",
        placeOfSupply: "27",
        status: "partially_paid",
        taxableAmount: totalTaxable,
        cgstAmount: totalCgst,
        sgstAmount: totalSgst,
        igstAmount: 0,
        totalAmount: totalAmount,
        paidAmount: 10000,
        notes: "Thank you for your business! All items include standard manufacturer warranty.",
        terms: "Payment due within 15 days of invoice date. 18% per annum interest on overdue payments.",
        lineItems: {
          create: [
            {
              itemId: routerItem?.id,
              description: "Dual-Band AC1200 WiFi Router",
              hsnCode: "8517",
              qty: qty1,
              unit: "Pcs",
              rate: rate1,
              taxPercent: 18,
              cgstAmount: cgst1,
              sgstAmount: sgst1,
              igstAmount: 0,
              amount: amount1,
            },
            {
              itemId: monitorItem?.id,
              description: "27-inch 4K IPS Monitor",
              hsnCode: "8528",
              qty: qty2,
              unit: "Pcs",
              rate: rate2,
              taxPercent: 18,
              cgstAmount: cgst2,
              sgstAmount: sgst2,
              igstAmount: 0,
              amount: amount2,
            }
          ]
        },
        payments: {
          create: {
            amount: 10000,
            mode: "upi",
            transactionRef: "UPI/3920192019/PhonePe",
            status: "success",
          }
        }
      }
    });
  }

  console.log("Database seeded successfully with Vyapar & Khatabook demo data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
