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
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Masuk!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Keluar!A:H' }).catch(() => ({ data: { values: [] } }))
    ]);

    const omsetHarian = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };
    let pengeluaranHarian = 0;
    let kasbonHarian = 0;
    
    // Variabel Akumulasi Bulanan untuk Laci Kasir (Reset tiap bulan baru)
    let akumulasiTunaiBulanan = 0;
    let akumulasiPengeluaranBulanan = 0;
    let akumulasiKasbonBulanan = 0;

    // 1. PENJUALAN
    const barisPenjualan = resPenjualan.data.values || [];
    barisPenjualan.slice(1).forEach(row => {
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
    const barisPengeluaran = resPengeluaran.data.values || [];
    barisPengeluaran.slice(1).forEach(row => {
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

    // 3. KASBON (Kolom C / Index 2)
    const barisKasbon = resKasbon.data.values || [];
    barisKasbon.slice(1).forEach(row => {
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

    // RUMUS LACI KASIR: Total Tunai Bulan Ini - (Pengeluaran Bulan Ini + Kasbon Bulan Ini)
    const saldoLaciKasir = akumulasiTunaiBulanan - akumulasiPengeluaranBulanan - akumulasiKasbonBulanan;

    const historyStokIn = (resStokIn.data.values || []).slice(-5).reverse();
    const historyStokOut = (resStokOut.data.values || []).slice(-5).reverse();

    return NextResponse.json({
      omset: omsetHarian,
      totalKeluar: pengeluaranHarian,
      totalKasbon: kasbonHarian,
      saldoLaciKasir: saldoLaciKasir,
      historyStokIn,
      historyStokOut
    });

  } catch (error: any) {
    console.error('API Dashboard Error:', error);
    return NextResponse.json({ error: 'Gagal memuat ringkasan dashboard.' }, { status: 500 });
  }
}