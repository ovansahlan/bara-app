import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

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

    // TARIK SEMUA TAB TERMASUK CABANG GEROBAK
    const [resPenjualan, resPengeluaran, resPenjualanGrb, resPengeluaranGrb, resBelanjaOwner, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan_Gerobak!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran_Gerobak!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Belanja_Owner!A:E' }).catch(() => ({ data: { values: [] } })), 
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

    // Inisialisasi Penampung Finansial Terpisah
    const kedai = { omset: 0, pengeluaranKru: 0, belanjaOwner: 0, labaBersih: 0 };
    const gerobak = { omset: 0, pengeluaranKru: 0, belanjaOwner: 0, labaBersih: 0 };

    // 1. KEDAI UTAMA - OMSET BULANAN
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        kedai.omset += parseRupiah(row[7]);
      }
    });

    // 2. KEDAI UTAMA - PENGELUARAN KRU
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        kedai.pengeluaranKru += parseRupiah(row[7]);
      }
    });

    // 3. GEROBAK - OMSET BULANAN
    (resPenjualanGrb.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        gerobak.omset += parseRupiah(row[7]);
      }
    });

    // 4. GEROBAK - PENGELUARAN KRU
    (resPengeluaranGrb.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        gerobak.pengeluaranKru += parseRupiah(row[7]);
      }
    });

    // 5. BREAKDOWN TAB BELANJA OWNER BERDASARKAN KOLOM E (PERUNTUKAN)
    (resBelanjaOwner.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        const nominal = parseRupiah(row[3]);
        const peruntukan = row[4] ? row[4].toString().trim().toLowerCase() : 'kedai';

        if (peruntukan === 'gerobak') {
          gerobak.belanjaOwner += nominal;
        } else {
          kedai.belanjaOwner += nominal; // Default lari ke kedai utama jika kosong
        }
      }
    });

    // Hitung Laba Bersih Masing-masing
    kedai.labaBersih = Math.round(kedai.omset - kedai.pengeluaranKru - kedai.belanjaOwner);
    gerobak.labaBersih = Math.round(gerobak.omset - gerobak.pengeluaranKru - gerobak.belanjaOwner);

    // 6. PERHITUNGAN REAL-TIME GUDANG LOGISTIK (TETAP TERPUSAT)
    const kalkulasiGudang: Record<string, { totalQtyIn: number; totalCostIn: number; totalQtyOut: number }> = {};
    const rowsIn = resStokIn.data.values || [];
    rowsIn.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || idStr.toLowerCase() === 'id produk') return;
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyIn += parseQty(row[3]);
      kalkulasiGudang[idStr].totalCostIn += parseRupiah(row[5]);
    });

    const rowsOut = resStokOut.data.values || [];
    rowsOut.slice(1).forEach(row => {
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
      if (sisaStok > 0) totalNilaiAsetGudangAktif += Math.round(sisaStok * hrgRata2);
    });

    const sisaKasGudangFisik = Math.round(8000000 - totalNilaiAsetGudangAktif);
    const stokMasukFiltered = rowsIn.slice(1).filter(r => r[1] && r[1].toLowerCase() !== 'id produk');
    const stokKeluarFiltered = rowsOut.slice(1).filter(r => r[1] && r[1].toLowerCase() !== 'id produk');

    return NextResponse.json({
      success: true,
      kedai,
      gerobak,
      totalLabaGabungan: Math.round(kedai.labaBersih + gerobak.labaBersih),
      metricsGudang: {
        nilaiAsetGudang: totalNilaiAsetGudangAktif,
        saldoGudangKas: sisaKasGudangFisik
      },
      stokMasuk: stokMasukFiltered.slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], pic: r[6] })),
      stokKeluar: stokKeluarFiltered.slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], tujuan: r[8] || r[4] }))
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memproses data.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, daftarBelanja } = body;

    if (!daftarBelanja || !Array.isArray(daftarBelanja) || daftarBelanja.length === 0) {
      return NextResponse.json({ error: 'Daftar belanja masih kosong.' }, { status: 400 });
    }

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

    // FORMAT BARIS BARU SEKARANG ADA 5 KOLOM:
    // Tanggal (A) | Kategori (B) | Keterangan (C) | Nominal (D) | Peruntukan (E)
    const kumpulanBarisBaru = daftarBelanja.map((item: any) => [
      formatTanggalID, 
      item.kategori, 
      item.keterangan, 
      item.nominal,
      item.peruntukan || 'Kedai' // Nilai: 'Kedai' atau 'Gerobak'
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Belanja_Owner!A:E',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [kumpulanBarisBaru] },
    });

    return NextResponse.json({ success: true, message: 'Catatan belanja terkelompok berhasil disimpan!' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengunci data.' }, { status: 500 });
  }
}