import { STATUS } from '@/constants/status'
import { PeriodRecord, MonthlyOutput, OutputMode } from '@/types'
import { formatStatusCount, groupTransactionsByCustomer } from '@/utils/formatter'
import dayjs from 'dayjs'
import { getRule, getStatusName } from './rules'
import { inputData } from '@/data/input'


const transactionsGroupedByCustomer = groupTransactionsByCustomer(inputData)

export function generateStatusRecords(
  customerId: string,
  mode: OutputMode = 'evaluation'
): PeriodRecord[] {
  const out: PeriodRecord[] = []


  let status: string = STATUS.ACQUIRED
  let statusCount = 1
  let txnCount = 1
  let statusStart = dayjs(transactionsGroupedByCustomer[customerId][0].IM01)
  let windowStart = statusStart
  const today = dayjs()

  out.push({
    date: statusStart.format('YYYY-MM-DD'),
    customerId,
    orderId: transactionsGroupedByCustomer[customerId][0].OM02,
    transactionNo: txnCount,
    statusStartDate: statusStart.format('YYYY-MM-DD'),
    statusCount: formatStatusCount(statusCount),
    status: getStatusName(status),
  })

  while (windowStart.isBefore(today)) {
    const rule = getRule(status)
    const windowEnd = windowStart.add(rule.nextDate, 'day')
    const periodEnd = windowEnd.isBefore(today) ? windowEnd : today

    const found = transactionsGroupedByCustomer[customerId].find(tx =>
      dayjs(tx.IM01).isAfter(windowStart) &&
      (dayjs(tx.IM01).isBefore(periodEnd) || dayjs(tx.IM01).isSame(periodEnd))
    )

    const hasTxn = Boolean(found)
    const txnDate = hasTxn ? dayjs(found!.IM01) : undefined
    const nextStatus = hasTxn ? rule.yes : rule.no
    const milestone = hasTxn ? txnDate! : windowEnd

    let ord: number | null = null
    let txnNo: number | null = null
    if (hasTxn) {
      txnCount++
      txnNo = txnCount
      ord = found!.OM02
    }

    const statusChanged = nextStatus !== status

    if (statusChanged) {
      status = nextStatus
      statusCount++
      statusStart = hasTxn ? txnDate! : windowEnd
    }
    const shouldPush =
      mode === 'evaluation' ||
      (mode === 'changes' && statusChanged)

    if (shouldPush) {
      out.push({
        date: milestone.format('YYYY-MM-DD'),
        customerId,
        orderId: ord,
        transactionNo: txnNo,
        statusStartDate: statusStart.format('YYYY-MM-DD'),
        statusCount: formatStatusCount(statusCount),
        status: getStatusName(status),
      })
    }

    windowStart = milestone
  }

  return out
}


export function generateOutput2(
  customerId: string,
): MonthlyOutput[] {
  const m1 = generateStatusRecords(customerId, 'changes')
  if (!m1.length) return []

  const segments = m1.map((m, i) => {
    const start = dayjs(m.date)
    const end = i + 1 < m1.length
      ? dayjs(m1[i + 1].date).subtract(1, 'day')
      : dayjs()
    return {
      start,
      end,
      statusStartDate: m.statusStartDate,
      statusNumber: m.statusCount,
      status: m.status,
    }
  })

  const timeline: MonthlyOutput[] = []
  const firstMonth = segments[0].start.startOf('month')
  const lastMonth = dayjs().startOf('month')
  let cursor = firstMonth

  while (!cursor.isAfter(lastMonth)) {
    const ms = cursor.startOf('month')
    const me = cursor.endOf('month')
    const key = ms.format('YYYY-MM')

    for (const seg of segments) {
      if (seg.end.isBefore(ms) || seg.start.isAfter(me)) continue

      const sliceStart = seg.start.isAfter(ms) ? seg.start : ms
      const sliceEnd = seg.end.isAfter(me) || seg.end.isSame(me)
        ? me
        : seg.end

      const isFull = sliceEnd.format('YYYY-MM-DD') === me.format('YYYY-MM-DD')

      timeline.push({
        month: key,
        customerId,
        statusStartDate: seg.statusStartDate,
        statusNumber: seg.statusNumber,
        status: seg.status,
        statusType: isFull ? 'Final for Month' : 'Interim',
        daysSpent: sliceEnd.diff(sliceStart, 'day') + 1,
        startDate: sliceStart.format('YYYY-MM-DD'),
        endDate: sliceEnd.format('YYYY-MM-DD'),
      })
    }

    cursor = cursor.add(1, 'month')
  }

  return timeline.sort((a, b) => {
    const dm = dayjs(a.month + '-01').diff(dayjs(b.month + '-01'))
    return dm !== 0
      ? dm
      : dayjs(a.startDate).diff(dayjs(b.startDate))
  })
}