import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, shift, fotoBase64 } = body;

    if (!nama || !shift || !fotoBase64) {
      return NextResponse.json({ error: 'Data tidak lengkap. Pastikan foto sudah diambil.' }, { status: 400 });
    }

    // 1. Ambil Waktu Server Murni (WIB)
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      timeZone: 'Asia/Jakarta', 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false 
    };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const timeString = formatter.format(now).replace(', ', ' ');
    const tanggalSekarang = timeString.split(' ')[0];
    const waktuSekarang = timeString.split(' ')[1].replace(/:/g, '-');

    // 2. Upload Foto ke Vercel Blob
    const cleanBase64 = fotoBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, 'base64');
    const namaFile = `absen_${nama}_${tanggalSekarang}_${waktuSekarang}.jpg`;

    const blob = await put(namaFile, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });
    const viewLink = blob.url;

    // 3. Simpan ke Google Sheets
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Kredensial API tidak lengkap.' }, { status: 500 });
    }

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Bikin link foto bisa di-klik di Sheets
    const formulaHyperlink = `=HYPERLINK("${viewLink}"; "Lihat Foto")`;

    // Susunan: A (Timestamp) | B (Nama) | C (Shift) | D (Foto Bukti)
    const dataBaris = [timeString, nama.toLowerCase(), shift, formulaHyperlink];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Absensi!A:D',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [dataBaris] },
    });

    return NextResponse.json({ success: true, message: 'Absensi dan foto berhasil direkam!' });

  } catch (error: any) {
    console.error('API Absen Error:', error);
    return NextResponse.json({ error: 'Gagal memproses absen ke server.' }, { status: 500 });
  }
}