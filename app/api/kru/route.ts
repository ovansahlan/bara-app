import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cabangFilter = searchParams.get('cabang'); // Parameter opsional: 'kedai' atau 'gerobak'

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

    // Tarik data dari tab Master_Kru kolom A sampai D
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Master_Kru!A:D',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return NextResponse.json({ success: true, kru: [] });
    }

    // Saring data: Hanya ambil yang statusnya 'Aktif'
    // Jika ada parameter cabang, saring juga berdasarkan cabangnya
    const daftarKruAktif = rows.slice(1)
      .map(row => ({
        id: row[0] ? row[0].toString().trim() : '',
        nama: row[1] ? row[1].toString().trim() : '',
        cabang: row[2] ? row[2].toString().trim() : '',
        status: row[3] ? row[3].toString().trim() : '',
      }))
      .filter(kru => {
        const isAktif = kru.status.toLowerCase() === 'aktif';
        if (!cabangFilter) return isAktif;
        return isAktif && kru.cabang.toLowerCase() === cabangFilter.toLowerCase();
      });

    return NextResponse.json({ success: true, kru: daftarKruAktif });

  } catch (error: any) {
    console.error('API Kru GET Error:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar master kru harian.' }, { status: 500 });
  }
}