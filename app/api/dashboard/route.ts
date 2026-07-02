import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    const [year, month, day] = tanggalFilter.split('-');
    const prefixTanggalID = `/${month}/${year}`; 
    const prefixTanggalWeb = `${year}-${month}`; 
    const formatTanggalID = `${day}/${month}/${year}`;

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

    const omsetHarian = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };
    let pengeluaranHarian = 0;
    let kasbonHarian = 0;
    let akumulasiTunaiBulanan = 0;
    let akumulasiPengeluaranBulanan = 0;
    let akumulasiKasbonBulanan = 0;

    // 1. Penjualan
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (!rowTanggal) return;
      if (rowTanggal.startsWith(prefixTanggalWeb) || rowTanggal.endsWith(prefixTanggalID)) {
        akumulasiTunaiBulanan += parseRupiah(row[3]);
      }
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        omsetHarian.tunai += parseRupiah(row[3]);
        omsetHarian.qris += parseRupiah(row[4]);
        omsetHarian.edc += parseRupiah(row[5]);
        omsetHarian.grab += parseRupiah(row[6]);
        omsetHarian.total += parseRupiah(row[7]);
      }
    });

    // 2. Pengeluaran
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (!rowTanggal) return;
      const nominal = parseRupiah(row[7]);
      if (rowTanggal.startsWith(prefixTanggalWeb) || rowTanggal.endsWith(prefixTanggalID)) {
        akumulasiPengeluaranBulanan += nominal;
      }
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        pengeluaranHarian += nominal;
      }
    });

    // 3. Kasbon
    (resKasbon.data.values || []).slice(1).forEach(row => {
      const rowTanggal = row[0] ? row[0].toString().trim() : '';
      if (!rowTanggal) return;
      const nominal = parseRupiah(row[2]);
      if (rowTanggal.startsWith(prefixTanggalWeb) || rowTanggal.endsWith(prefixTanggalID)) {
        akumulasiKasbonBulanan += nominal;
      }
      if (rowTanggal === tanggalFilter || rowTanggal === formatTanggalID) {
        kasbonHarian += nominal;
      }
    });

    // 4. Moving Average Gudang HPP dengan Pembulatan Matematika Bulat
    const kalkulasiGudang: Record<string, { totalQtyIn: number; totalCostIn: number; totalQtyOut: number }> = {};
    const rawStokIn = resStokIn.data.values || [];
    const rawStokOut = resStokOut.data.values || [];
    
    rawStokIn.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || idStr.toLowerCase() === 'id produk') return; // Saring header
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyIn += parseQty(row[3]);
      kalkulasiGudang[idStr].totalCostIn += parseRupiah(row[5]);
    });

    rawStokOut.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || idStr.toLowerCase() === 'id produk') return; // Saring header
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
    
    // KODE PERBAIKAN: Memastikan Baris Header Judul Kolom Dibuang dari Histori Tampilan Depan
    const historyStokInFiltered = rawStokIn.slice(1).filter(r => r[1] && r[1].toLowerCase() !== 'id produk');
    const historyStokOutFiltered = rawStokOut.slice(1).filter(r => r[1] && r[1].toLowerCase() !== 'id produk');

    return NextResponse.json({
      omset: omsetHarian,
      totalKeluar: pengeluaranHarian,
      totalKasbon: kasbonHarian,
      saldoLaciKasir: saldoLaciKasir,
      nilaiAsetGudang: totalNilaiAsetGudangAktif,
      historyStokIn: historyStokInFiltered.slice(-5).reverse(),   // Mengambil 5 mutasi asli terbaru
      historyStokOut: historyStokOutFiltered.slice(-5).reverse() // Mengambil 5 mutasi asli terbaru
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memuat ringkasan.' }, { status: 500 });
  }
}