import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    const [year, month, day] = tanggal.split('-');
    const formatTanggalID = `${day}/${month}/${year}`;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) return NextResponse.json({ error: 'Kredensial error' }, { status: 500 });

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({ email: clientEmail, key: formattedKey, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });

    const [resPenjualan, resPengeluaran, resKasbon] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Kasbon!A:E' })
    ]);

    // Fungsi penyaring data hari ini dengan melacak Nomor Baris aslinya (Index + 1)
    const filterHariIni = (rows: any[]) => {
      return rows
        .map((row, index) => ({ rowNumber: index + 1, rowData: row }))
        .filter(item => {
          const tgl = item.rowData[0] ? item.rowData[0].toString().replace(/'/g, '').trim() : '';
          return tgl === tanggal || tgl === formatTanggalID;
        })
        .reverse(); // Urutkan dari yang paling baru diinput
    };

    return NextResponse.json({
      success: true,
      penjualan: filterHariIni(resPenjualan.data.values || []),
      pengeluaran: filterHariIni(resPengeluaran.data.values || []),
      kasbon: filterHariIni(resKasbon.data.values || [])
    });

  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat data revisi.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { kategori, rowNumber } = body; // Kategori: 'Penjualan' | 'Pengeluaran' | 'Kasbon'

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) return NextResponse.json({ error: 'Kredensial error' }, { status: 500 });

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({ email: clientEmail, key: formattedKey, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });

    // Hapus/Kosongkan baris spesifik tersebut (Clear Row)
    const rangeTarget = `${kategori}!A${rowNumber}:I${rowNumber}`;
    
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: rangeTarget,
    });

    return NextResponse.json({ success: true, message: `Data di baris ${rowNumber} berhasil dihapus/divoid!` });

  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data.' }, { status: 500 });
  }
}