import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, namaKru, nominalAsli, keterangan } = body;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    // Proteksi TypeScript Kompilasi
    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Kredensial server tidak lengkap.' }, { status: 500 });
    }

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // PINTAR: Otomatis konversi tanggal menjadi Nama Bulan Inggris singkat (Cth: "May", "Jun", "Jul")
    // Sesuai dengan format histori data di database Anda
    const opsiBulan = new Date(tanggal).toLocaleString('en-US', { month: 'short' });

    // Format Baris Sesuai CSV Asli:
    // A:Tanggal | B:Nama Kru | C:Nominal Kasbon (Rp) | D:Keterangan | E:Column 1 (Bulan)
    const barisBaru = [tanggal, namaKru, nominalAsli, keterangan, opsiBulan];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Kasbon!A:E',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS', // Mencegah bug overwrite data
      requestBody: { values: [barisBaru] },
    });

    return NextResponse.json({ success: true, message: 'Data kasbon berhasil dicatat ke database!' });

  } catch (error: any) {
    console.error('API Kasbon Error:', error);
    return NextResponse.json({ error: 'Gagal memproses data kasbon.', details: error.message }, { status: 500 });
  }
}