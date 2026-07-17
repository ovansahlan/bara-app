import { NextResponse } from 'next/server';
import { getAuthSheets, normalisasiTanggal, parseRupiah } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

// 1. FUNGSI GET: Menghitung Akumulasi Total Kasbon Berjalan per Kru di Bulan Terpilih
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    if (!tanggal || typeof tanggal !== 'string' || !tanggal.includes('-')) {
      return NextResponse.json({ error: 'Format tanggal filter tidak valid (harus YYYY-MM-DD).' }, { status: 400 });
    }

    const [year, month] = tanggal.split('-');
    const prefixTanggalWeb = `${year}-${month}`; // Filter pencocokan YYYY-MM

    const { sheets, spreadsheetId } = getAuthSheets();

    // Tarik data dari tabsheet Kasbon
    const resKasbon = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Kasbon!A:E',
    });

    const rekapKasbonKru: Record<string, number> = {};
    const rows = resKasbon.data.values || [];

    rows.slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      const nama = row[1] ? row[1].toString().trim() : '';
      const nominal = parseRupiah(row[2]);

      if (!nama || nama.toLowerCase() === 'nama kru') return;

      // Filter: Hanya hitung jika baris kasbon berada pada Bulan & Tahun yang sama (menggunakan normalisasiTanggal)
      const normalizedDate = normalisasiTanggal(rowTanggal);
      if (normalizedDate.startsWith(prefixTanggalWeb)) {
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

    if (!tanggal || typeof tanggal !== 'string' || !tanggal.includes('-')) {
      return NextResponse.json({ error: 'Tanggal wajib diisi dengan format YYYY-MM-DD.' }, { status: 400 });
    }

    const cleanNumber = (val: any) => {
      if (!val) return 0;
      const str = val.toString().replace(/\D/g, '');
      return parseInt(str, 10) || 0;
    };

    const nilaiKasbonBersih = cleanNumber(nominal);

    const { sheets, spreadsheetId } = getAuthSheets();

    const [year, month, day] = tanggal.split('-');
    const formatBulan = `${month}/${year}`; 

    // Tulis tanggal dalam format YYYY-MM-DD langsung tanpa prefix kutip (')
    // agar Google Sheets mengenalinya sebagai Tipe Data Tanggal (Date) murni
    const dataBaris = [
      tanggal, 
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