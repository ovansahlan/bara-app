import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal'); // Format dari frontend: YYYY-MM-DD

    if (!tanggal) return NextResponse.json({ error: 'Tanggal diperlukan' }, { status: 400 });

    // FORMATTER: Ubah "YYYY-MM-DD" menjadi "DD/MM/YYYY"
    const [year, month, day] = tanggal.split('-');
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
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Penjualan!A:H', 
    });

    const rows = response.data.values || [];
    
    const rincianPagi = {
      tunai: 0,
      qris: 0,
      edcTransfer: 0,
      grabOnline: 0,
      totalPenjualan: 0
    };

    rows.forEach(row => {
      const rowTanggal = row[0]; // Kolom A
      const rowShift = row[2];   // Kolom C

      // Cek apakah tanggal sama dengan format DD/MM/YYYY atau YYYY-MM-DD (histori lama)
      if ((rowTanggal === formatTanggalID || rowTanggal === tanggal) && rowShift === 'Shift 1 (Pagi)') {
        rincianPagi.tunai += parseInt(row[3] || '0', 10);
        rincianPagi.qris += parseInt(row[4] || '0', 10);
        rincianPagi.edcTransfer += parseInt(row[5] || '0', 10);
        rincianPagi.grabOnline += parseInt(row[6] || '0', 10);
        rincianPagi.totalPenjualan += parseInt(row[7] || '0', 10);
      }
    });

    return NextResponse.json(rincianPagi);

  } catch (error: any) {
    console.error('GET Sheets Error:', error);
    return NextResponse.json({ error: 'Gagal membaca data pagi.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, namaKasir, shift, tunai, qris, edcTransfer, grabOnline, totalPenjualan } = body;

    // FORMATTER: Ubah "YYYY-MM-DD" menjadi "DD/MM/YYYY" agar diterima Google Sheets
    const [year, month, day] = tanggal.split('-');
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
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Gunakan formatTanggalID yang sudah diubah formatnya
    const barisBaru = [formatTanggalID, namaKasir, shift, tunai, qris, edcTransfer, grabOnline, totalPenjualan];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Penjualan!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS', 
      requestBody: { values: [barisBaru] },
    });

    return NextResponse.json({ success: true, message: 'Omset per kategori berhasil dikunci ke sistem!' });

  } catch (error: any) {
    console.error('POST Sheets Error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan omset.', details: error.message }, { status: 500 });
  }
}