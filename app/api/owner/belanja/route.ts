import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, kategori, keterangan, nominal, peruntukan } = body;

    // Validasi 5 kolom wajib
    if (!tanggal || !kategori || !keterangan || !nominal || !peruntukan) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

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

    // 🔥 MENYIMPAN KE 5 KOLOM (A - E) SESUAI DATABASE BOS
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Belanja_Owner!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[tanggal, kategori, keterangan, nominal, peruntukan]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Belanja Owner Error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan data belanja. Periksa koneksi atau kredensial server.' }, { status: 500 });
  }
}