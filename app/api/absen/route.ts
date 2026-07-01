import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    // 1. Ambil data kiriman dari Frontend
    const body = await request.json();
    const { nama, shift, status, fotoBase64 } = body;

    // 2. Validasi kredensial environment variables
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Kredensial Google Sheets API belum dikonfigurasi di server.' },
        { status: 500 }
      );
    }

    // 3. FIX: Gunakan satu objek opsi konfigurasi {} agar sesuai dengan aturan TypeScript google-auth
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'), // Mengamankan format baris baru string key
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 4. Siapkan penanggalan data baris baru
    const tanggalSekarang = new Date().toISOString().split('T')[0];
    const waktuSekarang = new Date().toTimeString().split(' ')[0];

    // Menyusun kolom: Tanggal, Waktu, Nama, Shift, Status, Data Foto
    const barisBaru = [tanggalSekarang, waktuSekarang, nama, shift, status, fotoBase64];

    // 5. Eksekusi penulisan data ke dalam Google Sheets (Lembar: "Absen")
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Absen!A:F', 
      valueInputOption: 'USER_ENTERED', 
      requestBody: {
        values: [barisBaru],
      },
    });

    return NextResponse.json({ success: true, message: 'Data presensi sukses ditulis ke Google Sheets!' });

  } catch (error: any) {
    console.error('Google Sheets API Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengirim data ke server.', details: error.message },
      { status: 500 }
    );
  }
}