import { NextResponse } from 'next/server'
import { generateStatusRecords } from '@/lib/core'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const customerId = url.searchParams.get('customerId')
  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
  }
  const output1 = generateStatusRecords(customerId, 'evaluation')
  return NextResponse.json(output1)
}
