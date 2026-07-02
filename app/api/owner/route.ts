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

    const [resPenjualan, resPengeluaran, resBelanjaOwner, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Belanja_Owner!A:D' }).catch(() => ({ data: { values: [] } })), 
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

    // Objek Rincian Tipe Bayar Bulanan
    const omsetBulanIni = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };
    let totalPengeluaranKruBulanIni = 0;
    let totalBelanjaOwnerBulanIni = 0;

    // 1. Akumulasi & Breakdown Omset Bulanan
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        omsetBulanIni.tunai += parseRupiah(row[3]);
        omsetBulanIni.qris += parseRupiah(row[4]);
        omsetBulanIni.edc += parseRupiah(row[5]);
        omsetBulanIni.grab += parseRupiah(row[6]);
        omsetBulanIni.total += parseRupiah(row[7]);
      }
    });

    // 2. Pengeluaran Kru Bulanan
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalPengeluaranKruBulanIni += parseRupiah(row[7]);
      }
    });

    // 3. Belanja yang Dikeluarkan Owner Bulanan
    (resBelanjaOwner.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalBelanjaOwnerBulanIni += parseRupiah(row[3]);
      }
    });

    // 4. Perhitungan Real-Time Gudang Moving Average
    const kalkulasiGudang: Record<string, { totalQtyIn: number; totalCostIn: number; totalQtyOut: number }> = {};

    const rowsIn = resStokIn.data.values || [];
    rowsIn.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || idStr.toLowerCase() === 'id produk') return; // Saring header jika terbawa
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyIn += parseQty(row[3]);
      kalkulasiGudang[idStr].totalCostIn += parseRupiah(row[5]);
    });

    const rowsOut = resStokOut.data.values || [];
    rowsOut.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr || idStr.toLowerCase() === 'id produk') return; // Saring header jika terbawa
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyOut += parseQty(row[3]);
    });

    let totalNilaiAsetGudangAktif = 0;
    Object.keys(kalkulasiGudang).forEach(id => {
      const item = kalkulasiGudang[id];
      const hrgRata2 = item.totalQtyIn > 0 ? (item.totalCostIn / item.totalQtyIn) : 0;
      const sisaStok = item.totalQtyIn - item.totalQtyOut;
      if (sisaStok > 0) totalNilaiAsetGudangAktif += (sisaStok * hrgRata2);
    });

    const sisaKasGudangFisik = 8000000 - totalNilaiAsetGudangAktif;
    const sisaSaldoBersihBara = omsetBulanIni.total - totalPengeluaranKruBulanIni - totalBelanjaOwnerBulanIni;

    // FILTER ANTI HEADER UNTUK HISTORI MUTASI TERBARU
    const stokMasukFiltered = rowsIn.slice(1).filter(r => r[1] && r[1].toLowerCase() !== 'id produk');
    const stokKeluarFiltered = rowsOut.slice(1).filter(r => r[1] && r[1].toLowerCase() !== 'id produk');

    // Mapping sesuai struktur: Tanggal, ID Produk, Nama Barang, Kuantiti Keluar, Keterangan, Penginput, Harga Item, Total, Lokasi Tujuan
    const mutasiMasuk = stokMasukFiltered.slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], pic: r[6] }));
    const mutasiKeluar = stokKeluarFiltered.slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], tujuan: r[8] || r[4] }));

    return NextResponse.json({
      metrics: {
        omset: omsetBulanIni, // Mengirim objek lengkap
        pengeluaranKru: totalPengeluaranKruBulanIni,
        belanjaOwner: totalBelanjaOwnerBulanIni,
        sisaSaldo: sisaSaldoBersihBara,
        saldoGudangKas: sisaKasGudangFisik,      
        nilaiAsetGudang: totalNilaiAsetGudangAktif 
      },
      stokMasuk: mutasiMasuk,
      stokKeluar: mutasiKeluar
    });

  } catch (error: any) {
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

    const dataBaris = [formatTanggalID, kategori, keterangan, nominal];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Belanja_Owner!A:D',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [dataBaris] },
    });

    return NextResponse.json({ success: true, message: 'Catatan Belanja Owner berhasil dikunci!' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menyimpan data.' }, { status: 500 });
  }
}