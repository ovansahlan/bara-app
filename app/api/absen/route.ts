import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, shift, status, fotoBase64 } = body;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID; // ID Folder Drive Baru

    if (!spreadsheetId || !clientEmail || !privateKey || !folderId) {
      return NextResponse.json(
        { error: 'Kredensial atau ID Folder Drive belum lengkap dikonfigurasi.' },
        { status: 500 }
      );
    }

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file' // Menambahkan scope izin untuk akses menulis file Drive
      ],
    });

    const tanggalSekarang = new Date().toISOString().split('T')[0];
    const waktuSekarang = new Date().toTimeString().split(' ')[0];

    // ==========================================
    // PROSES 1: PROSES UPLOAD FOTO KE GOOGLE DRIVE
    // ==========================================
    const drive = google.drive({ version: 'v3', auth });

    // Membersihkan header data URI base64 jika ada (cth: data:image/jpeg;base64,)
    const cleanBase64 = fotoBase64.replace(/^data:image\/\w+;base64,/, "");
    // Mengonversi string teks menjadi binary Buffer Node.js asli
    const buffer = Buffer.from(cleanBase64, 'base64');

    const responseDrive = await drive.files.create({
      requestBody: {
        name: `Absen_${nama}_${tanggalSekarang}_${waktuSekarang.replace(/:/g, '-')}.jpg`,
        parents: [folderId], // Dimasukkan ke folder spesifik yang sudah kita buat
      },
      media: {
        mimeType: 'image/jpeg',
        body: Readable.from(buffer), // Mengubah buffer menjadi readable stream agar bisa di-upload
      },
      fields: 'id, webViewLink',
    });

    const fileId = responseDrive.data.id;
    const viewLink = responseDrive.data.webViewLink;

    if (!fileId || !viewLink) {
      throw new Error('Gagal mendapatkan respon ID atau Link dari Google Drive.');
    }

    // Mengatur hak akses file agar Owner (kamu) bisa membukanya langsung via link tanpa tertahan permission
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // ==========================================
    // PROSES 2: TULIS FORMULA LINK KE GOOGLE SHEETS
    // ==========================================
    const sheets = google.sheets({ version: 'v4', auth });

    // Menggunakan formula HYPERLINK bawaan Google Sheets agar sel rapi bertuliskan "Lihat Foto"
    const formulaHyperlink = `=HYPERLINK("${viewLink}"; "Lihat Foto")`;

    const barisBaru = [tanggalSekarang, waktuSekarang, nama, shift, status, formulaHyperlink];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Absen!A:F', 
      valueInputOption: 'USER_ENTERED', // Wajib USER_ENTERED agar Google Sheets mengeksekusi rumusan =HYPERLINK() kita
      requestBody: {
        values: [barisBaru],
      },
    });

    return NextResponse.json({ success: true, message: 'Presensi dan Foto sukses diamankan!' });

  } catch (error: any) {
    console.error('SaaS Integration Error:', error);
    return NextResponse.json(
      { error: 'Gagal memproses unggahan media.', details: error.message },
      { status: 500 }
    );
  }
}