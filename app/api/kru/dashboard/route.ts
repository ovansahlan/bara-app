import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const namaKru = (searchParams.get('nama') || '').toLowerCase();
    const cabang = (searchParams.get('cabang') || '').toLowerCase(); // 'kedai' atau 'gerobak'

    if (!namaKru || !cabang) {
      return NextResponse.json({ error: 'Parameter nama dan cabang diperlukan.' }, { status: 400 });
    }

    // Identifikasi Bulan Berjalan
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const prefixTanggalID = `/${month}/${year}`; 
    const prefixTanggalWeb = `${year}-${month}`; 

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) return NextResponse.json({ error: 'Kredensial error' }, { status: 500 });

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({ email: clientEmail, key: formattedKey, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
    const sheets = google.sheets({ version: 'v4', auth });

    // Tentukan range omset berdasarkan cabang
    const rangeOmset = cabang === 'gerobak' ? 'Penjualan_Gerobak!A:H' : 'Penjualan!A:H';

    const [resOmset, resAbsen] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: rangeOmset }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Absensi!A:G' }).catch(() => ({ data: { values: [] } }))
    ]);

    const parseRupiah = (val: any) => {
      if (!val) return 0;
      let str = val.toString().trim();
      if (/(,|\.)\d{2}$/.test(str)) str = str.slice(0, -3);
      return parseInt(str.replace(/\D/g, ''), 10) || 0;
    };

    // 1. Hitung Omset Cabang Bulan Ini
    let totalOmsetBulanan = 0;
    (resOmset.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalOmsetBulanan += parseRupiah(row[7]);
      }
    });

    // 2. Hitung Rapor Absensi Kru Terkait (Bulan Ini)
    let totalHadir = 0;
    let totalTelat = 0;
    let totalIzin = 0;
    let totalAlfa = 0;
    let poinDisiplin = 100; // Modal awal 100 poin

    (resAbsen.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      const nama = row[3] ? row[3].toString().toLowerCase().trim() : '';
      const status = row[5] ? row[5].toString().toLowerCase().trim() : ''; // Hadir / Telat / Sakit / Izin / Alfa

      if ((tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) && nama === namaKru) {
        if (status.includes('hadir') || status.includes('tepat')) {
          totalHadir += 1;
        } else if (status.includes('telat') || status.includes('terlambat')) {
          totalHadir += 1;
          totalTelat += 1;
          poinDisiplin -= 2; // Potong 2 poin jika telat
        } else if (status.includes('sakit') || status.includes('izin')) {
          totalIzin += 1;
          poinDisiplin -= 0.5; // Potong 0.5 poin untuk izin (loyalty tracking)
        } else if (status.includes('alfa') || status.includes('mangkir')) {
          totalAlfa += 1;
          poinDisiplin -= 10; // Potong 10 poin jika mangkir
        }
      }
    });

    // Cegah poin minus
    if (poinDisiplin < 0) poinDisiplin = 0;

    return NextResponse.json({
      success: true,
      cabang,
      omsetBulanIni: totalOmsetBulanan,
      targetOmset: cabang === 'gerobak' ? 20000000 : 45000000, // Target Gerobak 20jt, Kedai 45jt
      evaluasi: {
        poin: poinDisiplin,
        hadir: totalHadir,
        telat: totalTelat,
        izin: totalIzin,
        alfa: totalAlfa
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat data dashboard kru.' }, { status: 500 });
  }
}