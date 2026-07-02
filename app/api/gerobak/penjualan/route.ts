import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, namaKru, shift, tunai, qris, edc, grab, total } = body;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Kredensial tidak lengkap.' }, { status: 500 });
    }

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Format Tanggal
    const [year, month, day] = tanggal.split('-');
    const formatTanggalID = `'${day}/${month}/${year}`;

    // Susunan Baris: Tanggal | Nama Kru | Shift | Tunai | QRIS | EDC | Grab | Total (Kolom A-H)
    const dataBaris = [formatTanggalID, namaKru, shift, tunai, qris, edc, grab, total];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Penjualan_Gerobak!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [dataBaris] },
    });

    return NextResponse.json({ success: true, message: 'Omset Gerobak berhasil disimpan!' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mencatat omset gerobak.' }, { status: 500 });
  }
}