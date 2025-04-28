import { STATUS, STATUS_NAMES } from '@/constants/status';
import type { Rule } from '@/types';

const RULES: Rule[] = [
  { status: STATUS.ACQUIRED, nextDate: 91, yes: STATUS.ACTIVE_LEADING, no: STATUS.EARLY_DORMANCY, status_name: STATUS_NAMES.ACQUIRED },
  { status: STATUS.ACTIVE_LEADING, nextDate: 91, yes: STATUS.ACTIVE_LEADING, no: STATUS.EARLY_DORMANCY, status_name: STATUS_NAMES.ACTIVE },
  { status: STATUS.ACTIVE_REGULAR, nextDate: 91, yes: STATUS.ACTIVE_LEADING, no: STATUS.EARLY_DORMANCY, status_name: STATUS_NAMES.ACTIVE },
  { status: STATUS.ACTIVE_DELAYED, nextDate: 91, yes: STATUS.ACTIVE_LEADING, no: STATUS.EARLY_DORMANCY, status_name: STATUS_NAMES.ACTIVE },
  { status: STATUS.ACTIVE_WINBACK, nextDate: 91, yes: STATUS.ACTIVE_LEADING, no: STATUS.EARLY_DORMANCY, status_name: STATUS_NAMES.ACTIVE },
  { status: STATUS.EARLY_DORMANCY, nextDate: 91, yes: STATUS.ACTIVE_REGULAR, no: STATUS.AT_RISK, status_name: STATUS_NAMES.EARLY_DORMANCY },
  { status: STATUS.AT_RISK, nextDate: 91, yes: STATUS.ACTIVE_DELAYED, no: STATUS.INACTIVE, status_name: STATUS_NAMES.AT_RISK },
  { status: STATUS.INACTIVE, nextDate: 182, yes: STATUS.ACTIVE_WINBACK, no: STATUS.LAPSED, status_name: STATUS_NAMES.INACTIVE },
  { status: STATUS.LAPSED, nextDate: 91, yes: STATUS.ACTIVE_WINBACK, no: STATUS.LAPSED, status_name: STATUS_NAMES.LAPSED },
]


export const getRule = (status: string): Rule | undefined =>
  RULES.find(r => r.status === status)

export const getStatusName = (status: string): string =>
  getRule(status)?.status_name || STATUS_NAMES.ACQUIRED
