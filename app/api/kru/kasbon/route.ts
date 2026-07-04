import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const getAuthSheets = () => {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return { sheets: google.sheets({ version: 'v4', auth }), spreadsheetId };
};

// HELPER: Penjaga agar tanggal serial Google Sheets tetap tampil cantik di HP Kru
const normalisasiTanggal = (str: string) => {
  if (!str) return '-';
  str = str.trim();
  if (/^\d+$/.test(str)) {
    const serial = parseInt(str, 10);
    const jsDate = new Date((serial - 25569) * 24 * 3600 * 1000);
    const tgl = String(jsDate.getUTCDate()).padStart(2, '0');
    const bln = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
    const thn = jsDate.getUTCFullYear();
    return `${thn}-${bln}-${tgl}`;
  }
  return str;
};

// MENGAMBIL DATA RIWAYAT & TOTAL KASBON
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const namaKru = (searchParams.get('nama') || '').toLowerCase().trim();

    if (!namaKru) return NextResponse.json({ error: 'Nama kru wajib diisi.' }, { status: 400 });

    const { sheets, spreadsheetId } = getAuthSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Kasbon!A:E' });
    const rows = res.data.values || [];

    let totalKasbon = 0;
    const riwayat: any[] = [];

    // Baca dari bawah ke atas agar data terbaru ada di paling atas
    for (let i = rows.length - 1; i > 0; i--) {
      const row = rows[i];
      const nama = (row[1] || '').toLowerCase().trim();
      
      if (nama === namaKru) {
        const nominal = parseInt((row[2] || '0').toString().replace(/\D/g, ''), 10);
        const status = (row[4] || '').trim();
        
        riwayat.push({
          tanggal: normalisasiTanggal(row[0]), // Terapkan Normalizer
          nominal: nominal,
          keperluan: row[3] || '-',
          status: status
        });

        if (status.toLowerCase() === 'belum lunas') {
          totalKasbon += nominal;
        }
      }
    }

    return NextResponse.json({ success: true, data: { totalKasbon, riwayat } });
  } catch (error) {
    console.error('API Kasbon GET Error:', error);
    return NextResponse.json({ error: 'Gagal memuat data kasbon.' }, { status: 500 });
  }
}

// MENGAJUKAN KASBON BARU
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, nama, nominal, keperluan } = body;

    if (!nama || !nominal || !keperluan) {
      return NextResponse.json({ error: 'Data pengajuan belum lengkap.' }, { status: 400 });
    }

    // Gunakan tanggal dari form (Bisa Backdate). Jika kosong, baru pakai hari ini.
    let formatTanggal = tanggal;
    if (!formatTanggal) {
      const today = new Date();
      const localDate = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const tgl = String(localDate.getDate()).padStart(2, '0');
      const bln = String(localDate.getMonth() + 1).padStart(2, '0');
      const thn = localDate.getFullYear();
      formatTanggal = `${thn}-${bln}-${tgl}`;
    }

    const { sheets, spreadsheetId } = getAuthSheets();
    const barisBaru = [formatTanggal, nama.toLowerCase(), nominal, keperluan, 'Belum Lunas'];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Kasbon!A:E',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [barisBaru] },
    });

    return NextResponse.json({ success: true, message: 'Pengajuan kasbon berhasil dicatat!' });
  } catch (error) {
    console.error('API Kasbon POST Error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pengajuan.' }, { status: 500 });
  }
}