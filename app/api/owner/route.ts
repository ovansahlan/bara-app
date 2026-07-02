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

    let totalOmsetBulanIni = 0;
    let totalPengeluaranKruBulanIni = 0;
    let totalPengeluaranOwnerBulanIni = 0;

    (resPenjualan.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalOmsetBulanIni += parseRupiah(row[7]);
      }
    });

    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalPengeluaranKruBulanIni += parseRupiah(row[7]);
      }
    });

    (resBelanjaOwner.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalPengeluaranOwnerBulanIni += parseRupiah(row[3]);
      }
    });

    const kalkulasiGudang: Record<string, { totalQtyIn: number; totalCostIn: number; totalQtyOut: number }> = {};

    const rowsIn = resStokIn.data.values || [];
    rowsIn.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr) return;
      if (!kalkulasiGudang[idStr]) kalkulasiGudang[idStr] = { totalQtyIn: 0, totalCostIn: 0, totalQtyOut: 0 };
      kalkulasiGudang[idStr].totalQtyIn += parseQty(row[3]);
      kalkulasiGudang[idStr].totalCostIn += parseRupiah(row[5]);
    });

    const rowsOut = resStokOut.data.values || [];
    rowsOut.slice(1).forEach(row => {
      const idStr = row[1] ? row[1].toString().trim() : '';
      if (!idStr) return;
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
    const sisaSaldoBersihBara = totalOmsetBulanIni - totalPengeluaranKruBulanIni - totalPengeluaranOwnerBulanIni;

    return NextResponse.json({
      metrics: {
        omset: totalOmsetBulanIni,
        pengeluaranKru: totalPengeluaranKruBulanIni,
        pengeluaranOwner: totalPengeluaranOwnerBulanIni,
        sisaSaldo: sisaSaldoBersihBara,
        saldoGudangKas: sisaKasGudangFisik,      
        nilaiAsetGudang: totalNilaiAsetGudangAktif 
      },
      stokMasuk: rowsIn.slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], pic: r[6] })),
      stokKeluar: rowsOut.slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], tujuan: r[8] || r[5] }))
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

    // Format Baris Baru: Tanggal | Kategori Internal | Keterangan Lengkap | Nominal (Rp)
    const barisBaru = [formatTanggalID, kategori, keterangan, nominal];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Belanja_Owner!A:D',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [barisBaru] },
    });

    return NextResponse.json({ success: true, message: 'Investasi/Belanja Owner berhasil dikunci ke spreadsheet!' });

  } catch (error: any) {
    console.error('API Owner POST Error:', error);
    return NextResponse.json({ error: 'Gagal mencatat belanja pribadi owner.', details: error.message }, { status: 500 });
  }
}