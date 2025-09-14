import { NextRequest, NextResponse } from 'next/server'

// Demo login - just returns a fixed user ID for simplicity
export async function POST(req: NextRequest) {
  // In real app, verify credentials here
  return NextResponse.json({
    userId: 'demo-user',
    token: 'demo-token',
  })
}
