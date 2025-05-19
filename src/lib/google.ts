import { google } from 'googleapis'
import path from 'path';
import fs from 'fs';
import dayjs from 'dayjs';
import { BigQuery } from '@google-cloud/bigquery';
import { CLOUD_SERVICE_KEY } from '../../env';

const serviceKeyInstance = new google.auth.JWT(
  CLOUD_SERVICE_KEY.client_email,
  null,
  CLOUD_SERVICE_KEY.private_key,
  [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/bigquery',
    'https://www.googleapis.com/auth/bigquery.insertdata'
  ],
  null,
);

google.options({
  auth: serviceKeyInstance,
});

const drive = google.drive({ version: 'v3' });
const bigquery = new BigQuery({
  projectId: CLOUD_SERVICE_KEY.project_id,
  credentials: {
    client_id: CLOUD_SERVICE_KEY.client_id,
    client_email: CLOUD_SERVICE_KEY.client_email,
    private_key: CLOUD_SERVICE_KEY.private_key,
  },
});


export const getFileRevisionList = async (fileId: string) => {
  const { data } = await drive.revisions.list({
    fileId: fileId,
    fields: 'revisions(id, modifiedTime, originalFilename)',
  });
  return data.revisions.map(({ modifiedTime, ...rest }, i) => ({
    ...rest,
    modifiedTime: dayjs(modifiedTime).format('YYYYMMDDHHMM'),
  }));
}




export const downloadAllRevisionsFile = async (fileId: string, destDir: string, prefix: string) => {
  const allRevisions = await getFileRevisionList(fileId);
  await fs.promises.mkdir(destDir, { recursive: true });
  const tasks = allRevisions.map((rev, index) => {
    const fileName = rev.originalFilename
    const filePath = path.join(destDir, `${prefix}${dayjs(rev.modifiedTime).format('YYYYMMDDHHMM')}${index}-${fileName}`);
    const downloadPromise = new Promise<void>(async (resolve, reject) => {
      try {
        const res = await drive.revisions.get({
          fileId,
          revisionId: rev.id,
          alt: 'media',
        }, { responseType: 'stream' });


        const w = fs.createWriteStream(filePath);
        res.data
          .on('error', reject)
          .pipe(w)
          .on('error', reject)
          .on('finish', resolve)
      }
      catch (error) {
        console.error('Error downloading file:', error);
        reject(error);
      }
    })
    return { promise: downloadPromise, info: { ...rev, filePath } };
  })

  await Promise.all(tasks.map(t => t.promise))
  return tasks.map(t => t.info)
}




export const loadFileToBigQuery = async (filePath: string, datasetId: string, tableId: string) => {

  

  const metadata = {
    sourceFormat: 'CSV',
    skipLeadingRows: 1,
    autodetect: true,
    writeDisposition: 'WRITE_APPEND',
    location: 'US',
  };


  try {
    const [job] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .load(filePath, metadata);

    if (job.status.errorResult) {
      console.error('Error loading file to BigQuery:', job.status.errorResult);
      throw new Error(`BigQuery load job failed: ${job.status.errorResult.message}`);
    }
  }
  catch (error) {
    console.error('Error loading file to BigQuery:', error);
    throw new Error(`BigQuery load job failed: ${error}`);
  }
  finally {
    try {
      await fs.promises.unlink(filePath)
    }
    catch (e) {
      console.error('Error deleting file:', e);
    }
  }
}