export const STATUS = {
  ACQUIRED: 'Acquired',
  EARLY_DORMANCY: 'Early Dormancy',
  AT_RISK: 'At-Risk',
  INACTIVE: 'Inactive',
  LAPSED: 'Lapsed',
  ACTIVE_LEADING: 'Active Leading',
  ACTIVE_REGULAR: 'Active Regular',
  ACTIVE_DELAYED: 'Active Delayed',
  ACTIVE_WINBACK: 'Active Winback',
} as const

export const STATUS_NAMES = {
  ACQUIRED: '01 - Acquired',
  ACTIVE: '02 - Active',
  EARLY_DORMANCY: '03 - Early Dormancy',
  AT_RISK: '04 - At Risk',
  INACTIVE: '05 - Inactive',
  LAPSED: '06 - Lapsed',
} as const