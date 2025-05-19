import { NextResponse } from 'next/server'
import { downloadAllRevisionsFile, getfilepublicaccessibleUrl, getFileRevisionList, loadFileToBigQuery } from '../../../lib/google';
import dayjs from 'dayjs';

export async function GET(req: Request) {



  const { searchParams } = new URL(req.url)
  const fileId = searchParams.get('fileId')

  if (!fileId) {
    return NextResponse.json({ error: 'fileId is required' }, { status: 400 })
  }

  // const res = await downloadAllRevisionsFile(fileId, 'file/', 'prefix-');

  const allRevisions = await getFileRevisionList(fileId);

  const u = await getfilepublicaccessibleUrl(fileId, allRevisions[0].id)


  // for (const [id, rev] of res.entries()) {
  //   const tableSuffix = `somesuffix_${dayjs(rev.modifiedTime).format('YYYYMMDDHHMM')}_${id}`
  //   await loadFileToBigQuery(rev.filePath, 'test', tableSuffix)
  // }
  return NextResponse.json({ message: 'File downloaded successfully', data: u })

}
