import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const prisma = new PrismaClient();
const SPREADSHEET_ID = '1n5hTeyBvgXXTdUAWnOxWu84Sc0PRMLcwhRBFXFwR_rY';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthClient() {
  const auth = new JWT({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: SCOPES,
  });
  await auth.authorize();
  return auth;
}

async function getEntireSheetData() {
  const auth = await google.auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1', // This will get all data from Sheet1
    });

    return response.data.values;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

async function updateEntireSheetData(values: any[][]) {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1', // This will update all of Sheet1
      valueInputOption: 'RAW',
      requestBody: { values },
    });
  } catch (error) {
    console.error('Error updating sheet data:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch all data from Google Sheets
    const sheetData = await getEntireSheetData();

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

    // Update entire Google Sheet with the latest data
    await updateEntireSheetData(updatedSheetData);

    res.status(200).json({ message: 'Sync completed successfully' });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed', details: error instanceof Error ? error.message : String(error) });
  } finally {
    await prisma.$disconnect();
  }
}