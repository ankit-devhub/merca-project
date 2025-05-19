import { generateStatusRecordsForAll } from '@/lib/core';
import { NextResponse } from 'next/server';

export async function GET() {
    const headers = new Headers({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="status_records.csv"',
        'Cache-Control': 'no-cache',
    });

    const encoder = new TextEncoder();

    // Create a readable stream for the CSV data
    const readableStream = new ReadableStream({
        async start(controller) {
            controller.enqueue(encoder.encode("date,customerId,orderId,transactionNo,statusStartDate,statusCount,status\n"));
            for await (const record of generateStatusRecordsForAll('evaluation')) {
                controller.enqueue(encoder.encode(
                    `${record.date},${record.customerId},${record.orderId || ''},${record.transactionNo || ''},${record.statusStartDate},${record.statusCount},${record.status}\n`
                ));
            }
            controller.close();
        }
    });

    return new NextResponse(readableStream, { headers });
}
