export interface InputRecord {
  CM01: string
  IM01: string
  OM02: number
}
export interface PeriodRecord {
  date: string
  customerId: string
  orderId: number | null
  transactionNo: number | null
  statusStartDate: string
  statusCount: string
  status: string
}

export interface MonthlyOutput {
  month: string
  customerId: string
  statusStartDate: string
  statusNumber: string
  status: string
  statusType: 'Interim' | 'Final for Month'
  daysSpent: number
  startDate: string
  endDate: string
}
export interface Rule {
  status: string
  nextDate: number
  yes: string
  no: string
  status_name: string
}

export type ChartDataPayload = {
  line: {
    categories: string[]
    series: number[]
  }
  donut: {
    labels: string[]
    series: number[]
  }
}

export type OutputMode = 'evaluation' | 'changes'