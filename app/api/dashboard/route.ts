import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    // Pecah tanggal target untuk komparasi pintar (Contoh: "2026-07-04" -> 2026, 7, 4)
    const [targetYear, targetMonth, targetDay] = tanggalFilter.split('-');
    const targetMonthNum = parseInt(targetMonth, 10);
    const prefixTanggalWeb = `${targetYear}-${targetMonth}`; // Hasil: "2026-07"

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

    const [resPenjualan, resPengeluaran, resKasbon, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Kasbon!A:E' }).catch(() => ({ data: { values: [] } })),
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

    // 🔥 JURUS UTAMA: Mengubah segala jenis format tanggal dari Sheets menjadi YYYY-MM-DD secara paksa
    const normalisasiTanggal = (str: string) => {
      if (!str) return '';
      str = str.trim();

      // Kasus A: Jika berupa nomor serial Google Sheets (e.g., 46207)
      if (/^\d+$/.test(str)) {
        const serial = parseInt(str, 10);
        const jsDate = new Date((serial - 25569) * 24 * 3600 * 1000);
        const tgl = String(jsDate.getUTCDate()).padStart(2, '0');
        const bln = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
        const thn = jsDate.getUTCFullYear();
        return `${thn}-${bln}-${tgl}`;
      }

      // Tentukan karakter pemisah string (/ atau -)
      const pemisah = str.includes('/') ? '/' : (str.includes('-') ? '-' : '');
      if (!pemisah) return str;

      const bagian = str.split(pemisah);
      if (bagian.length !== 3) return str;

      // Kasus B: Jika formatnya sudah YYYY-MM-DD atau YYYY/MM/DD di awal
      if (bagian[0].length === 4) {
        const thn = bagian[0];
        const bln = bagian[1].padStart(2, '0');
        const tgl = bagian[2].padStart(2, '0');
        return `${thn}-${bln}-${tgl}`;
      }

      // Kasus C: Jika tahun ada di belakang (e.g., D/M/YYYY atau M/D/YYYY atau DD/MM/YYYY)
      if (bagian[2].length === 4 || bagian[2].length === 2) {
        let thn = bagian[2];
        if (thn.length === 2) thn = '20' + thn; // Antisipasi format yy

        const p1 = parseInt(bagian[0], 10);
        const p2 = parseInt(bagian[1], 10);

        let blnNum = p2; 
        let tglNum = p1;

        // Deteksi Cerdas: Cari angka mana yang bertindak sebagai Bulan berjalan
        if (p1 === targetMonthNum && p2 !== targetMonthNum) {
          blnNum = p1;
          tglNum = p2;
        } else if (p1 > 12) {
          tglNum = p1;
          blnNum = p2;
        } else if (p2 > 12) {
          blnNum = p1;
          tglNum = p2;
        }

        const blnStr = String(blnNum).padStart(2, '0');
        const tglStr = String(tglNum).padStart(2, '0');
        return `${thn}-${blnStr}-${tglStr}`;
      }

      return str;
    };

    const omsetHarian = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };
    let pengeluaranHarian = 0;
    let kasbonHarian = 0;
    let akumulasiTunaiBulanan = 0;
    let akumulasiPengeluaranBulanan = 0;
    let akumulasiKasbonBulanan = 0;

    // 1. Proses Data Penjualan
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      let rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (!rowTanggal) return;
      
      rowTanggal = normalisasiTanggal(rowTanggal); // Normalisasi ke YYYY-MM-DD

      if (rowTanggal.startsWith(prefixTanggalWeb)) {
        akumulasiTunaiBulanan += parseRupiah(row[3]);
      }
      if (rowTanggal === tanggalFilter) {
        omsetHarian.tunai += parseRupiah(row[3]);
        omsetHarian.qris += parseRupiah(row[4]);
        omsetHarian.edc += parseRupiah(row[5]);
        omsetHarian.grab += parseRupiah(row[6]);
        omsetHarian.total += parseRupiah(row[7]);
      }
    });

    // 2. Proses Data Pengeluaran
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      let rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (!rowTanggal) return;

      rowTanggal = normalisasiTanggal(rowTanggal); // Normalisasi ke YYYY-MM-DD
      
      const nominal = parseRupiah(row[7]);
      if (rowTanggal.startsWith(prefixTanggalWeb)) {
        akumulasiPengeluaranBulanan += nominal;
      }
      if (rowTanggal === tanggalFilter) {
        pengeluaranHarian += nominal;
      }
    });

    // 3. Proses Data Kasbon
    (resKasbon.data.values || []).slice(1).forEach(row => {
      let rowTanggal = row[0] ? row[0].toString().trim() : '';
      const statusKasbon = row[4] ? row[4].toString().toLowerCase().trim() : ''; 
      
      if (!rowTanggal) return;

      rowTanggal = normalisasiTanggal(rowTanggal); // Normalisasi ke YYYY-MM-DD

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

    // 4. Moving Average Gudang HPP
    const kalkulasiGudang: Record<string, { totalQtyIn: number; totalCostIn: number; totalQtyOut: number }> = {};
    const rawStokIn = resStokIn.data.values || [];
    const rawStokOut = resStokOut.data.values || [];
    
    rawStokIn.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || idStr.toLowerCase() === 'id produk') return; 
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyIn += parseQty(row[3]);
      kalkulasiGudang[idStr].totalCostIn += parseRupiah(row[5]);
    });

    rawStokOut.slice(1).forEach(row => {
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
    
    const historyStokInFiltered = rawStokIn.slice(1).filter(r => r[1] && r[1].toLowerCase() !== 'id produk');
    const historyStokOutFiltered = rawStokOut.slice(1).filter(r => r[1] && r[1].toLowerCase() !== 'id produk');

    return NextResponse.json({
      omset: omsetHarian,
      totalKeluar: pengeluaranHarian,
      totalKasbon: kasbonHarian,
      saldoLaciKasir: saldoLaciKasir,
      nilaiAsetGudang: totalNilaiAsetGudangAktif,
      historyStokIn: historyStokInFiltered.slice(-5).reverse(),   
      historyStokOut: historyStokOutFiltered.slice(-5).reverse() 
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memuat ringkasan.' }, { status: 500 });
  }
}