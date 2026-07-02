import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    const [year, month, day] = tanggalFilter.split('-');
    const prefixTanggalID = `/${month}/${year}`; 
    const prefixTanggalWeb = `${year}-${month}`; 
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

    const [resPenjualan, resPengeluaran, resKasbon, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Kasbon!A:E' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Masuk!A:G' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Keluar!A:I' }).catch(() => ({ data: { values: [] } }))
    ]);

    const omsetHarian = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };
    let pengeluaranHarian = 0;
    let kasbonHarian = 0;
    
    // VARIABEL ATURAN BULANAN (OTOMATIS RESET TIAP BULAN BARU)
    let akumulasiTunaiBulanan = 0;
    let akumulasiPengeluaranBulanan = 0;
    let akumulasiKasbonBulanan = 0;

    // 1. PENJUALAN
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (!rowTanggal) return;

      if (rowTanggal.startsWith(prefixTanggalWeb) || rowTanggal.endsWith(prefixTanggalID)) {
        akumulasiTunaiBulanan += parseInt(row[3] || '0', 10);
      }
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        omsetHarian.tunai += parseInt(row[3] || '0', 10);
        omsetHarian.qris += parseInt(row[4] || '0', 10);
        omsetHarian.edc += parseInt(row[5] || '0', 10);
        omsetHarian.grab += parseInt(row[6] || '0', 10);
        omsetHarian.total += parseInt(row[7] || '0', 10);
      }
    });

    // 2. PENGELUARAN (Kolom H / Index 7)
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (!rowTanggal) return;
      const nominal = parseInt((row[7] || '0').toString().replace(/\D/g, ''), 10) || 0;

      if (rowTanggal.startsWith(prefixTanggalWeb) || rowTanggal.endsWith(prefixTanggalID)) {
        akumulasiPengeluaranBulanan += nominal;
      }
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        pengeluaranHarian += nominal;
      }
    });

    // 3. KASBON BULANAN SEBAGAI PENGURANG UANG LACI KASIR OPERASIONAL
    (resKasbon.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (!rowTanggal) return;
      const nominal = parseInt((row[2] || '0').toString().replace(/\D/g, ''), 10) || 0;

      if (rowTanggal.startsWith(prefixTanggalWeb) || rowTanggal.endsWith(prefixTanggalID)) {
        akumulasiKasbonBulanan += nominal;
      }
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        kasbonHarian += nominal;
      }
    });

    // 4. HITUNG REAL-TIME MOVING AVERAGE ASET GUDANG AKTIF
    const kalkulasiGudang: Record<string, { totalQtyIn: number; totalCostIn: number; totalQtyOut: number }> = {};
    
    (resStokIn.data.values || []).slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr) return;
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyIn += parseFloat(row[3] || '0') || 0;
      kalkulasiGudang[idStr].totalCostIn += parseInt((row[5] || '0').toString().replace(/\D/g, ''), 10) || 0;
    });

    (resStokOut.data.values || []).slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr) return;
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyOut += parseFloat(row[3] || '0') || 0;
    });

    let totalNilaiAsetGudangAktif = 0;
    Object.keys(kalkulasiGudang).forEach(id => {
      const item = kalkulasiGudang[id];
      const hrgRata2 = item.totalQtyIn > 0 ? (item.totalCostIn / item.totalQtyIn) : 0;
      const sisaStok = item.totalQtyIn - item.totalQtyOut;
      if (sisaStok > 0) totalNilaiAsetGudangAktif += (sisaStok * hrgRata2);
    });

    // AMBIL KAS NET: Tunai - Biaya Operasional - Uang Kasbon Keluar (Akan Ter-reset 0 otomatis di bulan baru)
    const saldoLaciKasir = akumulasiTunaiBulanan - akumulasiPengeluaranBulanan - akumulasiKasbonBulanan;
    
    const historyStokIn = (resStokIn.data.values || []).slice(-5).reverse();
    const historyStokOut = (resStokOut.data.values || []).slice(-5).reverse();

    return NextResponse.json({
      omset: omsetHarian,
      totalKeluar: pengeluaranHarian,
      totalKasbon: kasbonHarian,
      saldoLaciKasir: saldoLaciKasir,
      nilaiAsetGudang: totalNilaiAsetGudangAktif,
      historyStokIn,
      historyStokOut
    });

  } catch (error: any) {
    console.error('API Dashboard Error:', error);
    return NextResponse.json({ error: 'Gagal memuat ringkasan.' }, { status: 500 });
  }
}