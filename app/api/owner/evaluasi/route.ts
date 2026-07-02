import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { namaKru, tunjangan, overtime, catatan } = body;

    if (!namaKru) {
      return NextResponse.json({ error: 'Nama kru wajib dipilih.' }, { status: 400 });
    }

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const bulanTahun = `${year}-${month}`;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

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

    // Format data baru: Bulan_Tahun(A) | Nama_Kru(B) | Tunjangan_Objektif(C) | Uang_Overtime(D) | Catatan_Owner(E)
    const dataBaris = [
      bulanTahun,
      namaKru,
      parseInt(tunjangan, 10) || 0,
      parseInt(overtime, 10) || 0,
      catatan || ''
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Evaluasi_Bulanan!A:E',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [dataBaris] },
    });

    return NextResponse.json({ success: true, message: `Berhasil mengunci evaluasi untuk ${namaKru}!` });

  } catch (error: any) {
    console.error('API Evaluasi Error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan data evaluasi.' }, { status: 500 });
  }
}