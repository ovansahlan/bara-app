import { NextResponse } from 'next/server';
import { google } from 'googleapis';

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

    // Tarik 6 Data Tab Sekaligus
    const [resPenjualan, resPengeluaran, resKasbon, resAbsen, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Kasbon!A:C' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Absen!A:F' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Masuk!A:G' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Keluar!A:G' })
    ]);

    // 1. RINCIAN OMSET
    const omset = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      if (row[0] === tanggalFilter || row[0] === formatTanggalID) {
        omset.tunai += parseInt(row[3] || '0', 10);
        omset.qris += parseInt(row[4] || '0', 10);
        omset.edc += parseInt(row[5] || '0', 10);
        omset.grab += parseInt(row[6] || '0', 10);
        omset.total += parseInt(row[7] || '0', 10);
      }
    });

    // 2. TOTAL PENGELUARAN & KASBON
    let totalKeluar = 0;
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      if (row[0] === tanggalFilter || row[0] === formatTanggalID) {
        totalKeluar += parseInt((row[7] || '0').toString().replace(/\D/g, ''), 10);
      }
    });

    let totalKasbon = 0;
    (resKasbon.data.values || []).slice(1).forEach(row => {
      if (row[0] === tanggalFilter || row[0] === formatTanggalID) {
        totalKasbon += parseInt((row[2] || '0').toString().replace(/\D/g, ''), 10);
      }
    });

    // 3. LOG ABSENSI
    let totalHadir = 0;
    (resAbsen.data.values || []).slice(1).forEach(row => {
      if (row[0] === tanggalFilter || row[0] === formatTanggalID) totalHadir += 1;
    });

    // 4. HISTORI STOK (5 Terakhir)
    const historyStokIn = (resStokIn.data.values || []).slice(-5).reverse();
    const historyStokOut = (resStokOut.data.values || []).slice(-5).reverse();

    return NextResponse.json({
      omset,
      totalKeluar,
      totalKasbon,
      totalHadir,
      historyStokIn,
      historyStokOut
    });

  } catch (error: any) {
    console.error('API Dashboard Error:', error);
    return NextResponse.json({ error: 'Gagal memuat data.' }, { status: 500 });
  }
}