import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, namaKru, daftarPengeluaran } = body;

    if (!daftarPengeluaran || !Array.isArray(daftarPengeluaran) || daftarPengeluaran.length === 0) {
      return NextResponse.json({ error: 'Daftar pengeluaran kosong.' }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) return NextResponse.json({ error: 'Kredensial tidak lengkap' }, { status: 500 });

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({ email: clientEmail, key: formattedKey, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    
    const [year, month, day] = tanggal.split('-');
    const formatTanggalID = `'${day}/${month}/${year}`;

    // Format Baris: Tanggal(A) | Nama(B) | Kategori(C) | Keterangan(D) | Qty(E) | Harga(F) | Kosong(G) | Total(H)
    const kumpulanBarisBaru = daftarPengeluaran.map((item: any) => [
      formatTanggalID, 
      namaKru, 
      'Operasional Gerobak', 
      item.keterangan, 
      '', '', '', 
      item.nominal
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Pengeluaran_Gerobak!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: kumpulanBarisBaru },
    });

    return NextResponse.json({ success: true, message: 'Seluruh pengeluaran gerobak berhasil disimpan!' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mencatat pengeluaran gerobak.' }, { status: 500 });
  }
}