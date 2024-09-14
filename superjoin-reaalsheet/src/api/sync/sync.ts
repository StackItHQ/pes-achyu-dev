import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSheetData, updateSheetData } from '../lib/sheets';

const prisma = new PrismaClient();
const SPREADSHEET_ID = 'your-spreadsheet-id';
const RANGE = 'Sheet1!A2:E'; // Added an extra column for timestamp

interface SheetRow {
  [index: number]: string | undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sheetData = await getSheetData(SPREADSHEET_ID, RANGE);

    if (sheetData) {
      for (const row of sheetData as SheetRow[]) {
        if (row[0] && row[4]) {  
          const sheetTimestamp = new Date(row[4]);
          const dbRow = await prisma.sheet.findUnique({ 
            where: { id: row[0] } 
          });

          if (!dbRow || sheetTimestamp > dbRow.updatedAt) {
            await prisma.sheet.upsert({
              where: { id: row[0] },
              update: {
                
                column1: row[1] ?? '',
                column2: row[2] ?? '',
                column3: row[3] ?? '',
                updatedAt: sheetTimestamp,
              },
              create: {
                rowId: row[0],
                column1: row[1] ?? '',
                column2: row[2] ?? '',
                column3: row[3] ?? '',
                updatedAt: sheetTimestamp,
              },
            });
          }
        }
      }
    }

    // Fetch data from MySQL
    const dbData = await prisma.sheet.findMany();

    // Sync MySQL data to Google Sheets
    const updatedSheetData = dbData.map(row => [
      row.rowId,
      row.column1,
      row.column2,
      row.column3,
      row.updatedAt.toISOString(),
    ]);

    await updateSheetData(SPREADSHEET_ID, RANGE, updatedSheetData);

    res.status(200).json({ message: 'Sync completed successfully' });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
}