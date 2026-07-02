import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, password } = body;

    if (!nama || !password) {
      return NextResponse.json({ error: 'Nama dan password wajib diisi.' }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Kredensial server tidak lengkap.' }, { status: 500 });
    }

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Membaca data Master_Kru dari kolom A sampai E
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Master_Kru!A:E',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return NextResponse.json({ error: 'Data master kru kosong.' }, { status: 404 });
    }

    // Cari baris yang nama krunya cocok, berstatus aktif, dan password-nya sesuai
    // Struktur baris: ID_Kru(0) | Nama(1) | Cabang(2) | Status(3) | Password(4)
    const kruDitemukan = rows.slice(1).find(row => {
      const rowNama = row[1] ? row[1].toString().trim().toLowerCase() : '';
      const rowStatus = row[3] ? row[3].toString().trim().toLowerCase() : '';
      const rowPassword = row[4] ? row[4].toString().trim() : '';

      return rowNama === nama.trim().toLowerCase() && 
             rowStatus === 'aktif' && 
             rowPassword === password.toString().trim();
    });

    if (!kruDitemukan) {
      return NextResponse.json({ error: 'Kombinasi nama atau password salah / akun tidak aktif.' }, { status: 401 });
    }

    // Jika sukses, kembalikan data profil kru untuk disimpan di sesi browser (Session)
    return NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      kru: {
        id: kruDitemukan[0],
        nama: kruDitemukan[1],
        cabang: kruDitemukan[2]
      }
    });

  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Terjadi kegagalan sistem pada server login.' }, { status: 500 });
  }
}