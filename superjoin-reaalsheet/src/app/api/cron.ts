import { NextApiRequest, NextApiResponse } from 'next';
import cron from 'node-cron';
import { syncSheetData } from '../actions/syncsheet';

let isCronRunning = false; 

if (!isCronRunning) {
  isCronRunning = true;

  cron.schedule('2 * * * * *', async () => {
    console.log('Cron job started for Google Sheets sync.');
    try {
      const result = await syncSheetData();
      console.log(result.message);
    } catch (error) {
      console.error('Error during cron job sync:', error);
    }
  });
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'Cron job is running every 2 minutes.' });
}
