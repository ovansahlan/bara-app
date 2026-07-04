import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    // Pecah tanggal target (Contoh: "2026-07-04" -> Tahun: 2026, Bulan: 07)
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

    // Tarik seluruh data lembar kerja untuk kompilasi laporan Owner
    const [resPenjualan, resPengeluaran, resStokIn, resStokOut, resMasterKru] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Masuk!A:G' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Keluar!A:I' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Master_Kru!A:E' }).catch(() => ({ data: { values: [] } }))
    ]);

    const parseRupiah = (val: any) => {
      if (!val) return 0;
      let str = val.toString().trim();
      if (/(,|\.)\d{2}$/.test(str)) str = str.slice(0, -3);
      return parseInt(str.replace(/\D/g, ''), 10) || 0;
    };
    const parseQty = (val: any) => parseFloat(val ? val.toString().replace(',', '.') : '0') || 0;

    // SMART DATE NORMALIZER (Penyaring hulu ledak format Google Sheets)
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

    // IDENTIFIKASI FILTER KRU GEROBAK V.S KEDAI PUSAT
    const gerobakKru = new Set<string>();
    (resMasterKru.data.values || []).slice(1).forEach(row => {
      const namaKru = (row[0] || '').toString().toLowerCase().trim();
      const divisi = row.some(cell => cell.toString().toLowerCase().trim() === 'gerobak');
      if (divisi && namaKru) gerobakKru.add(namaKru);
    });

    // VARIABEL LAPORAN KEDAI VS GEROBAK
    let omsetKedai = 0, pengeluaranKruKedai = 0, belanjaOwnerKedai = 0, HPPKedai = 0;
    let omsetGerobak = 0, pengeluaranKruGerobak = 0, belanjaOwnerGerobak = 0, HPPGerobak = 0;

    const pemakaianKedaiMap: Record<string, { nama: string; qty: number; nilai: number }> = {};
    const pemakaianGerobakMap: Record<string, { nama: string; qty: number; nilai: number }> = {};

    // 1. PROSES DISTRIBUSI OMSET BULANAN
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      let tgl = row[0] ? row[0].toString().trim() : '';
      const penginput = (row[1] || '').toString().toLowerCase().trim();
      if (!tgl) return;

      tgl = normalisasiTanggal(tgl);
      if (!tgl.startsWith(prefixTanggalWeb)) return; // Hanya baca bulan berjalan

      const grossOmset = parseRupiah(row[7]);
      if (gerobakKru.has(penginput)) {
        omsetGerobak += grossOmset;
      } else {
        omsetKedai += grossOmset;
      }
    });

    // 🌟 KODE BARU: ARRAY PENAMPUNG REAL HISTORY LOG 10 TRANSAKSI BELANJA
    const rawHistoryBelanjaOwner: any[] = [];

    // 2. PROSES DISTRIBUSI OPERASIONAL & KUMPULKAN LIVE LOG RIWAYAT
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      let tgl = row[0] ? row[0].toString().trim() : '';
      const penginput = (row[1] || '').toString().toLowerCase().trim();
      if (!tgl) return;

      tgl = normalisasiTanggal(tgl);
      const nominal = parseRupiah(row[7]);
      const kategori = row[2] || 'Lain-lain';
      const namaBarang = row[3] || 'Barang Tanpa Nama';

      // Masukkan record asli ini ke penampung log (tanpa memandang bulan)
      rawHistoryBelanjaOwner.push({
        tanggal: tgl,
        kategori: kategori,
        barang: namaBarang,
        qty: parseQty(row[4]),
        satuan: row[5] || 'Pcs',
        nominal: nominal
      });

      // Proses kalkulasi finansial bulanan untuk Owner Dashboard
      if (tgl.startsWith(prefixTanggalWeb)) {
        if (gerobakKru.has(penginput)) {
          // Asumsi pemisahan Kru vs Owner berdasarkan kategori belanja atau nama tertentu
          if (penginput === 'owner' || penginput === 'pusat') belanjaOwnerGerobak += nominal;
          else pengextKruGerobak += nominal; // Atau sesuaikan dengan manajemen logistik Bos
          pengeluaranKruGerobak += nominal; 
        } else {
          if (penginput === 'owner' || penginput === 'pusat') belanjaOwnerKedai += nominal;
          else pengeluaranKruKedai += nominal;
        }
      }
    });

    // 3. MOVING AVERAGE HPP & LOGISTIK TERPAKAI
    const databaseHPP: Record<string, { totalQtyIn: number; totalCostIn: number }> = {};
    const rawStokIn = resStokIn.data.values || [];
    const rawStokOut = resStokOut.data.values || [];

    rawStokIn.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || idStr.toLowerCase() === 'id produk') return;
      if (!databaseHPP[idStr]) databaseHPP[idStr] = { totalQtyIn: 0, totalCostIn: 0 };
      databaseHPP[idStr].totalQtyIn += parseQty(row[3]);
      databaseHPP[idStr].totalCostIn += parseRupiah(row[5]);
    });

    // Hitung Pemakaian Logistik Keluar per Cabang
    rawStokOut.slice(1).forEach(row => {
      let tgl = row[0] ? row[0].toString().trim() : '';
      const idStr = row[1] ? row[1].toString().trim() : '';
      const namaBarang = row[2] || 'Bahan';
      const qtyOut = parseQty(row[3]);
      const tujuan = (row[8] || row[4] || '').toString().toLowerCase().trim();

      if (!tgl || !idStr || idStr.toLowerCase() === 'id produk') return;
      tgl = normalisasiTanggal(tgl);

      if (tgl.startsWith(prefixTanggalWeb)) {
        const itemHPP = databaseHPP[idStr];
        const hargaRata2 = itemHPP && itemHPP.totalQtyIn > 0 ? (itemHPP.totalCostIn / itemHPP.totalQtyIn) : 0;
        const nilaiKerugianHPP = Math.round(qtyOut * hargaRata2);

        if (tujuan.includes('gerobak')) {
          HPPGerobak += nilaiKerugianHPP;
          if (!pemakaianGerobakMap[idStr]) pemakaianGerobakMap[idStr] = { nama: namaBarang, qty: 0, nilai: 0 };
          pemakaianGerobakMap[idStr].qty += qtyOut;
          pemakaianGerobakMap[idStr].nilai += nilaiKerugianHPP;
        } else {
          HPPKedai += nilaiKerugianHPP;
          if (!pemakaianKedaiMap[idStr]) pemakaianKedaiMap[idStr] = { nama: namaBarang, qty: 0, nilai: 0 };
          pemakaianKedaiMap[idStr].qty += qtyOut;
          pemakaianKedaiMap[idStr].nilai += nilaiKerugianHPP;
        }
      }
    });

    // Sisa Stok Aktif Gudang Terpusat
    let nilaiAsetGudangTerpusat = 0;
    const kalkulasiGudang: Record<string, { qtyIn: number; costIn: number; qtyOut: number }> = {};
    
    rawStokIn.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || idStr.toLowerCase() === 'id produk') return;
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { qtyIn: 0, costIn: 0, qtyOut: 0 };
      kalkulasiGudang[idStr].qtyIn += parseQty(row[3]);
      kalkulasiGudang[idStr].costIn += parseRupiah(row[5]);
    });
    rawStokOut.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || idStr.toLowerCase() === 'id produk') return;
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { qtyIn: 0, costIn: 0, qtyOut: 0 };
      kalkulasiGudang[idStr].qtyOut += parseQty(row[3]);
    });
    Object.keys(kalkulasiGudang).forEach(id => {
      const item = kalkulasiGudang[id];
      const hrgRata = item.qtyIn > 0 ? (item.costIn / item.qtyIn) : 0;
      const sisa = item.qtyIn - item.qtyOut;
      if (sisa > 0) nilaiAsetGudangTerpusat += Math.round(sisa * hrgRata);
    });

    // FORMULASI LABA BERSIH (NET PROFIT) MAKSIMAL
    const labaBersihKedai = Math.round(omsetKedai - (pengeluaranKruKedai + belanjaOwnerKedai) - HPPKedai);
    const labaBersihGerobak = Math.round(omsetGerobak - (pengeluaranKruGerobak + belanjaOwnerGerobak) - HPPGerobak);
    const totalLabaGabungan = Math.round(labaBersihKedai + labaBersihGerobak);

    // Slice 10 mutasi riwayat belanja terakhir murni dari Google Sheets
    const top10HistoryBelanjaOwner = rawHistoryBelanjaOwner.slice(-10).reverse();

    return NextResponse.json({
      totalLabaGabungan,
      kedai: {
        omset: omsetKedai,
        pengeluaranKru: pengeluaranKruKedai,
        belanjaOwner: belanjaOwnerKedai,
        totalNilaiPemakaian: HPPKedai,
        labaBersih: labaBersihKedai,
        pemakaian: Object.values(pemakaianKedaiMap)
      },
      gerobak: {
        omset: omsetGerobak,
        pengeluaranKru: pengeluaranKruGerobak,
        belanjaOwner: belanjaOwnerGerobak,
        totalNilaiPemakaian: HPPGerobak,
        labaBersih: labaBersihGerobak,
        pemakaian: Object.values(pemakaianGerobakMap)
      },
      metricsGudang: {
        nilaiAsetGudang: nilaiAsetGudangTerpusat,
        saldoGudangKas: 75000000 // Teks dummy kas gudang statis/bisa dinonaktifkan
      },
      historyBelanjaOwner: top10HistoryBelanjaOwner // 🔥 SYNC 100% SUKSES DENGAN FRONTEND
    });

  } catch (error: any) {
    console.error('API Owner Core Engine Error:', error);
    return NextResponse.json({ error: 'Gagal memproses konsol owner pusat.' }, { status: 500 });
  }
}