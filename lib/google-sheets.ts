import { google } from 'googleapis';
import { cookies } from 'next/headers';

/**
 * Returns authenticated Google Sheets client and Spreadsheet ID
 */
export function getAuthSheets() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error('Kredensial Google Sheets tidak lengkap.');
  }

  const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: formattedKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return {
    sheets: google.sheets({ version: 'v4', auth }),
    spreadsheetId,
  };
}

/**
 * Helper to normalize date strings from Google Sheets to YYYY-MM-DD
 */
export function normalisasiTanggal(str: string): string {
  if (!str) return '';
  str = str.trim();

  // Excel serial number format (e.g. 45123)
  if (/^\d+$/.test(str)) {
    const serial = parseInt(str, 10);
    const jsDate = new Date((serial - 25569) * 24 * 3600 * 1000);
    const tgl = String(jsDate.getUTCDate()).padStart(2, '0');
    const bln = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
    const thn = jsDate.getUTCFullYear();
    return `${thn}-${bln}-${tgl}`;
  }

  const pemisah = str.includes('/') ? '/' : (str.includes('-') ? '-' : '');
  if (!pemisah) return str;
  const bagian = str.split(pemisah);
  if (bagian.length !== 3) return str;

  // YYYY-MM-DD format
  if (bagian[0].length === 4) {
    return `${bagian[0]}-${bagian[1].padStart(2, '0')}-${bagian[2].padStart(2, '0')}`;
  }

  // DD/MM/YYYY or MM/DD/YYYY format
  if (bagian[2].length === 4 || bagian[2].length === 2) {
    let thn = bagian[2];
    if (thn.length === 2) thn = '20' + thn;

    const p1 = parseInt(bagian[0], 10);
    const p2 = parseInt(bagian[1], 10);
    
    // Default assumptions if we can't determine month: p1 is day, p2 is month
    let blnNum = p2;
    let tglNum = p1;

    // Standard fallback logic (matching the existing code's target month comparison)
    if (p1 > 12) {
      tglNum = p1;
      blnNum = p2;
    } else if (p2 > 12) {
      blnNum = p1;
      tglNum = p2;
    }

    return `${thn}-${String(blnNum).padStart(2, '0')}-${String(tglNum).padStart(2, '0')}`;
  }
  return str;
}

/**
 * Helper to parse Rupiah currency strings to Integer
 */
export function parseRupiah(val: any): number {
  if (val === null || val === undefined) return 0;
  let str = val.toString().trim();
  if (!str) return 0;
  if (/(,|\.)\d{2}$/.test(str)) str = str.slice(0, -3);
  return parseInt(str.replace(/\D/g, ''), 10) || 0;
}

/**
 * Helper to parse quantities to Float
 */
export function parseQty(val: any): number {
  if (val === null || val === undefined) return 0;
  return parseFloat(val.toString().replace(',', '.')) || 0;
}

/**
 * Verifies if the request is authenticated as the Owner
 */
export function verifyOwnerSession(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get('owner_session')?.value;
  const expectedSecret = process.env.SESSION_SECRET || 'authorized_owner_session_token';
  return token === expectedSecret;
}
