import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const namaKru = (searchParams.get('nama') || '').toLowerCase();
    const cabang = (searchParams.get('cabang') || '').toLowerCase();

    if (!namaKru || !cabang) return NextResponse.json({ error: 'Parameter tidak lengkap.' }, { status: 400 });

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const prefixTanggalID = `/${month}/${year}`; 
    const prefixTanggalWeb = `${year}-${month}`; 

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) return NextResponse.json({ error: 'Kredensial error' }, { status: 500 });

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({ email: clientEmail, key: formattedKey, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
    const sheets = google.sheets({ version: 'v4', auth });

    const rangeOmset = cabang === 'gerobak' ? 'Penjualan_Gerobak!A:H' : 'Penjualan!A:H';

    // Tarik data Master Kru & Omset Cabang
    const [resMaster, resOmset] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Master_Kru!A:G' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: rangeOmset }).catch(() => ({ data: { values: [] } }))
    ]);

    const parseRupiah = (val: any) => {
      if (!val) return 0;
      let str = val.toString().trim();
      if (/(,|\.)\d{2}$/.test(str)) str = str.slice(0, -3);
      return parseInt(str.replace(/\D/g, ''), 10) || 0;
    };

    // 1. Cari Gaji Pokok & Cicilan Kru
    const rowsMaster = resMaster.data.values || [];
    let gajiPokok = 0;
    let cicilan = 0;

    const kruData = rowsMaster.slice(1).find(r => (r[1] || '').toString().toLowerCase() === namaKru);
    if (kruData) {
      gajiPokok = parseRupiah(kruData[5] || 0); // Kolom F
      cicilan = parseRupiah(kruData[6] || 0);   // Kolom G
    }

    // 2. Hitung Total Omset Cabang Bulan Ini
    let totalOmsetCabang = 0;
    (resOmset.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalOmsetCabang += parseRupiah(row[7]);
      }
    });

    // 3. Kalkulasi Bonus Omset (Kedai Target 45Jt = 5% dibagi rata, Gerobak Target 20Jt = 200rb)
    let bonusOmset = 0;
    if (cabang === 'gerobak' && totalOmsetCabang >= 20000000) {
      bonusOmset = 200000;
    } else if (cabang === 'kedai' && totalOmsetCabang >= 45000000) {
      // Misal asumsi kru kedai aktif ada 4 orang (nanti bisa dibuat dinamis, sementara kita hardcode bagi 4 atau persentase khusus)
      const totalBonusKedai = totalOmsetCabang * 0.05;
      bonusOmset = totalBonusKedai / 4; // Dibagi 4 kru kedai
    }

    // 4. Kalkulasi Take Home Pay
    // (Tunjangan owner belum masuk sini dulu karena butuh tab Evaluasi, kita set 0 sementara)
    const tunjanganObjektif = 0; 
    const totalPendapatan = gajiPokok + bonusOmset + tunjanganObjektif;
    const takeHomePay = totalPendapatan - cicilan;

    return NextResponse.json({
      success: true,
      data: {
        nama: namaKru,
        cabang: cabang,
        periode: `${today.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`,
        gajiPokok,
        bonusOmset,
        tunjanganObjektif,
        totalPendapatan,
        cicilan,
        takeHomePay
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat slip gaji.' }, { status: 500 });
  }
}