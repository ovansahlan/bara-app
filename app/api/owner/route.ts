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

    const [resPenjualan, resPengeluaran, resBelanjaOwner, resStokIn, resStokOut, resCurrentStock] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Belanja_Owner!A:D' }).catch(() => ({ data: { values: [] } })), 
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stock-In!A:G' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Stock-Out!A:I' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'CurrentStock!A:I' }).catch(() => ({ data: { values: [] } }))
    ]);

    let totalOmsetBulanIni = 0;
    let totalPengeluaranKruBulanIni = 0;
    let totalPengeluaranOwnerBulanIni = 0;
    let totalBelanjaGudangBulanIni = 0;

    // 1. Omset Bulanan
    (resPenjualan.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalOmsetBulanIni += parseInt(row[7] || '0', 10);
      }
    });

    // 2. Pengeluaran Kru Bulanan
    (resPengeluaran.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalPengeluaranKruBulanIni += parseInt((row[7] || '0').toString().replace(/\D/g, ''), 10);
      }
    });

    // 3. Pengeluaran Belanja Owner Bulanan
    (resBelanjaOwner.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalPengeluaranOwnerBulanIni += parseInt((row[3] || '0').toString().replace(/\D/g, ''), 10);
      }
    });

    // 4. Hitung Total Historis Belanja Gudang (Stock-In) Bulan Ini
    const rowsStokIn = resStokIn.data.values || [];
    rowsStokIn.slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalBelanjaGudangBulanIni += parseInt((row[5] || '0').toString().replace(/\D/g, ''), 10);
      }
    });

    // 5. Hitung Nilai Aset Bahan Baku Aktif Gudang Saat Ini
    let totalNilaiAsetGudang = 0;
    (resCurrentStock.data.values || []).slice(1).forEach(row => {
      totalNilaiAsetGudang += parseInt((row[8] || '0').toString().replace(/\D/g, ''), 10) || 0;
    });

    // FORMULA STRATEGIS SINKRONISASI MODAL 8 JUTA
    const sisaKasGudangTunai = 8000000 - totalBelanjaGudangBulanIni;
    const sisaSaldoBersihKopiBara = totalOmsetBulanIni - totalPengeluaranKruBulanIni - totalPengeluaranOwnerBulanIni;

    const mutasiMasuk = rowsStokIn.slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], pic: r[6] }));
    const mutasiKeluar = (resStokOut.data.values || []).slice(-4).reverse().map(r => ({ tgl: r[0], nama: r[2], qty: r[3], tujuan: r[8] }));

    return NextResponse.json({
      metrics: {
        omset: totalOmsetBulanIni,
        pengeluaranKru: totalPengeluaranKruBulanIni,
        pengeluaranOwner: totalPengeluaranOwnerBulanIni,
        sisaSaldo: sisaSaldoBersihKopiBara,
        saldoGudangKas: sisaKasGudangTunai, // Sisa Uang Fisik Gudang
        nilaiAsetGudang: totalNilaiAsetGudang // Sisa Nilai Barang Gudang
      },
      stokMasuk: mutasiMasuk,
      stokKeluar: mutasiKeluar
    });

  } catch (error: any) {
    console.error('API Owner GET Error:', error);
    return NextResponse.json({ error: 'Gagal memproses data portal.' }, { status: 500 });
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

    // Format Baris Baru Sesuai DB_Belanja_Owner: Tanggal | Kategori Internal | Keterangan Lengkap | Nominal (Rp)
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