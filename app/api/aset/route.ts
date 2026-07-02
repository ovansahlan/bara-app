import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) return NextResponse.json({ error: 'Error' }, { status: 500 });

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

    const parseRupiah = (val: any) => {
      if (!val) return 0;
      let str = val.toString().trim();
      if (/(,|\.)\d{2}$/.test(str)) str = str.slice(0, -3);
      return parseInt(str.replace(/\D/g, ''), 10) || 0;
    };
    const parseQty = (val: any) => parseFloat(val ? val.toString().replace(',', '.') : '0') || 0;

    const kalkulasiGudang: Record<string, { nama: string; totalQtyIn: number; totalCostIn: number; totalQtyOut: number; batasAman: number }> = {};
    
    (resMasterProduct.data.values || []).slice(1).forEach(row => {
      const id = row[0] ? row[0].toString().trim() : '';
      const nama = row[1] || 'Item Tidak Dikenal';
      const batas = parseInt(row[4] || '10', 10);
      if (id) kalkulasiGudang[id] = { nama, totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0, batasAman: isNaN(batas) ? 10 : batas };
    });

    (resStokIn.data.values || []).slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || !kalkulasiGudang[idStr]) return;
      
      kalkulasiGudang[idStr].totalQtyIn += parseQty(row[3]);
      kalkulasiGudang[idStr].totalCostIn += parseRupiah(row[5]);
    });

    (resStokOut.data.values || []).slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || !kalkulasiGudang[idStr]) return;
      
      kalkulasiGudang[idStr].totalQtyOut += parseQty(row[3]);
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

      const detail = {
        id,
        nama: dataItem.nama,
        masuk: dataItem.totalQtyIn,
        keluar: dataItem.totalQtyOut,
        sisa: sisaStok,
        nilai: nilaiRupiahAset,
        batasAman: dataItem.batasAman
      };

      items.push(detail);

      if (sisaStok <= dataItem.batasAman && (dataItem.totalQtyIn > 0 || sisaStok > 0)) {
        stockAlerts.push(detail);
      }
    });

    return NextResponse.json({ success: true, totalAset, items, stockAlerts });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}