import { NextResponse } from 'next/server';
import { startSyncJob } from '@/lib/syncschedule';

export async function POST() {
  startSyncJob();
  return NextResponse.json({ message: 'Auto sync started' });
}