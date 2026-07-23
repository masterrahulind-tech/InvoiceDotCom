import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.invoiceTemplate.findMany({
      orderBy: { vertical: "asc" },
    });

    // Parse schemaJson before sending back
    const parsedTemplates = templates.map((t) => {
      let schema = { custom_fields: [] };
      try {
        schema = JSON.parse(t.schemaJson);
      } catch (err) {
        console.error(`Failed to parse schemaJson for template ${t.id}:`, err);
      }
      return {
        ...t,
        schemaJson: schema,
      };
    });

    return NextResponse.json({ templates: parsedTemplates });
  } catch (error) {
    console.error("Templates fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
