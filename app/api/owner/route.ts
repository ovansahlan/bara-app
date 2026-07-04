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

    // 🔥 MENARIK 7 TAB SPESIFIK TANPA PERLU MASTER_KRU (Karena sudah terpisah tab)
    const [resPenjualan, resPenjualanGrb, resPengeluaranKedai, resPengeluaranGrb, resBelanjaOwner, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan_Gerobak!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran_Gerobak!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Belanja_Owner!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Masuk!A:G' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Keluar!A:I' }).catch(() => ({ data: { values: [] } }))
    ]);

    const parseRupiah = (val: any) => {
      if (!val) return 0;
      let str = val.toString().trim();
      if (/(,|\.)\d{2}$/.test(str)) str = str.slice(0, -3);
      return parseInt(str.replace(/\D/g, ''), 10) || 0;
    };
    const parseQty = (val: any) => parseFloat(val ? val.toString().replace(',', '.') : '0') || 0;

    const normalisasiTanggal = (str: string) => {
      if (!str) return '';
      str = str.trim();
      if (/^\d+$/.test(str)) {
        const serial = parseInt(str, 10);
        const jsDate = new Date((serial - 25569) * 24 * 3600 * 1000);
        const tgl = String(jsDate.getUTCDate()).padStart(2, '0');
        const bln = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
        return `${jsDate.getUTCFullYear()}-${bln}-${tgl}`;
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

    let omsetKedai = 0, pengeluaranKruKedai = 0, belanjaOwnerKedai = 0, HPPKedai = 0;
    let omsetGerobak = 0, pengeluaranKruGerobak = 0, belanjaOwnerGerobak = 0, HPPGerobak = 0;

    const pemakaianKedaiMap: Record<string, { nama: string; qty: number; nilai: number }> = {};
    const pemakaianGerobakMap: Record<string, { nama: string; qty: number; nilai: number }> = {};
    
    const listBelanjaOwner: any[] = [];
    const listPengeluaranKru: any[] = [];

    // ==========================================
    // 1. PARSING OMSET (DARI TAB MASING-MASING)
    // ==========================================
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      let tgl = row[0] ? normalisasiTanggal(row[0]) : '';
      if (tgl.startsWith(prefixTanggalWeb)) omsetKedai += parseRupiah(row[7]);
    });
    (resPenjualanGrb.data.values || []).slice(1).forEach(row => {
      let tgl = row[0] ? normalisasiTanggal(row[0]) : '';
      if (tgl.startsWith(prefixTanggalWeb)) omsetGerobak += parseRupiah(row[7]);
    });

    // ==========================================
    // 2. PARSING PENGELUARAN KRU KEDAI (A-H)
    // ==========================================
    (resPengeluaranKedai.data.values || []).slice(1).forEach(row => {
      let tgl = row[0] ? normalisasiTanggal(row[0]) : '';
      if (!tgl) return;
      const nominal = parseRupiah(row[7]); // Kolom H
      
      if (tgl.startsWith(prefixTanggalWeb)) pengeluaranKruKedai += nominal;
      
      listPengeluaranKru.push({ 
        tanggal: tgl, 
        outlet: 'Kedai', 
        kategori: row[2] || 'Bar',
        barang: row[3] || 'Bahan', 
        qty: parseQty(row[4]), // Kolom E
        satuan: row[5] || 'Pcs', // Kolom F
        nominal: nominal 
      });
    });

    // ==========================================
    // 3. PARSING PENGELUARAN KRU GEROBAK (A-H)
    // ==========================================
    (resPengeluaranGrb.data.values || []).slice(1).forEach(row => {
      let tgl = row[0] ? normalisasiTanggal(row[0]) : '';
      if (!tgl) return;
      const nominal = parseRupiah(row[7]); // Kolom H
      
      if (tgl.startsWith(prefixTanggalWeb)) pengeluaranKruGerobak += nominal;
      
      listPengeluaranKru.push({ 
        tanggal: tgl, 
        outlet: 'Gerobak', 
        kategori: row[2] || 'Gerobak',
        barang: row[3] || 'Bahan', 
        qty: parseQty(row[4]), // Kolom E
        satuan: row[5] || 'Pcs', // Kolom F
        nominal: nominal 
      });
    });

    // ==========================================
    // 4. PARSING BELANJA OWNER (ADA KOLOM E: PERUNTUKAN)
    // ==========================================
    (resBelanjaOwner.data.values || []).slice(1).forEach(row => {
      let tgl = row[0] ? normalisasiTanggal(row[0]) : '';
      if (!tgl) return;
      
      // PERBAIKAN INDEKS KOLOM
      const peruntukan = (row[4] || '').toString().toLowerCase().trim(); // Kolom E (Indeks 4)
      const qtyOwner = parseQty(row[5]); // Kolom F (Indeks 5)
      const satuanOwner = row[6] || 'Pcs'; // Kolom G (Indeks 6)
      const nominal = parseRupiah(row[7]); // Kolom H (Indeks 7)

      if (tgl.startsWith(prefixTanggalWeb)) {
        if (peruntukan === 'kedai') belanjaOwnerKedai += nominal;
        else if (peruntukan === 'gerobak') belanjaOwnerGerobak += nominal;
      }

      listBelanjaOwner.push({
        tanggal: tgl,
        peruntukan: peruntukan === 'gerobak' ? 'Gerobak' : 'Kedai',
        kategori: row[2] || 'Owner',
        barang: row[3] || 'Aset',
        qty: qtyOwner,
        satuan: satuanOwner,
        nominal: nominal
      });
    });

    // ==========================================
    // 5. PARSING GUDANG & HPP (Stok Keluar Kolom I: Tujuan)
    // ==========================================
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

    rawStokOut.slice(1).forEach(row => {
      let tgl = row[0] ? normalisasiTanggal(row[0]) : '';
      const idStr = row[1] ? row[1].toString().trim() : '';
      const namaBarang = row[2] || 'Bahan';
      const qtyOut = parseQty(row[3]);
      
      // Kolom I (Indeks 8) adalah Tujuan (Gerobak/Kedai)
      const tujuan = (row[8] || '').toString().toLowerCase().trim();

      if (!tgl || !idStr || idStr.toLowerCase() === 'id produk' || !tgl.startsWith(prefixTanggalWeb)) return;

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
    });

    // ==========================================
    // 6. FORMULASI LABA BERSIH
    // ==========================================
    const labaBersihKedai = Math.round(omsetKedai - pengeluaranKruKedai - belanjaOwnerKedai - HPPKedai);
    const labaBersihGerobak = Math.round(omsetGerobak - pengeluaranKruGerobak - belanjaOwnerGerobak - HPPGerobak);

    return NextResponse.json({
      totalLabaGabungan: labaBersihKedai + labaBersihGerobak,
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
      metricsGudang: { nilaiAsetGudang: 0, saldoGudangKas: 0 },
      historyBelanjaOwner: listBelanjaOwner.slice(-15).reverse(),
      historyPengeluaranKru: listPengeluaranKru.slice(-15).reverse()
    });

  } catch (error: any) {
    console.error('API Owner Error:', error);
    return NextResponse.json({ error: 'Gagal memproses konsol owner.' }, { status: 500 });
  }
}