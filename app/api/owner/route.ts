import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    const [year, month] = tanggalFilter.split('-');
    const prefixTanggalID = `/${month}/${year}`; 
    const prefixTanggalWeb = `${year}-${month}`; 

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

    // SINKRONISASI NAMA TAB SESUAI PERMINTAAN OWNER
    const [resPenjualan, resPengeluaran, resBelanjaOwner, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Belanja_Owner!A:D' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Masuk!A:G' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stok_Keluar!A:I' }).catch(() => ({ data: { values: [] } }))
    ]);

    let totalOmsetBulanIni = 0;
    let totalPengeluaranKruBulanIni = 0;
    let totalPengeluaranOwnerBulanIni = 0;

    // A. HITUNG OMSET BULANAN (Kolom H / Index 7)
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalOmsetBulanIni += parseInt(row[7] || '0', 10);
      }
    });

    // B. HITUNG BIAYA OPERASIONAL KRU (Kolom H / Index 7)
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalPengeluaranKruBulanIni += parseInt((row[7] || '0').toString().replace(/\D/g, ''), 10);
      }
    });

    // C. HITUNG BELANJA PRIBADI OWNER (Kolom D / Index 3 di sheet Belanja_Owner)
    (resBelanjaOwner.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalPengeluaranOwnerBulanIni += parseInt((row[3] || '0').toString().replace(/\D/g, ''), 10);
      }
    });

    // D. LOGIKA KUSTOM MOVING AVERAGE & REAL-TIME ASSET TRACKING
    const kalkulasiGudang: Record<string, { totalQtyIn: number; totalCostIn: number; totalQtyOut: number }> = {};

    // 1. Ambil seluruh pasokan masuk historis
    const rowsIn = resStokIn.data.values || [];
    rowsIn.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr) return;
      const qtyIn = parseFloat(row[3] || '0') || 0;
      const totalBelanjaItem = parseInt((row[5] || '0').toString().replace(/\D/g, ''), 10) || 0;

      if (!kalkulasiGudang[idStr]) {
        kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      }
      kalkulasiGudang[idStr].totalQtyIn += qtyIn;
      kalkulasiGudang[idStr].totalCostIn += totalBelanjaItem;
    });

    // 2. Ambil seluruh bahan keluar historis
    const rowsOut = resStokOut.data.values || [];
    rowsOut.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr) return;
      const qtyOut = parseFloat(row[3] || '0') || 0;

      if (!kalkulasiGudang[idStr]) {
        kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      }
      kalkulasiGudang[idStr].totalQtyOut += qtyOut;
    });

    // 3. Gabungkan menjadi Nilai Aset Kumulatif Gudang Berjalan
    let totalNilaiAsetGudangAktif = 0;
    Object.keys(kalkulasiGudang).forEach(id => {
      const item = kalkulasiGudang[id];
      const hargaRataRataBergerak = item.totalQtyIn > 0 ? (item.totalCostIn / item.totalQtyIn) : 0;
      const sisaStokFisik = item.totalQtyIn - item.totalQtyOut;

      if (sisaStokFisik > 0) {
        totalNilaiAsetGudangAktif += (sisaStokFisik * hargaRataRataBergerak);
      }
    });

    // E. FORMULA KAS GUDANG ASLI KESPAKATAN OWNER
    const sisaKasGudangFisik = 8000000 - totalNilaiAsetGudangAktif;
    const sisaSaldoBersihBara = totalOmsetBulanIni - totalPengeluaranKruBulanIni - totalPengeluaranOwnerBulanIni;

    const mutasiMasuk = rowsIn.slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], pic: r[6] }));
    const mutasiKeluar = rowsOut.slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], tujuan: r[8] || r[5] }));

    return NextResponse.json({
      metrics: {
        omset: totalOmsetBulanIni,
        pengeluaranKru: totalPengeluaranKruBulanIni,
        pengeluaranOwner: totalPengeluaranOwnerBulanIni,
        sisaSaldo: sisaSaldoBersihBara,
        saldoGudangKas: sisaKasGudangFisik,      // Sisa Uang Tunai di Box Gudang
        nilaiAsetGudang: totalNilaiAsetGudangAktif // Total Nilai Barang di Gudang (HPP Moving Average)
      },
      stokMasuk: mutasiMasuk,
      stokKeluar: mutasiKeluar
    });

  } catch (error: any) {
    console.error('API Owner GET Error:', error);
    return NextResponse.json({ error: 'Gagal memproses data.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, kategori, keterangan, nominal } = body;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Kredensial server tidak lengkap.' }, { status: 500 });
    }

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const [year, month, day] = tanggal.split('-');
    const formatTanggalID = `${day}/${month}/${year}`;

    // FORMAT ROW BARU: Tanggal | Kategori Internal | Keterangan Lengkap | Nominal (Rp)
    const dataBaris = [formatTanggalID, kategori, keterangan, nominal];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Belanja_Owner!A:D', // LINKING SUDAH 100% AKTIF KE SHEET INI
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [dataBaris] },
    });

    return NextResponse.json({ success: true, message: 'Catatan Belanja Owner berhasil dikunci ke spreadsheet!' });

  } catch (error: any) {
    console.error('API Owner POST Error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan data.', details: error.message }, { status: 500 });
  }
}