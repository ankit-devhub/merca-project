// /app/api/chart-data/route.ts
import { NextResponse } from 'next/server'
import { inputData } from '@/data/input'
import { generateStatusRecords } from '@/lib/core'
import { groupTransactionsByCustomer } from '@/utils/formatter'
import type { ChartDataPayload, InputRecord, PeriodRecord} from '@/types'

export async function GET() {
  const byCust: Record<string, InputRecord[]> = groupTransactionsByCustomer(inputData)

  const allChanges: PeriodRecord[] = Object.entries(byCust)
    .flatMap(([cid]) => generateStatusRecords(cid, 'changes'))

  const monthCount: Record<string, number> = {}
  allChanges.forEach(evt => {
    const m = evt.date.slice(0, 7)
    monthCount[m] = (monthCount[m] || 0) + 1
  })
  const categories = Object.keys(monthCount).sort()
  const series     = categories.map(m => monthCount[m])

  const dist: Record<string, number> = {}
  allChanges.forEach(evt => {
    dist[evt.status] = (dist[evt.status] || 0) + 1
  })
  const labels = Object.keys(dist)
  const dseries = labels.map(l => dist[l])

  const payload: ChartDataPayload = {
    line:  { categories, series },
    donut: { labels, series: dseries }
  }
  return NextResponse.json(payload)
}
