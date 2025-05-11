// src/app/api/raw-output-2/route.ts
import { NextResponse } from 'next/server'
import { downloadAllRevisionsFile, getFileRevisionList, loadFileToBigQuery } from '../../../lib/google';
import dayjs from 'dayjs';

export async function GET(req: Request) {



  const { searchParams } = new URL(req.url)
  const fileId = searchParams.get('fileId')

  if (!fileId) {
    return NextResponse.json({ error: 'fileId is required' }, { status: 400 })
  }


  const res = await downloadAllRevisionsFile(fileId, 'file/', 'prefix-');

  for (const [id,rev] of res.entries()){
    const tableSuffix =  `somesuffix_${dayjs(rev.modifiedTime).format('YYYYMMDDHHMM')}_${id}`
    await loadFileToBigQuery(rev.filePath,'test',tableSuffix)
  }
  return NextResponse.json({ message: 'success' })

}
