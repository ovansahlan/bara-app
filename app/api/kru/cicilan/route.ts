import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const namaKru = (searchParams.get('nama') || '').toLowerCase().trim();

    if (!namaKru) return NextResponse.json({ error: 'Nama kru wajib diisi.' }, { status: 400 });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Tarik data dari Kolom A sampai E
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Cicilan!A:E' });
    const rows = res.data.values || [];

    const daftarCicilanAktif: any[] = [];
    let totalNominalCicilan = 0;

    // Ambil waktu kalender saat ini (Real-time Jakarta)
    const today = new Date();
    const localDate = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const currentYear = localDate.getFullYear();
    const currentMonth = localDate.getMonth() + 1; // getMonth() mulai dari 0, jadi ditambah 1

    rows.slice(1).forEach(row => {
      const nama = (row[0] || '').toLowerCase().trim();
      const deskripsi = row[1] || '';
      const nominal = parseInt((row[2] || '0').toString().replace(/\D/g, ''), 10);
      
      const bulanMulai = (row[3] || '').trim(); // Contoh: "2025-04"
      const totalTenor = parseInt((row[4] || '0').toString(), 10); // Contoh: 18

      if (nama === namaKru && bulanMulai && totalTenor > 0) {
        
        // Pecah "2025-04" menjadi Angka Tahun (2025) dan Bulan (4)
        const [startYearStr, startMonthStr] = bulanMulai.split('-');
        const startYear = parseInt(startYearStr, 10);
        const startMonth = parseInt(startMonthStr, 10);

        // ALGORITMA CERDAS: Hitung otomatis bulan ini adalah cicilan ke berapa
        const cicilanKe = ((currentYear - startYear) * 12) + (currentMonth - startMonth) + 1;

        // FILTER OTOMATIS: 
        // 1. Apakah bulan cicilan sudah dimulai? (cicilanKe > 0)
        // 2. Apakah cicilan belum lunas? (cicilanKe <= totalTenor)
        if (cicilanKe > 0 && cicilanKe <= totalTenor) {
          
          daftarCicilanAktif.push({ 
            deskripsi, 
            nominal, 
            tenor: `${cicilanKe}/${totalTenor}` // Hasil Output: "16/18"
          });
          totalNominalCicilan += nominal;
          
        }
        // Jika cicilanKe > totalTenor, mesin otomatis membuangnya (Dianggap sudah Lunas)
      }
    });

    return NextResponse.json({ success: true, data: { totalNominalCicilan, list: daftarCicilanAktif } });
  } catch (error) {
    console.error('API Cicilan Error:', error);
    return NextResponse.json({ error: 'Gagal memuat data cicilan tetap.' }, { status: 500 });
  }
}