import { NextResponse } from 'next/server';
import { getAuthSheets, parseRupiah } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, namaKru, daftarPengeluaran } = body;

    if (!tanggal || typeof tanggal !== 'string' || !tanggal.includes('-')) {
      return NextResponse.json({ error: 'Tanggal wajib diisi dengan format YYYY-MM-DD.' }, { status: 400 });
    }

    if (!daftarPengeluaran || !Array.isArray(daftarPengeluaran) || daftarPengeluaran.length === 0) {
      return NextResponse.json({ error: 'Daftar pengeluaran kosong.' }, { status: 400 });
    }

    const { sheets, spreadsheetId } = getAuthSheets();

    // Format Baris: Tanggal(A) | Nama(B) | Kategori(C) | Keterangan(D) | Qty(E) | Harga(F) | Kosong(G) | Total(H) |
    // Menulis tanggal langsung dalam format YYYY-MM-DD agar dideteksi sebagai tipe data Tanggal di Google Sheets
    const kumpulanBarisBaru = daftarPengeluaran.map((item: any) => [
      tanggal, 
      namaKru || '', 
      'Operasional Gerobak', 
      item.keterangan || '', 
      '', '', '', 
      parseRupiah(item.nominal)
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
    console.error('API Gerobak Pengeluaran POST Error:', error);
    return NextResponse.json({ error: 'Gagal mencatat pengeluaran gerobak.' }, { status: 500 });
  }
}