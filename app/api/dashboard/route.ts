import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    // Pecah komponen tanggal untuk filter bulanan (Contoh: "2026-05-15" -> year="2026", month="05")
    const [year, month, day] = tanggalFilter.split('-');
    const prefixTanggalID = `/${month}/${year}`; // Untuk mencocokkan format "DD/MM/YYYY"
    const prefixTanggalWeb = `${year}-${month}`; // Untuk mencocokkan format "YYYY-MM-DD"
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

    // Ambil semua data tab utama
    const [resPenjualan, resPengeluaran, resKasbon, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'DB_Penjualan!A:H' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'DB_Pengeluaran!A:H' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'DB_Kasbon!A:C' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stock-In!A:G' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stock-Out!A:G' })
    ]);

    // VARIABEL UNTUK HARI INI / TANGGAL TERPILIH
    const omsetHarian = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };
    let pengeluaranHarian = 0;
    let kasbonHarian = 0;

    // VARIABEL AKUMULASI BULANAN (UNTUK SALDO LACI KASIR)
    let akumulasiTunaiBulanan = 0;
    let akumulasiPengeluaranBulanan = 0;

    // 1. PROSES DATA PENJUALAN
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (!rowTanggal) return;

      // Cek apakah masuk dalam bulan yang sama untuk Saldo Laci Kasir
      if (rowTanggal.startsWith(prefixTanggalWeb) || rowTanggal.endsWith(prefixTanggalID)) {
        akumulasiTunaiBulanan += parseInt(row[3] || '0', 10);
      }

      // Cek spesifik tanggal terpilih
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        omsetHarian.tunai += parseInt(row[3] || '0', 10);
        omsetHarian.qris += parseInt(row[4] || '0', 10);
        omsetHarian.edc += parseInt(row[5] || '0', 10);
        omsetHarian.grab += parseInt(row[6] || '0', 10);
        omsetHarian.total += parseInt(row[7] || '0', 10);
      }
    });

    // 2. PROSES DATA PENGELUARAN
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (!rowTanggal) return;

      const nominal = parseInt((row[7] || '0').toString().replace(/\D/g, ''), 10) || 0;

      // Cek akumulasi pengeluaran bulanan
      if (rowTanggal.startsWith(prefixTanggalWeb) || rowTanggal.endsWith(prefixTanggalID)) {
        akumulasiPengeluaranBulanan += nominal;
      }

      // Cek spesifik tanggal terpilih
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        pengeluaranHarian += nominal;
      }
    });

    // 3. PROSES DATA KASBON HARIAN
    (resKasbon.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        kasbonHarian += parseInt((row[2] || '0').toString().replace(/\D/g, ''), 10) || 0;
      }
    });

    // Hitung Saldo Akhir Laci Kasir Berjalan Bulan Ini
    const saldoLaciKasir = akumulasiTunaiBulanan - akumulasiPengeluaranBulanan;

    // 4. HISTORI MUTASI STOK (Ambil 5 Log Terakhir)
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