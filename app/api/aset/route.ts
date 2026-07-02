import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Kredensial tidak lengkap' }, { status: 500 });
    }

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const [resMasterProduct, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Master Product!A:E' }), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Masuk!A:G' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Keluar!A:I' })
    ]);

    const thresholdMap: Record<string, number> = {};
    (resMasterProduct.data.values || []).slice(1).forEach(row => {
      const id = row[0] ? row[0].toString().trim() : '';
      const batas = parseInt(row[4] || '10', 10);
      if (id) thresholdMap[id] = batas;
    });

    const kalkulasiGudang: Record<string, { nama: string; totalQtyIn: number; totalCostIn: number; totalQtyOut: number }> = {};

    (resStokIn.data.values || []).slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr) return;
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { nama: row[2] || 'Item', totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyIn += parseFloat(row[3] || '0') || 0;
      kalkulasiGudang[idStr].totalCostIn += parseInt((row[5] || '0').toString().replace(/\D/g, ''), 10) || 0;
    });

    (resStokOut.data.values || []).slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr) return;
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { nama: row[2] || 'Item', totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyOut += parseFloat(row[3] || '0') || 0;
    });

    let totalAset = 0;
    const items: any[] = [];
    const stockAlerts: any[] = [];

    Object.keys(kalkulasiGudang).forEach(id => {
      const dataItem = kalkulasiGudang[id];
      const hrgRata2 = dataItem.totalQtyIn > 0 ? (dataItem.totalCostIn / dataItem.totalQtyIn) : 0;
      const sisaStok = dataItem.totalQtyIn - dataItem.totalQtyOut;
      const nilaiRupiahAset = sisaStok > 0 ? Math.round(sisaStok * hrgRata2) : 0;

      totalAset += nilaiRupiahAset;
      const batasAman = thresholdMap[id] !== undefined ? thresholdMap[id] : 10;

      const detail = {
        id,
        nama: dataItem.nama,
        masuk: dataItem.totalQtyIn,
        keluar: dataItem.totalQtyOut,
        sisa: sisaStok,
        nilai: nilaiRupiahAset,
        batasAman
      };

      items.push(detail);

      if (sisaStok <= batasAman && (dataItem.totalQtyIn > 0 || sisaStok > 0)) {
        stockAlerts.push(detail);
      }
    });

    return NextResponse.json({ success: true, totalAset, items, stockAlerts });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal memproses asset.' }, { status: 500 });
  }
}