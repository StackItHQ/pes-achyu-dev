'use server';

import { google } from "googleapis";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function convertToGMT530(date: Date) {
  const offset = 5.5 * 60 * 60 * 1000; // Offset for GMT +5:30 in milliseconds
  const localTime = new Date(date.getTime() + offset);
  return localTime;
}

export async function syncSheetData() {
  try {
    const glAuth = await google.auth.getClient({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        universe_domain: "googleapis.com"
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const glSheets = google.sheets({ version: "v4", auth: glAuth });

    const response = await glSheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1', // Assuming you want to fetch all data from Sheet1
    });

    const sheetData = response.data.values;

    if (sheetData && Array.isArray(sheetData)) {
      // Fetch all data from the database
      const dbData = await prisma.sheet.findMany();

      // Create a map of existing database rows for quick lookup
      const dbMap = new Map(dbData.map(row => [row.rowId, row]));

      const now = new Date();

      // Update or insert rows from Google Sheets into the database
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        const rowId = row[0];
        const dbRow = dbMap.get(rowId);

        if (dbRow) {
          // Check if the row has changed
          if (
            dbRow.column1 !== row[1] ||
            dbRow.column2 !== row[2] ||
            dbRow.column3 !== row[3]
          ) {
            // Update the existing row and its lastSyncedAt timestamp
            await prisma.sheet.update({
              where: { id: dbRow.id },
              data: {
                column1: row[1] || '',
                column2: row[2] || '',
                column3: row[3] || '',
                lastSyncedAt: now,
              },
            });
          }
        } else {
          // Insert a new row
          await prisma.sheet.create({
            data: {
              rowId: rowId,
              column1: row[1] || '',
              column2: row[2] || '',
              column3: row[3] || '',
              lastSyncedAt: now,
            },
          });
        }
      }
    }

    // Fetch all data from the database again to get the updated values
    const updatedDbData = await prisma.sheet.findMany();

    const updatedSheetData = [
      ['rowId', 'column1', 'column2', 'column3', 'updatedAt', 'lastSyncedAt'], 
      ...updatedDbData.map(row => [
        row.rowId,
        row.column1,
        row.column2,
        row.column3,
        convertToGMT530(row.updatedAt).toISOString().replace('Z', ''),
        row.lastSyncedAt ? convertToGMT530(row.lastSyncedAt).toISOString().replace('Z', '') : '',
      ])
    ];

    await glSheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1',
      valueInputOption: 'RAW',
      requestBody: { values: updatedSheetData },
    });

    return { success: true, message: 'Sync completed successfully' };
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, message: 'Sync failed', error: error instanceof Error ? error.message : String(error) };
  } finally {
    await prisma.$disconnect();
  }
}

export async function startAutoSync() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/startAutoSync`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to start auto sync: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in startAutoSync:', error);
    throw error;
  }
}

export async function stopAutoSync() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stopAutoSync`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to stop auto sync: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in stopAutoSync:', error);
    throw error;
  }
}