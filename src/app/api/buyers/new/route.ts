import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const buyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\d{10,15}$/),
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  bhk: z.enum(['One', 'Two', 'Three', 'Four', 'Studio']).optional(),
  purpose: z.enum(['Buy', 'Rent']),
  budgetMin: z.number().int().nonnegative().optional(),
  budgetMax: z.number().int().nonnegative().optional(),
  timeline: z.enum(['ThreeMonths', 'SixMonths', 'MoreThanSixMonths', 'Exploring']),
  source: z.enum(['Website', 'Referral', 'WalkIn', 'Call', 'Other']),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum([
    'New',
    'Qualified',
    'Contacted',
    'Visited',
    'Negotiation',
    'Converted',
    'Dropped',
  ]).optional(),
}).refine(
  (data) =>
    // BHK required if propertyType is Apartment or Villa
    !(data.propertyType === 'Apartment' || data.propertyType === 'Villa') ||
    data.bhk !== undefined,
  {
    message: 'BHK is required for Apartment and Villa',
    path: ['bhk'],
  }
)


// Budget validation helper
function validateBudget(budgetMin?: number, budgetMax?: number) {
  if (budgetMin !== undefined && budgetMax !== undefined) {
    return budgetMax >= budgetMin
  }
  return true
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const parsed = buyerSchema.parse(json)

    if (!validateBudget(parsed.budgetMin, parsed.budgetMax)) {
      return NextResponse.json(
        { error: 'budgetMax must be greater than or equal to budgetMin' },
        { status: 400 }
      )
    }

    const ownerId = 'demo-user' // Replace with real auth user ID

    // Prisma expects tags as string[], so pass as-is or undefined
    const buyer = await prisma.buyer.create({
      data: {
        fullName: parsed.fullName,
        email: parsed.email,
        phone: parsed.phone,
        city: parsed.city,
        propertyType: parsed.propertyType,
        bhk: parsed.bhk,
        purpose: parsed.purpose,
        budgetMin: parsed.budgetMin,
        budgetMax: parsed.budgetMax,
        timeline: parsed.timeline,
        source: parsed.source,
        notes: parsed.notes,
        tags: parsed.tags ?? undefined,
        status: parsed.status ?? 'New',
        ownerId,
      },
    })

    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: ownerId,
        changedAt: new Date(),
        diff: { created: true }, // Prisma supports JSON, no need to stringify manually
      },
    })

    return NextResponse.json(buyer, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.issues  }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


