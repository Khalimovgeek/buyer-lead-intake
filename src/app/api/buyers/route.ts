import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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