import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Jika tidak ada tanggal yang dikirim, gunakan tanggal hari ini (YYYY-MM-DD)
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    // Buat format alternatif Indonesia (DD/MM/YYYY) untuk pencocokan database spreadsheet
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

    // Tarik 4 data tab sekaligus secara paralel
    const [resPenjualan, resPengeluaran, resKasbon, resAbsen] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }), // Kolom E adalah Nilai
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Kasbon!A:C' }),      // Kolom C adalah Nominal Kasbon
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Absen!A:F' })
    ]);

    let omsetHariIni = 0;
    let pengeluaranHariIni = 0;
    let kasbonHariIni = 0;
    let absenHariIni = 0;

    // 1. Hitung Omset Hari Ini (Kolom H / Index 7)
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0];
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        omsetHariIni += parseInt(row[7] || '0', 10);
      }
    });

    // 2. Hitung Pengeluaran Hari Ini (Kolom E / Index 4 sesuai berkas asli)
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0];
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        // Membersihkan karakter non-angka jika kasir tidak sengaja mengetik simbol Rp atau titik
        const nominalStr = (row[7] || '0').toString().replace(/\D/g, '');
        pengeluaranHariIni += parseInt(nominalStr || '0', 10);
      }
    });

    // 3. Hitung Kasbon Hari Ini (Kolom C / Index 2 sesuai berkas asli)
    (resKasbon.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0];
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        const nominalStr = (row[2] || '0').toString().replace(/\D/g, '');
        kasbonHariIni += parseInt(nominalStr || '0', 10);
      }
    });

    // 4. Hitung Absensi Hari Ini
    (resAbsen.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0];
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        absenHariIni += 1;
      }
    });

    return NextResponse.json({ 
      tanggal: tanggalFilter,
      omsetHariIni, 
      pengeluaranHariIni, 
      kasbonHariIni, 
      absenHariIni 
    });

  } catch (error: any) {
    console.error('API Dashboard Error:', error);
    return NextResponse.json({ error: 'Gagal menarik data ringkasan dashboard.' }, { status: 500 });
  }
}