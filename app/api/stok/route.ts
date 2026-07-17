import { NextResponse } from 'next/server';
import { 
  getAuthSheets, 
  parseRupiah, 
  parseQty 
} from '@/lib/google-sheets';

export async function GET(request: Request) {
  try {
    const { sheets, spreadsheetId } = getAuthSheets();
    
    // Baca Master Product (A sampai E karena ada Batas Minimum di kolom E)
    const resMaster = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Master Product!A:E',
    });

    const masterRows = resMaster.data.values || [];

    const daftarProduk = masterRows.slice(1).map(row => {
      if (!row || !row[0]) return null;
      return {
        id: row[0].toString().trim(),
        nama: row[1] || '',
        kategori: row[2] || '',
        satuan: row[3] || 'Pcs'
      };
    }).filter(p => p !== null);

    return NextResponse.json({ masterProduk: daftarProduk });

  } catch (error: any) {
    console.error('API Stok GET Error:', error);
    return NextResponse.json({ error: 'Gagal memuat Master Product.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, tanggal, penginput, keterangan, lokasiTujuan, daftarStok } = body;

    // Input validation
    if (!tanggal || typeof tanggal !== 'string' || !tanggal.includes('-')) {
      return NextResponse.json({ error: 'Tanggal wajib diisi dengan format YYYY-MM-DD.' }, { status: 400 });
    }
    if (!daftarStok || !Array.isArray(daftarStok) || daftarStok.length === 0) {
      return NextResponse.json({ error: 'Keranjang stok kosong.' }, { status: 400 });
    }

    const { sheets, spreadsheetId } = getAuthSheets();
    
    // Format Tanggal Web ke Format Indonesia DD/MM/YYYY
    const [year, month, day] = tanggal.split('-');
    const formatTanggalID = `${day}/${month}/${year}`;
    
    let rangeTarget = '';
    let kumpulanBarisBaru: any[] = [];

    if (type === 'in') {
      rangeTarget = 'Stok_Masuk!A:G';
      // Format Stok_Masuk: Tanggal | ID Produk | Nama Barang | Qty Masuk | Harga Beli | Total Belanja | Penginput
      kumpulanBarisBaru = daftarStok.map((item: any) => [
        formatTanggalID, 
        item.idProduk, 
        item.namaBarang, 
        parseQty(item.kuantiti), 
        parseRupiah(item.hargaBeliSatuan), 
        parseRupiah(item.totalBelanja), 
        penginput || ''
      ]);

    } else if (type === 'out') {
      rangeTarget = 'Stok_Keluar!A:I';
      
      // Ambil riwayat Stok Masuk untuk mencari Harga Rata-Rata (Moving Average)
      const resStokIn = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Stok_Masuk!A:G'
      });
      
      const kalkulasiHPP: Record<string, { totalQtyIn: number; totalCostIn: number }> = {};
      (resStokIn.data.values || []).slice(1).forEach(row => {
        if (!row || row.length < 2) return;
        const idStr = row[1] ? row[1].toString().trim() : '';
        if (!idStr || idStr.toLowerCase() === 'id produk') return;

        const qtyIn = parseQty(row[3]);
        const totalCost = parseRupiah(row[5]);

        if (!kalkulasiHPP[idStr]) kalkulasiHPP[idStr] = { totalQtyIn: 0, totalCostIn: 0 };
        kalkulasiHPP[idStr].totalQtyIn += qtyIn;
        kalkulasiHPP[idStr].totalCostIn += totalCost;
      });

      // URUTAN BARU YANG SUDAH DI-FIX SESUAI COLUMNS GOOGLE SHEET OWNER:
      // Index 0: Tanggal
      // Index 1: ID Produk
      // Index 2: Nama Barang
      // Index 3: Kuantiti Keluar
      // Index 4: Keterangan
      // Index 5: Penginput
      // Index 6: Harga Item (Moving Average)
      // Index 7: Total (HPP Terpakai)
      // Index 8: Lokasi Tujuan
      kumpulanBarisBaru = daftarStok.map((item: any) => {
        const id = item.idProduk;
        const dataIn = kalkulasiHPP[id] || { totalQtyIn: 0, totalCostIn: 0 };
        
        const hargaRataRata = dataIn.totalQtyIn > 0 ? Math.round(dataIn.totalCostIn / dataIn.totalQtyIn) : 0;
        const totalModalTerpakai = Math.round(hargaRataRata * parseQty(item.kuantiti));

        return [
          formatTanggalID,      // Row A
          item.idProduk,        // Row B
          item.namaBarang,      // Row C
          parseQty(item.kuantiti), // Row D
          keterangan || '',     // Row E
          penginput || '',      // Row F
          hargaRataRata,        // Row G
          totalModalTerpakai,   // Row H
          lokasiTujuan || ''    // Row I
        ];
      });

    } else {
      return NextResponse.json({ error: 'Aksi logistik tidak dikenali.' }, { status: 400 });
    }

    // Tulis data baris baru ke Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: rangeTarget,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS', 
      requestBody: { values: kumpulanBarisBaru },
    });

    return NextResponse.json({ success: true, message: `${daftarStok.length} item mutasi ${type === 'in' ? 'Stok Masuk' : 'Stok Keluar'} berhasil disimpan!` });

  } catch (error: any) {
    console.error('API Stok POST Error:', error);
    return NextResponse.json({ error: 'Gagal mengunci entri mutasi gudang.', details: error.message }, { status: 500 });
  }
}