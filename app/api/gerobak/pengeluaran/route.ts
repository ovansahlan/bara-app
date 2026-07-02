import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, namaKru, keterangan, nominal } = body;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) return NextResponse.json({ error: 'Kredensial tidak lengkap' }, { status: 500 });

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({ email: clientEmail, key: formattedKey, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    
    const [year, month, day] = tanggal.split('-');
    const formatTanggalID = `'${day}/${month}/${year}`;

    // Susunan Baris: Tanggal(0) | Nama(1) | Kategori(2) | Keterangan(3) | Qty(4) | Harga(5) | Kosong(6) | Total(7)
    // Nominal wajib di index 7 (Kolom H) agar terbaca oleh sistem Dashboard Owner
    const dataBaris = [formatTanggalID, namaKru, 'Operasional Gerobak', keterangan, '', '', '', nominal];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Pengeluaran_Gerobak!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [dataBaris] },
    });

    return NextResponse.json({ success: true, message: 'Pengeluaran Gerobak berhasil disimpan!' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mencatat pengeluaran gerobak.' }, { status: 500 });
  }
}