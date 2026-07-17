import { NextResponse } from 'next/server';
import { getAuthSheets } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, namaKru, shift, tunai, qris, edc, grab, total } = body;

    if (!tanggal || typeof tanggal !== 'string' || !tanggal.includes('-')) {
      return NextResponse.json({ error: 'Tanggal wajib diisi dengan format YYYY-MM-DD.' }, { status: 400 });
    }

    const { sheets, spreadsheetId } = getAuthSheets();

    // Tulis tanggal dalam format YYYY-MM-DD langsung tanpa prefix kutip (')
    // agar Google Sheets mengenalinya sebagai Tipe Data Tanggal (Date) murni
    const dataBaris = [
      tanggal, 
      namaKru, 
      shift, 
      parseInt(tunai, 10) || 0, 
      parseInt(qris, 10) || 0, 
      parseInt(edc, 10) || 0, 
      parseInt(grab, 10) || 0, 
      parseInt(total, 10) || 0
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Penjualan_Gerobak!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [dataBaris] },
    });

    return NextResponse.json({ success: true, message: 'Omset Gerobak berhasil disimpan!' });

  } catch (error: any) {
    console.error('API Gerobak Penjualan POST Error:', error);
    return NextResponse.json({ error: 'Gagal mencatat omset gerobak.' }, { status: 500 });
  }
}