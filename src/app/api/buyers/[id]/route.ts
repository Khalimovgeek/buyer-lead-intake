import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Reuse or define your buyer validation schema here for update
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
})

function validateBudget(budgetMin?: number, budgetMax?: number) {
  if (budgetMin !== undefined && budgetMax !== undefined) {
    return budgetMax >= budgetMin
  }
  return true
}

// PUT handler - update buyer lead
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const json = await req.json()
    const parsed = buyerSchema.parse(json)

    if (!validateBudget(parsed.budgetMin, parsed.budgetMax)) {
      return NextResponse.json(
        { error: 'budgetMax must be greater than or equal to budgetMin' },
        { status: 400 }
      )
    }

    const id = params.id

    // Fetch existing buyer to check existence
    const existingBuyer = await prisma.buyer.findUnique({ where: { id } })
    if (!existingBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }

    // Update buyer record
    const updatedBuyer = await prisma.buyer.update({
      where: { id },
      data: {
        ...parsed,
        tags: parsed.tags ?? undefined,
      },
    })

    // Add history entry (simplified diff)
    await prisma.buyerHistory.create({
      data: {
        buyerId: id,
        changedBy: 'demo-user', // replace with real user
        changedAt: new Date(),
        diff: JSON.stringify({ updated: true }),
      },
    })

    return NextResponse.json(updatedBuyer)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE handler - delete buyer lead
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check exists
    const existingBuyer = await prisma.buyer.findUnique({ where: { id } })
    if (!existingBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }

    // Delete buyer_history first (for foreign key constraints)
    await prisma.buyerHistory.deleteMany({ where: { buyerId: id } })

    // Delete buyer
    await prisma.buyer.delete({ where: { id } })

    return NextResponse.json({ message: 'Buyer deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
