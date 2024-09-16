import cron from 'node-cron';
import { syncSheetData } from '../app/actions/syncsheet';

let syncJob: cron.ScheduledTask | null = null;

export function startSyncJob() {
  if (syncJob) {
    console.log('Sync job is already running');
    return;
  }

  syncJob = cron.schedule('*/2 * * * * *', async () => {
    console.log('Running sync job');
    try {
      const result = await syncSheetData();
      console.log('Sync result:', result);
    } catch (error) {
      console.error('Error in sync job:', error);
    }
  });

  console.log('Sync job scheduled');
}

export function stopSyncJob() {
  if (syncJob) {
    syncJob.stop();
    syncJob = null;
    console.log('Sync job stopped');
  } else {
    console.log('No sync job is running');
  }
}

export function isSyncJobRunning() {
  return syncJob !== null;
}
