import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggalFilter = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];
    const kruFilter = (searchParams.get('kru') || '').toLowerCase();

    const [year, month, day] = tanggalFilter.split('-');
    const formatTanggalID = `${day}/${month}/${year}`;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) return NextResponse.json({ error: 'Kredensial error' }, { status: 500 });

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({ email: clientEmail, key: formattedKey, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
    const sheets = google.sheets({ version: 'v4', auth });

    const [resPenjualanGrb, resPengeluaranGrb, resKasbon] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan_Gerobak!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran_Gerobak!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Kasbon!A:E' }).catch(() => ({ data: { values: [] } }))
    ]);

    const parseRupiah = (val: any) => {
      if (!val) return 0;
      let str = val.toString().trim();
      if (/(,|\.)\d{2}$/.test(str)) str = str.slice(0, -3);
      return parseInt(str.replace(/\D/g, ''), 10) || 0;
    };

    const omset = { tunai: 0, qris: 0, edc: 0, grab: 0, total: 0 };
    const rincianPengeluaran: any[] = [];
    let totalPengeluaran = 0;
    let totalKasbonKruIni = 0;

    // 1. Filter Penjualan (Berdasarkan Tanggal & Nama Kru)
    (resPenjualanGrb.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().replace(/'/g, '').trim() : '';
      const nama = row[1] ? row[1].toString().toLowerCase() : '';
      
      if ((tgl === tanggalFilter || tgl === formatTanggalID) && nama === kruFilter) {
        omset.tunai += parseRupiah(row[3]);
        omset.qris += parseRupiah(row[4]);
        omset.edc += parseRupiah(row[5]);
        omset.grab += parseRupiah(row[6]);
        omset.total += parseRupiah(row[7]);
      }
    });

    // 2. Filter Pengeluaran (Berdasarkan Tanggal & Nama Kru)
    (resPengeluaranGrb.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().replace(/'/g, '').trim() : '';
      const nama = row[1] ? row[1].toString().toLowerCase() : '';

      if ((tgl === tanggalFilter || tgl === formatTanggalID) && nama === kruFilter) {
        const nominal = parseRupiah(row[7]);
        totalPengeluaran += nominal;
        rincianPengeluaran.push({
          keterangan: row[3] || 'Pengeluaran',
          nominal: nominal
        });
      }
    });

    // 3. Filter Kasbon Gerobak (Berdasarkan Tanggal, Nama Kru, dan tag Gerobak)
    (resKasbon.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().replace(/'/g, '').trim() : '';
      const nama = row[1] ? row[1].toString().toLowerCase() : '';
      const keterangan = row[3] ? row[3].toString().toLowerCase() : '';

      if ((tgl === tanggalFilter || tgl === formatTanggalID) && nama === kruFilter && keterangan.includes('gerobak')) {
        totalKasbonKruIni += parseRupiah(row[2]);
      }
    });

    // Sisa Uang Fisik Laci
    const sisaUangTunai = Math.round(omset.tunai - totalPengeluaran - totalKasbonKruIni);

    return NextResponse.json({
      success: true,
      omset,
      pengeluaran: rincianPengeluaran,
      totalPengeluaran,
      totalKasbon: totalKasbonKruIni,
      sisaUangTunai
    });

  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat rekap gerobak.' }, { status: 500 });
  }
}