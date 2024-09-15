import { NextResponse } from 'next/server';
import { isSyncJobRunning } from '@/lib/syncschedule';

export async function GET() {
  return NextResponse.json({ isRunning: isSyncJobRunning() });
}