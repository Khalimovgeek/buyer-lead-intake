import { parse } from "csv-parse/sync";
import { buyerSchema, csvHeaders } from "@/lib/validators/buyer";
import { prisma } from "@/lib/prisma";

export type BuyerCsvRow = {
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: string;
  budgetMax?: string;
  timeline: string;
  source: string;
  notes?: string;
  tags?: string;
  status?: string;
};

export function parseCsv(text: string): BuyerCsvRow[] {
  const records = parse<BuyerCsvRow>(text, {
    columns: true,
    skip_empty_lines: true,
  });
  return records;
}

export function validateCsvRow(row: Record<string, any>) {
  // normalize tags comma separated
  if (typeof row.tags === "string" && row.tags.trim() !== "") {
    row.tags = row.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
  } else {
    row.tags = [];
  }
  // coerce numeric fields
  if (row.budgetMin === "") delete row.budgetMin;
  if (row.budgetMax === "") delete row.budgetMax;
  try {
    const parsed = buyerSchema.parse(row);
    return { ok: true, parsed };
  } catch (err) {
    return { ok: false, error: (err as any).flatten?.() ?? (err as any).issues ?? String(err) };
  }
}

export async function importCsvTransactional(rows: Record<string, any>[], ownerId: string) {
  if (rows.length > 200) throw new Error("Max 200 rows allowed");
  const errors: { row: number; message: any }[] = [];
  const toInsert: any[] = [];
  rows.forEach((row, idx) => {
    const r = validateCsvRow(row);
    if (!r.ok) {
      errors.push({ row: idx + 1, message: r.error });
    } else {
      toInsert.push(r.parsed);
    }
  });

  if (errors.length) {
    return { success: false, errors };
  }

  // Transactional insert
  const created: any[] = [];
  await prisma.$transaction(async (tx) => {
    for (const item of toInsert) {
      const buyer = await tx.buyer.create({
        data: {
          fullName: item.fullName,
          email: item.email || null,
          phone: item.phone,
          city: item.city,
          propertyType: item.propertyType,
          bhk: item.bhk ?? null,
          purpose: item.purpose,
          budgetMin: item.budgetMin ?? null,
          budgetMax: item.budgetMax ?? null,
          timeline: item.timeline,
          source: item.source,
          notes: item.notes ?? null,
          tags: item.tags ?? [],
          status: item.status ?? "New",
          ownerId,
        },
      });
      await tx.buyerHistory.create({
        data: { buyerId: buyer.id, changedBy: ownerId, diff: { created: true } },
      });
      created.push(buyer);
    }
  });

  return { success: true, createdCount: created.length };
}
