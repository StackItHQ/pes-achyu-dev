'use server';

import { google } from "googleapis";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function syncSheetData() {
  try {
    const glAuth = await google.auth.getClient({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
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
      // Clear existing data in the database
      await prisma.sheet.deleteMany({});

      // Insert all rows from Google Sheets into the database
      for (let i = 1; i < sheetData.length; i++) { // Assuming first row is header
        const row = sheetData[i];
        await prisma.sheet.create({
          data: {
            rowId: row[0],
            column1: row[1] || '',
            column2: row[2] || '',
            column3: row[3] || '',
          },
        });
      }
    }

    // Fetch all data from the database
    const dbData = await prisma.sheet.findMany();

    // Prepare data for updating Google Sheets
    const updatedSheetData = [
      ['rowId', 'column1', 'column2', 'column3', 'updatedAt'], // Header row
      ...dbData.map(row => [
        row.rowId,
        row.column1,
        row.column2,
        row.column3,
        row.updatedAt.toISOString(),
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