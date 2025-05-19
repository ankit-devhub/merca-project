// app/api/monthly-all/route.ts

import { generateMonthlyOutputForAll } from '@/lib/core';
import { NextResponse } from 'next/server';

export async function GET() {
    const headers = new Headers({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="monthlyallcustomers.csv"',
        'Cache-Control': 'no-cache',
    });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode("month,customerId,statusStartDate,statusNumber,status,statusType,daysSpent,startDate,endDate\n")
      );
      for (const rec of generateMonthlyOutputForAll()) {
        controller.enqueue(encoder.encode(
          `${rec.month},${rec.customerId},${rec.statusStartDate},${rec.statusNumber},${rec.status},${rec.statusType},${rec.daysSpent},${rec.startDate},${rec.endDate}\n`
        ));
      }
      controller.close();
    },
  });

  return new NextResponse(stream, { headers });
}
