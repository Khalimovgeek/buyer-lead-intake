import { NextRequest, NextResponse } from "next/server";
import { parseCsv, importCsvTransactional } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const rows = parseCsv(text) as Record<string, any>[];

    const ownerId = "demo-user"; // replace with auth
    const res = await importCsvTransactional(rows, ownerId);
    if (!res.success) {
      return NextResponse.json({ errors: res.errors }, { status: 400 });
    }
    return NextResponse.json({ created: res.createdCount }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
