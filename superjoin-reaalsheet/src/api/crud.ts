import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { updateSheetData } from '../lib/sheets';

const prisma = new PrismaClient();
const SPREADSHEET_ID = 'your-spreadsheet-id';
const RANGE = 'Sheet1!A2:D';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  try {
    switch (method) {
      case 'POST':
        const createdRow = await prisma.sheet.create({ data: body });
        await syncToSheet();
        res.status(201).json(createdRow);
        break;

      case 'PUT':
        const updatedRow = await prisma.sheet.update({
          where: { id: body.id },
          data: body,
        });
        await syncToSheet();
        res.status(200).json(updatedRow);
        break;

      case 'DELETE':
        await prisma.sheet.delete({ where: { id: body.id } });
        await syncToSheet();
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('CRUD operation error:', error);
    res.status(500).json({ error: 'Operation failed' });
  }
}

async function syncToSheet() {
  const dbData = await prisma.sheet.findMany();
  const sheetData = dbData.map(row => [
    row.rowId,
    row.column1,
    row.column2,
    row.column3,
  ]);
  await updateSheetData(SPREADSHEET_ID, RANGE, sheetData);
}