import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    // Ekstrak komponen bulan dan tahun (Contoh: "2026-07-02" -> year="2026", month="07")
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

    // TARIK 5 TAB SECARA PARALEL
    const [resPenjualan, resPengeluaran, resBelanjaOwner, resStokIn, resStokOut] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Belanja_Owner!A:D' }).catch(() => ({ data: { values: [] } })), // Tab Pengeluaran Pribadi Owner
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stock-In!A:G' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stock-Out!A:I' }).catch(() => ({ data: { values: [] } }))
    ]);

    // Indikator Keuangan Bulanan
    let totalOmsetBulanIni = 0;
    let totalPengeluaranKruBulanIni = 0;
    let totalPengeluaranOwnerBulanIni = 0;
    let totalBelanjaGudangBulanIni = 0;

    // 1. Akumulasi Omset Bulanan (Index 7: Total Penjualan)
    const rowsPenjualan = resPenjualan.data.values || [];
    rowsPenjualan.slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalOmsetBulanIni += parseInt(row[7] || '0', 10);
      }
    });

    // 2. Akumulasi Pengeluaran Kru Bulanan (Index 7: Nilai/Total Pengeluaran harian)
    const rowsPengeluaran = resPengeluaran.data.values || [];
    rowsPengeluaran.slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalPengeluaranKruBulanIni += parseInt((row[7] || '0').toString().replace(/\D/g, ''), 10);
      }
    });

    // 3. Akumulasi Pengeluaran Belanja Owner (Index 3: Nominal Rp di tab Belanja_Owner)
    const rowsBelanjaOwner = resBelanjaOwner.data.values || [];
    rowsBelanjaOwner.slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalPengeluaranOwnerBulanIni += parseInt((row[3] || '0').toString().replace(/\D/g, ''), 10);
      }
    });

    // 4. Akumulasi Belanja Modal Gudang (Stock-In Index 5: Total Belanja)
    const rowsStokIn = resStokIn.data.values || [];
    rowsStokIn.slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalBelanjaGudangBulanIni += parseInt((row[5] || '0').toString().replace(/\D/g, ''), 10);
      }
    });

    // Kalkulasi Saldo Akhir Bersih & Sisa Plafon Gudang (Plafon: 8jt)
    const sisaSaldoBersih = totalOmsetBulanIni - totalPengeluaranKruBulanIni - totalPengeluaranOwnerBulanIni;
    const saldoGudangTersedia = 8000000 - totalBelanjaGudangBulanIni;

    // Mutasi Pergerakan Stok Terbaru (Ambil 4 Log Terakhir untuk chart ringkas)
    const mutasiMasuk = rowsStokIn.slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], pic: r[6] }));
    const mutasiKeluar = (resStokOut.data.values || []).slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], tujuan: r[8] }));

    return NextResponse.json({
      metrics: {
        omset: totalOmsetBulanIni,
        pengeluaranKru: totalPengeluaranKruBulanIni,
        pengeluaranOwner: totalPengeluaranOwnerBulanIni,
        sisaSaldo: sisaSaldoBersih,
        saldoGudang: saldoGudangTersedia,
        totalBelanjaGudang: totalBelanjaGudangBulanIni
      },
      stokMasuk: mutasiMasuk,
      stokKeluar: mutasiKeluar
    });

  } catch (error: any) {
    console.error('API Owner Error:', error);
    return NextResponse.json({ error: 'Gagal memproses data portal owner.' }, { status: 500 });
  }
}