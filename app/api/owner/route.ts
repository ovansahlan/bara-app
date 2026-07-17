import { NextResponse } from 'next/server';
import { 
  getAuthSheets, 
  normalisasiTanggal, 
  parseRupiah, 
  parseQty, 
  verifyOwnerSession 
} from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Enforce security check: verify owner session cookie
    if (!verifyOwnerSession()) {
      return NextResponse.json({ error: 'Unauthorized. Akses ditolak.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    // Validate date format to prevent crash on split
    if (!tanggalFilter || typeof tanggalFilter !== 'string' || !tanggalFilter.includes('-')) {
      return NextResponse.json({ error: 'Format tanggal filter tidak valid (harus YYYY-MM-DD).' }, { status: 400 });
    }

    const [targetYear, targetMonth] = tanggalFilter.split('-');
    const prefixTanggalWeb = `${targetYear}-${targetMonth}`; 

    const { sheets, spreadsheetId } = getAuthSheets();

    const [resPenjualan, resPenjualanGrb, resPengeluaranKedai, resPengeluaranGrb, resBelanjaOwner, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan_Gerobak!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran_Gerobak!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Belanja_Owner!A:E' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Masuk!A:G' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Keluar!A:I' }).catch(() => ({ data: { values: [] } }))
    ]);

    let omsetKedai = 0, pengeluaranKruKedai = 0, belanjaOwnerKedai = 0, HPPKedai = 0;
    let omsetGerobak = 0, pengeluaranKruGerobak = 0, belanjaOwnerGerobak = 0, HPPGerobak = 0;

    const pemakaianKedaiMap: Record<string, { nama: string; qty: number; nilai: number }> = {};
    const pemakaianGerobakMap: Record<string, { nama: string; qty: number; nilai: number }> = {};
    
    const listBelanjaOwner: any[] = [];
    const listPengeluaranKru: any[] = [];

    // ==========================================
    // 1. PARSING OMSET 
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
    // 2. PARSING PENGELUARAN KRU KEDAI 
    // ==========================================
    (resPengeluaranKedai.data.values || []).slice(1).forEach(row => {
      let tgl = row[0] ? normalisasiTanggal(row[0]) : '';
      if (!tgl) return;
      const nominal = parseRupiah(row[7]); 
      
      if (tgl.startsWith(prefixTanggalWeb)) pengeluaranKruKedai += nominal;
      
      listPengeluaranKru.push({ 
        tanggal: tgl, 
        outlet: 'Kedai', 
        kategori: row[2] || 'Bar',
        barang: row[3] || 'Bahan', 
        qty: parseQty(row[4]), 
        satuan: row[5] || 'Pcs', 
        nominal: nominal 
      });
    });

    // ==========================================
    // 3. PARSING PENGELUARAN KRU GEROBAK 
    // ==========================================
    (resPengeluaranGrb.data.values || []).slice(1).forEach(row => {
      let tgl = row[0] ? normalisasiTanggal(row[0]) : '';
      if (!tgl) return;
      const nominal = parseRupiah(row[7]); 
      
      if (tgl.startsWith(prefixTanggalWeb)) pengeluaranKruGerobak += nominal;
      
      listPengeluaranKru.push({ 
        tanggal: tgl, 
        outlet: 'Gerobak', 
        kategori: row[2] || 'Gerobak',
        barang: row[3] || 'Bahan', 
        qty: parseQty(row[4]), 
        satuan: row[5] || 'Pcs', 
        nominal: nominal 
      });
    });

    // ==========================================
    // 4. PARSING BELANJA OWNER
    // ==========================================
    (resBelanjaOwner.data.values || []).slice(1).forEach(row => {
      let tgl = row[0] ? normalisasiTanggal(row[0]) : '';
      if (!tgl) return;
      
      const kategori = row[1] || 'Owner';
      const barang = row[2] || 'Aset';
      const nominal = parseRupiah(row[3]); 
      const peruntukan = (row[4] || '').toString().toLowerCase().trim(); 

      if (tgl.startsWith(prefixTanggalWeb)) {
        if (peruntukan === 'kedai') belanjaOwnerKedai += nominal;
        else if (peruntukan === 'gerobak') belanjaOwnerGerobak += nominal;
      }

      listBelanjaOwner.push({
        tanggal: tgl,
        peruntukan: peruntukan === 'gerobak' ? 'Gerobak' : 'Kedai',
        kategori: kategori,
        barang: barang,
        qty: 1,      
        satuan: '-', 
        nominal: nominal
      });
    });

    // ==========================================
    // 5. PARSING GUDANG & HPP 
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

    // Sort chronologically by date to interleave mixed sources correctly
    listBelanjaOwner.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    listPengeluaranKru.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

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