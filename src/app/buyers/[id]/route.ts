import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: { id: params.id }
    })
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }
    return NextResponse.json(buyer)
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
