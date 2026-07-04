import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    const [targetYear, targetMonth] = tanggalFilter.split('-');
    const targetMonthNum = parseInt(targetMonth, 10);
    const prefixTanggalWeb = `${targetYear}-${targetMonth}`; 

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

    // 🔥 FIX: Tarik Omset Murni dari Penjualan_Gerobak
    const [resPenjualanGerobak, resPengeluaran, resMasterKru] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan_Gerobak!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Master_Kru!A:E' }).catch(() => ({ data: { values: [] } }))
    ]);

    const parseRupiah = (val: any) => {
      if (!val) return 0;
      let str = val.toString().trim();
      if (/(,|\.)\d{2}$/.test(str)) str = str.slice(0, -3);
      return parseInt(str.replace(/\D/g, ''), 10) || 0;
    };

    const normalisasiTanggal = (str: string) => {
      if (!str) return '';
      str = str.trim();
      if (/^\d+$/.test(str)) {
        const serial = parseInt(str, 10);
        const jsDate = new Date((serial - 25569) * 24 * 3600 * 1000);
        const tgl = String(jsDate.getUTCDate()).padStart(2, '0');
        const bln = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
        const thn = jsDate.getUTCFullYear();
        return `${thn}-${bln}-${tgl}`;
      }
      const pemisah = str.includes('/') ? '/' : (str.includes('-') ? '-' : '');
      if (!pemisah) return str;
      const bagian = str.split(pemisah);
      if (bagian.length !== 3) return str;
      if (bagian[0].length === 4) return `${bagian[0]}-${bagian[1].padStart(2, '0')}-${bagian[2].padStart(2, '0')}`;
      if (bagian[2].length === 4 || bagian[2].length === 2) {
        let thn = bagian[2];
        if (thn.length === 2) thn = '20' + thn; 
        const p1 = parseInt(bagian[0], 10);
        const p2 = parseInt(bagian[1], 10);
        let blnNum = p2, tglNum = p1;
        if (p1 === targetMonthNum && p2 !== targetMonthNum) { blnNum = p1; tglNum = p2; }
        else if (p1 > 12) { tglNum = p1; blnNum = p2; }
        else if (p2 > 12) { blnNum = p1; tglNum = p2; }
        return `${thn}-${String(blnNum).padStart(2, '0')}-${String(tglNum).padStart(2, '0')}`;
      }
      return str;
    };

    const gerobakKru = new Set<string>();
    (resMasterKru.data.values || []).slice(1).forEach(row => {
      const namaKolomA = (row[0] || '').toString().toLowerCase().trim();
      const isGerobak = row.some(cell => cell.toString().toLowerCase().trim() === 'gerobak');
      if (isGerobak && namaKolomA) gerobakKru.add(namaKolomA);
    });

    const omsetHarian = { total: 0 };
    let pengeluaranHarian = 0;
    let akumulasiOmsetBulanan = 0;
    const riwayatBelanjaGerobak: any[] = [];

    // 1. HITUNG OMSET LANGSUNG DARI PENJUALAN GEROBAK
    (resPenjualanGerobak.data.values || []).slice(1).forEach(row => {
      let rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (!rowTanggal) return; 
      
      rowTanggal = normalisasiTanggal(rowTanggal);
      const totalBarisOmset = parseRupiah(row[7]); 

      if (rowTanggal.startsWith(prefixTanggalWeb)) {
        akumulasiOmsetBulanan += totalBarisOmset;
      }
      if (rowTanggal === tanggalFilter) {
        omsetHarian.total += totalBarisOmset; 
      }
    });

    // 2. AMBIL DATA PENGELUARAN/BELANJA GEROBAK DARI TAB PENGELUARAN
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      const namaKru = (row[1] || '').toString().toLowerCase().trim();
      let rowTanggal = row[0] ? row[0].toString().trim() : '';
      
      if (!rowTanggal || !gerobakKru.has(namaKru)) return;

      rowTanggal = normalisasiTanggal(rowTanggal); 
      const nominal = parseRupiah(row[7]);

      if (rowTanggal === tanggalFilter) {
        pengeluaranHarian += nominal;
      }

      riwayatBelanjaGerobak.push({
        tanggal: rowTanggal === tanggalFilter ? 'Hari Ini' : rowTanggal,
        kategori: row[2] || '-',
        barang: row[3] || 'Barang Tidak Diketahui',
        qty: row[4] || 0,
        satuan: row[5] || 'Pcs',
        nominal: nominal
      });
    });

    const top5History = riwayatBelanjaGerobak.slice(-5).reverse();

    return NextResponse.json({
      omset: omsetHarian,
      totalKeluar: pengeluaranHarian,
      totalOmsetBulanIni: akumulasiOmsetBulanan, 
      historyBelanja: top5History 
    });

  } catch (error: any) {
    console.error('API Gerobak Dashboard Error:', error);
    return NextResponse.json({ error: 'Gagal memuat ringkasan.' }, { status: 500 });
  }
}