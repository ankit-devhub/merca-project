import { NextResponse } from 'next/server'
import { generateOutput2 } from '@/lib/core'

export async function GET(req: Request) {
  const customerId = new URL(req.url).searchParams.get('customerId')
  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
  }
  return NextResponse.json(generateOutput2(customerId))
}
