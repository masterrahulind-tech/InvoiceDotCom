import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "csv"; // csv or xlsx

  const headers = ["Name", "SKU", "Category", "Unit", "HSN Code", "MRP", "Sale Price", "Purchase Price", "Tax Rate", "Stock Qty", "Low Stock Alert"];
  const sampleRow = ["Apple iPhone 15", "IPH15-128", "Electronics", "Pcs", "8517", "89900", "79900", "65000", "18", "50", "10"];

  if (type === "csv") {
    const csvContent = `${headers.join(",")}\n${sampleRow.join(",")}\n`;
    const response = new NextResponse(csvContent);
    response.headers.set("Content-Type", "text/csv");
    response.headers.set("Content-Disposition", 'attachment; filename="inventory_template.csv"');
    return response;
  } else if (type === "xlsx") {
    // Generate XLSX
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory Template");
    
    // Write to buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const response = new NextResponse(buf);
    response.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.headers.set("Content-Disposition", 'attachment; filename="inventory_template.xlsx"');
    return response;
  }

  return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
}
