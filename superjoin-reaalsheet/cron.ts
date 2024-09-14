import cron from 'node-cron';
import fetch from 'node-fetch';

async function performSync() {
  try {
    const response = await fetch('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Sync completed successfully:', result);
  } catch (error) {
    console.error('Cron job error:', error);
  }
}

// Schedule the cron job to run every 5 minutes
const job = cron.schedule('*/5 * * * *', performSync, {
  scheduled: false,
  timezone: "America/New_York" // Adjust this to your timezone
});

// Start the cron job
job.start();

console.log('Cron job scheduled');

// Graceful shutdown
process.on('SIGINT', () => {
  job.stop();
  console.log('Cron job stopped');
  process.exit(0);
});

// Keep the script running
process.stdin.resume();