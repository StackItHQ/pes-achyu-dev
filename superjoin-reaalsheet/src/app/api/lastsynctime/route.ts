import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const latestSync = await prisma.sheet.findFirst({
      orderBy: {
        lastSyncedAt: 'desc',
      },
      select: {
        lastSyncedAt: true,
      },
    });

    return NextResponse.json({ 
      lastSyncTime: latestSync?.lastSyncedAt ? latestSync.lastSyncedAt.toISOString() : null 
    });
  } catch (error) {
    console.error('Error fetching last sync time:', error);
    return NextResponse.json({ error: 'Failed to fetch last sync time' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}