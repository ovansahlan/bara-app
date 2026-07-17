import { NextResponse } from 'next/server';
import { 
  getAuthSheets, 
  normalisasiTanggal, 
  parseRupiah, 
  parseQty 
} from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    // Validate date format to prevent split crashes
    if (!tanggalFilter || typeof tanggalFilter !== 'string' || !tanggalFilter.includes('-')) {
      return NextResponse.json({ error: 'Format tanggal filter tidak valid (harus YYYY-MM-DD).' }, { status: 400 });
    }

    // Pecah tanggal target untuk komparasi pintar (Contoh: "2026-07-04" -> 2026, 7, 4)
    const [targetYear, targetMonth, targetDay] = tanggalFilter.split('-');
    const targetMonthNum = parseInt(targetMonth, 10);
    const prefixTanggalWeb = `${targetYear}-${targetMonth}`; // Hasil: "2026-07"

    const { sheets, spreadsheetId } = getAuthSheets();

    // FIX: Mengubah pencarian nama tab kru dari "Kru" menjadi "Master_Kru" sesuai struktur Google Sheets
    const [resPenjualan, resPengeluaran, resKasbon, resStokIn, resStokOut, resKru] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Kasbon!A:E' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Masuk!A:G' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Keluar!A:I' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Master_Kru!A:E' }).catch(() => ({ data: { values: [] } }))
    ]);

    // 🎯 IDENTIFIKASI KRU GEROBAK DARI TAB 'Master_Kru'
    const gerobakKru = new Set<string>();
    (resKru.data.values || []).slice(1).forEach(row => {
      if (!row || row.length === 0) return;
      const namaKolomA = (row[0] || '').toString().toLowerCase().trim();
      const namaKolomB = (row[1] || '').toString().toLowerCase().trim();
      
      // Safe cell verification to prevent undefined.toString() crash
      const isGerobak = row.some(cell => {
        if (cell === null || cell === undefined) return false;
        return cell.toString().toLowerCase().trim() === 'gerobak';
      });
      
      if (isGerobak) {
        if (namaKolomA) gerobakKru.add(namaKolomA);
        if (namaKolomB) gerobakKru.add(namaKolomB);
      }
    });

    // GENERATOR KALENDER 7 HARI TERAKHIR UNTUK GRAFIK OMSET KEDAI
    const trendOmsetMap: Record<string, { hari: string, omset: number }> = {};
    const trendLabelsKeys: string[] = [];
    
    const yearNum = parseInt(targetYear, 10);
    const dayNum = parseInt(targetDay, 10);

    for (let i = 6; i >= 0; i--) {
      // Safe date validation check
      if (isNaN(yearNum) || isNaN(targetMonthNum) || isNaN(dayNum)) break;

      const d = new Date(yearNum, targetMonthNum - 1, dayNum);
      d.setDate(d.getDate() - i);
      
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${dayStr}`;
      
      let label = `${dayStr}/${m}`;
      if (i === 0) label = 'Hari Ini';
      else if (i === 1) label = 'Kemarin';
      
      trendOmsetMap[dateKey] = { hari: label, omset: 0 };
      trendLabelsKeys.push(dateKey);
    }

    const omsetHarian = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };
    let pengeluaranHarian = 0;
    let kasbonHarian = 0;
    let akumulasiTunaiBulanan = 0;
    let akumulasiPengeluaranBulanan = 0;
    let akumulasiKasbonBulanan = 0;

    // 1. PROSES PENJUALAN (HANYA KEDAI PUSAT)
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      if (!row || row.length === 0) return;
      const namaKru = (row[1] || '').toString().toLowerCase().trim();
      let rowTanggal = row[0] ? row[0].toString().trim() : '';
      
      if (!rowTanggal) return;
      if (gerobakKru.has(namaKru)) return; // 🛡️ FILTER: Abaikan Omset Gerobak
      
      rowTanggal = normalisasiTanggal(rowTanggal);
      const totalOmsetBaris = parseRupiah(row[7]);

      if (trendOmsetMap[rowTanggal]) {
        trendOmsetMap[rowTanggal].omset += totalOmsetBaris;
      }

      if (rowTanggal.startsWith(prefixTanggalWeb)) {
        akumulasiTunaiBulanan += parseRupiah(row[3]);
      }
      if (rowTanggal === tanggalFilter) {
        omsetHarian.tunai += parseRupiah(row[3]);
        omsetHarian.qris += parseRupiah(row[4]);
        omsetHarian.edc += parseRupiah(row[5]);
        omsetHarian.grab += parseRupiah(row[6]);
        omsetHarian.total += totalOmsetBaris;
      }
    });

    // 2. PROSES PENGELUARAN (HANYA KEDAI PUSAT)
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      if (!row || row.length === 0) return;
      const namaKru = (row[1] || '').toString().toLowerCase().trim();
      let rowTanggal = row[0] ? row[0].toString().trim() : '';
      
      if (!rowTanggal) return;
      if (gerobakKru.has(namaKru)) return; // 🛡️ FILTER: Abaikan Belanja Gerobak

      rowTanggal = normalisasiTanggal(rowTanggal); 
      const nominal = parseRupiah(row[7]);
      
      if (rowTanggal.startsWith(prefixTanggalWeb)) {
        akumulasiPengeluaranBulanan += nominal;
      }
      if (rowTanggal === tanggalFilter) {
        pengeluaranHarian += nominal;
      }
    });

    // 3. PROSES KASBON (HANYA KEDAI PUSAT)
    (resKasbon.data.values || []).slice(1).forEach(row => {
      if (!row || row.length === 0) return;
      let rowTanggal = row[0] ? row[0].toString().trim() : '';
      const namaKasbon = row[1] ? row[1].toString().toLowerCase().trim() : '';
      const statusKasbon = row[4] ? row[4].toString().toLowerCase().trim() : ''; 
      
      if (!rowTanggal || !namaKasbon) return;
      if (gerobakKru.has(namaKasbon)) return; // 🛡️ FILTER PROTEKSI: Jika orang Gerobak, abaikan pemotongan kas laci pusat!

      rowTanggal = normalisasiTanggal(rowTanggal);

      if (statusKasbon === 'belum lunas') {
        const nominal = parseRupiah(row[2]);
        if (rowTanggal.startsWith(prefixTanggalWeb)) {
          akumulasiKasbonBulanan += nominal;
        }
        if (rowTanggal === tanggalFilter) {
          kasbonHarian += nominal;
        }
      }
    });

    // 4. MOVING AVERAGE GUDANG
    const kalkulasiGudang: Record<string, { totalQtyIn: number; totalCostIn: number; totalQtyOut: number }> = {};
    const rawStokIn = resStokIn.data.values || [];
    const rawStokOut = resStokOut.data.values || [];
    
    rawStokIn.slice(1).forEach(row => {
      if (!row || row.length < 2) return;
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || idStr.toLowerCase() === 'id produk') return; 
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyIn += parseQty(row[3]);
      kalkulasiGudang[idStr].totalCostIn += parseRupiah(row[5]);
    });

    rawStokOut.slice(1).forEach(row => {
      if (!row || row.length < 2) return;
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || idStr.toLowerCase() === 'id produk') return; 
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyOut += parseQty(row[3]);
    });

    let totalNilaiAsetGudangAktif = 0;
    Object.keys(kalkulasiGudang).forEach(id => {
      const item = kalkulasiGudang[id];
      const hrgRata2 = item.totalQtyIn > 0 ? (item.totalCostIn / item.totalQtyIn) : 0;
      const sisaStok = item.totalQtyIn - item.totalQtyOut;
      if (sisaStok > 0) {
        totalNilaiAsetGudangAktif += Math.round(sisaStok * hrgRata2);
      }
    });

    totalNilaiAsetGudangAktif = Math.round(totalNilaiAsetGudangAktif);
    const saldoLaciKasir = Math.round(akumulasiTunaiBulanan - akumulasiPengeluaranBulanan - akumulasiKasbonBulanan);
    
    const historyStokInFiltered = rawStokIn.slice(1).filter(r => r && r[1] && r[1].toLowerCase() !== 'id produk');
    const historyStokOutFiltered = rawStokOut.slice(1).filter(r => r && r[1] && r[1].toLowerCase() !== 'id produk');

    const trendOmsetFinal = trendLabelsKeys.map(key => trendOmsetMap[key] || { hari: '-', omset: 0 });

    const getNamaBulan = (dateStr: string) => {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    return NextResponse.json({
      omset: omsetHarian,
      totalKeluar: pengeluaranHarian,
      totalKasbon: kasbonHarian,
      saldoLaciKasir: saldoLaciKasir,
      nilaiAsetGudang: totalNilaiAsetGudangAktif,
      historyStokIn: historyStokInFiltered.slice(-5).reverse(),   
      historyStokOut: historyStokOutFiltered.slice(-5).reverse(),
      trendOmset: trendOmsetFinal,
      namaBulan: getNamaBulan(tanggalFilter)
    });

  } catch (error: any) {
    console.error('API Dashboard GET Error:', error);
    return NextResponse.json({ error: 'Gagal memuat ringkasan.' }, { status: 500 });
  }
}