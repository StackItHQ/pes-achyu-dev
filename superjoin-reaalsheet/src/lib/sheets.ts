import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getAuthClient() {
  const auth = new JWT({
    keyFile: 'credentials.json',
    scopes: SCOPES,
  });

  await auth.authorize();
  return auth;
}

export async function getSheetData(spreadsheetId: string, range: string) {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values;
}

export async function updateSheetData(spreadsheetId: string, range: string, values: any[][]) {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
}