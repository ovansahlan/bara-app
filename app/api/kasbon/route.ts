import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

// 1. FUNGSI GET: Menghitung Akumulasi Total Kasbon Berjalan per Kru di Bulan Terpilih
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    const [year, month] = tanggal.split('-');
    const prefixBulan = `/${month}/${year}`; // Filter pencocokan format tanggal lokal DD/MM/YYYY

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Kredensial tidak lengkap' }, { status: 500 });
    }

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Tarik data dari tabsheet Kasbon
    const resKasbon = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Kasbon!A:E',
    });

    const parseRupiah = (val: any) => {
      if (!val) return 0;
      let str = val.toString().trim();
      if (/(,|\.)\d{2}$/.test(str)) str = str.slice(0, -3); // Buang desimal jika ada
      return parseInt(str.replace(/\D/g, ''), 10) || 0;
    };

    const rekapKasbonKru: Record<string, number> = {};
    const rows = resKasbon.data.values || [];

    rows.slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      const nama = row[1] ? row[1].toString().trim() : '';
      const nominal = parseRupiah(row[2]);

      if (!nama || nama.toLowerCase() === 'nama kru') return;

      // Filter: Hanya hitung jika baris kasbon berada pada Bulan & Tahun yang sama
      if (rowTanggal.endsWith(prefixBulan) || rowTanggal.includes(prefixBulan)) {
        if (!rekapKasbonKru[nama]) {
          rekapKasbonKru[nama] = 0;
        }
        rekapKasbonKru[nama] += nominal;
      }
    });

    return NextResponse.json({ success: true, rekapKasbonKru });

  } catch (error: any) {
    console.error('API Kasbon GET Error:', error);
    return NextResponse.json({ error: 'Gagal memuat rekap kasbon berjalan.' }, { status: 500 });
  }
}

// 2. FUNGSI POST: Mengunci Data Sesuai Struktur Kolom Baru Anda
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, namaKru, nominal, keterangan } = body;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Kredensial tidak lengkap.' }, { status: 500 });
    }

    const cleanNumber = (val: any) => {
      if (!val) return 0;
      const str = val.toString().replace(/\D/g, '');
      return parseInt(str, 10) || 0;
    };

    const nilaiKasbonBersih = cleanNumber(nominal);

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const [year, month, day] = tanggal.split('-');
    const formatTanggalAman = `'${day}/${month}/${year}`; // Proteksi tanda petik (') murni teks baku
    const formatBulan = `${month}/${year}`; // Mengisi kolom Bulan otomatis secara berkala

    // PARSING URUTAN MATRIKS PERSIS SEPERTI STRUKTUR TABLE ANDA:
    // Kolom A (0): Tanggal
    // Kolom B (1): Nama Kru
    // Kolom C (2): Nominal Kasbon (Rp)
    // Kolom D (3): Keterangan
    // Kolom E (4): Bulan
    const dataBaris = [
      formatTanggalAman, 
      namaKru, 
      nilaiKasbonBersih, 
      keterangan || 'Pinjaman Operasional', 
      formatBulan
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Kasbon!A:E',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [dataBaris] },
    });

    return NextResponse.json({ success: true, message: 'Data Kasbon berhasil dikunci ke spreadsheet!' });

  } catch (error: any) {
    console.error('API Kasbon POST Error:', error);
    return NextResponse.json({ error: 'Gagal mencatat kasbon.', details: error.message }, { status: 500 });
  }
}