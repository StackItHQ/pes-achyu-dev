import { NextResponse } from 'next/server';
import { stopSyncJob } from '@/lib/syncschedule';

export async function POST() {
  stopSyncJob();
  return NextResponse.json({ message: 'Auto sync stopped' });
}