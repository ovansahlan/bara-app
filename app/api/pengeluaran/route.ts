import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Menerima kiriman metadata struk dan array daftarBelanja dari frontend
    const { tanggal, penginput, kategori, daftarBelanja } = body;

    if (!daftarBelanja || !Array.isArray(daftarBelanja) || daftarBelanja.length === 0) {
      return NextResponse.json({ error: 'Daftar belanja kosong atau tidak valid.' }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Kredensial server belum lengkap.' }, { status: 500 });
    }

    // Pembersih Kunci Privat andalan agar kebal error DECODER OpenSSL
    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Memetakan array keranjang belanja menjadi baris-baris masal siap ketik
    // Kolom: Tanggal, Penginput, Kategori, Nama Barang, Qty, Satuan, Harga Satuan, Total Harga
    const kumpulanBarisBaru = daftarBelanja.map((item: any) => [
      tanggal,
      penginput,
      kategori,
      item.namaItem,
      item.kuantiti,
      item.satuan,
      item.hargaSatuanAsli,
      item.nominalAsli
    ]);

    // Eksekusi penulisan masal (batch append) ke lembar "Pengeluaran"
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Pengeluaran!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: kumpulanBarisBaru,
      },
    });

    return NextResponse.json({ success: true, message: 'Seluruh nota pengeluaran berhasil dicatat ke Google Sheets!' });

  } catch (error: any) {
    console.error('Google Sheets API Pengeluaran Error:', error);
    return NextResponse.json({ error: 'Gagal mengunci data belanja.', details: error.message }, { status: 500 });
  }
}