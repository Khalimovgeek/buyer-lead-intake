import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ZodError } from "zod";
import { buyerSchema } from "@/lib/validators/buyer";
import { rateLimit } from "@/lib/rateLimit";
const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)

    // Search query for buyer's fullName or email or phone (case-insensitive)
    const search = searchParams.get('search') || ''

    // Basic filtering example (optional): filter by status
    const status = searchParams.get('status') || undefined

    // Build Prisma filters
    const where: any = {}

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    const totalCount = await prisma.buyer.count({ where })

    const buyers = await prisma.buyer.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        city: true,
        propertyType: true,
        status: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      buyers,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("host") || "anon";
    const rl = rateLimit(ip, 20, 60 * 1000); // 20 requests/min per IP
    if (!rl.ok) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const json = await req.json();

    const parsed = buyerSchema.parse(json);

    const ownerId = json.ownerId ?? "demo-user"; // replace with auth session user id

    const buyer = await prisma.buyer.create({
      data: {
        fullName: parsed.fullName,
        email: parsed.email || null,
        phone: parsed.phone,
        city: parsed.city,
        propertyType: parsed.propertyType,
        bhk: parsed.bhk ?? null,
        purpose: parsed.purpose,
        budgetMin: parsed.budgetMin ?? null,
        budgetMax: parsed.budgetMax ?? null,
        timeline: parsed.timeline,
        source: parsed.source,
        notes: parsed.notes ?? null,
        tags: parsed.tags ?? [],
        status: parsed.status ?? "New",
        ownerId,
      },
    });

    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: ownerId,
        changedAt: new Date(),
        diff: { created: true },
      },
    });

    return NextResponse.json(buyer, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      // prefer flatten for frontend-friendly structure
      const flat = error.flatten();
      return NextResponse.json({ errors: flat }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}