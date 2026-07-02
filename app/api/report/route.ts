import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    const [year, month, day] = tanggalFilter.split('-');
    const formatTanggalID = `${day}/${month}/${year}`;

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

    const [resPenjualan, resPengeluaran, resMasterProduct, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Master Product!A:E' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Masuk!A:G' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Keluar!A:I' }).catch(() => ({ data: { values: [] } }))
    ]);

    const parseRupiah = (val: any) => {
      if (!val) return 0;
      let str = val.toString().trim();
      if (/(,|\.)\d{2}$/.test(str)) str = str.slice(0, -3);
      return parseInt(str.replace(/\D/g, ''), 10) || 0;
    };
    const parseQty = (val: any) => parseFloat(val ? val.toString().replace(',', '.') : '0') || 0;

    // 1. DATA PENJUALAN
    const omsetPagi = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };
    const omsetMalam = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };
    const omsetHarian = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };

    (resPenjualan.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      const rowShift = row[2] ? row[2].toString().toLowerCase() : '';

      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        const tunai = parseRupiah(row[3]);
        const qris = parseRupiah(row[4]);
        const edc = parseRupiah(row[5]);
        const grab = parseRupiah(row[6]);
        const total = parseRupiah(row[7]);

        // Masukkan ke Total Harian
        omsetHarian.tunai += tunai; omsetHarian.qris += qris; omsetHarian.edc += edc; omsetHarian.grab += grab; omsetHarian.total += total;

        // Pisahkan ke Shift Masing-Masing
        if (rowShift.includes('pagi') || rowShift.includes('1')) {
          omsetPagi.tunai += tunai; omsetPagi.qris += qris; omsetPagi.edc += edc; omsetPagi.grab += grab; omsetPagi.total += total;
        } else if (rowShift.includes('malam') || rowShift.includes('2')) {
          omsetMalam.tunai += tunai; omsetMalam.qris += qris; omsetMalam.edc += edc; omsetMalam.grab += grab; omsetMalam.total += total;
        }
      }
    });

    // 2. DATA PENGELUARAN
    let totalPengeluaranHarian = 0;
    const rincianPengeluaran: any[] = [];

    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        const nominal = parseRupiah(row[7]);
        totalPengeluaranHarian += nominal;
        rincianPengeluaran.push({
          keterangan: row[3] || row[2] || 'Pengeluaran',
          nominal: nominal
        });
      }
    });

    // 3. DATA ALERT GUDANG (Moving Average & Threshold)
    const kalkulasiGudang: Record<string, { nama: string; totalQtyIn: number; totalQtyOut: number; batasAman: number }> = {};
    
    (resMasterProduct.data.values || []).slice(1).forEach(row => {
      const id = row[0] ? row[0].toString().trim() : '';
      const batas = parseInt(row[4] || '10', 10);
      if (id) kalkulasiGudang[id] = { nama: row[1] || 'Item', totalQtyIn: 0, totalQtyOut: 0, batasAman: isNaN(batas) ? 10 : batas };
    });

    (resStokIn.data.values || []).slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || !kalkulasiGudang[idStr]) return;
      kalkulasiGudang[idStr].totalQtyIn += parseQty(row[3]);
    });

    (resStokOut.data.values || []).slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || !kalkulasiGudang[idStr]) return;
      kalkulasiGudang[idStr].totalQtyOut += parseQty(row[3]);
    });

    const stockAlerts: any[] = [];
    Object.keys(kalkulasiGudang).forEach(id => {
      const item = kalkulasiGudang[id];
      const sisaStok = item.totalQtyIn - item.totalQtyOut;
      if (sisaStok <= item.batasAman && (item.totalQtyIn > 0 || sisaStok > 0)) {
        stockAlerts.push({ nama: item.nama, sisa: sisaStok, batas: item.batasAman });
      }
    });

    return NextResponse.json({
      success: true,
      omsetPagi,
      omsetMalam,
      omsetHarian,
      pengeluaran: rincianPengeluaran,
      totalPengeluaran: totalPengeluaranHarian,
      stockAlerts
    });

  } catch (error: any) {
    console.error('API Report Error:', error);
    return NextResponse.json({ error: 'Gagal memuat rekap laporan.' }, { status: 500 });
  }
}