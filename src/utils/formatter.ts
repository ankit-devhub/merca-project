

import type { InputRecord } from '@/types';
import dayjs from 'dayjs';

export const formatStatusCount = (n: number) => `S${String(n).padStart(3, '0')}`

export const groupTransactionsByCustomer = (input: InputRecord[]) => {
  const map: Record<string, InputRecord[]> = {};
  input.forEach(rec => {
    if (!map[rec.CM01]) map[rec.CM01] = [];
    map[rec.CM01].push(rec);
  });
  Object.values(map).forEach(records => {
    records.sort((a, b) => dayjs(a.IM01).diff(dayjs(b.IM01)));
  });

  return map;
};