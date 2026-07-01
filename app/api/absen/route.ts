import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { put } from '@vercel/blob'; // Mengimpor modul upload bawaan Vercel

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, shift, status, fotoBase64 } = body;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Kredensial Google Sheets belum lengkap dikonfigurasi.' },
        { status: 500 }
      );
    }

    const tanggalSekarang = new Date().toISOString().split('T')[0];
    const waktuSekarang = new Date().toTimeString().split(' ')[0];

    // =======================================================
    // PROSES 1: UPLOAD FOTO KE VERCEL BLOB (SANGAT RINGKAS & CEPAT)
    // =======================================================
    const cleanBase64 = fotoBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    // Menyusun nama file unik untuk di-upload
    const namaFile = `absen_${nama}_${tanggalSekarang}_${waktuSekarang.replace(/:/g, '-')}.jpg`;

    const blob = await put(namaFile, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    // Link foto publik yang dihasilkan oleh server Vercel
    const viewLink = blob.url;

    // =======================================================
    // PROSES 2: TULIS RUMUS LINK KE GOOGLE SHEETS
    // =======================================================
    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const formulaHyperlink = `=HYPERLINK("${viewLink}"; "Lihat Foto")`;

    const barisBaru = [tanggalSekarang, waktuSekarang, nama, shift, status, formulaHyperlink];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Absen!A:F', 
      valueInputOption: 'USER_ENTERED', 
      requestBody: {
        values: [barisBaru],
      },
    });

    return NextResponse.json({ success: true, message: 'Presensi online dan foto mini sukses disimpan!' });

  } catch (error: any) {
    console.error('SaaS Multi-Cloud Error:', error);
    return NextResponse.json(
      { error: `Gagal mengunci data logistik. Alasan: ${error.message}` },
      { status: 500 }
    );
  }
}