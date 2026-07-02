import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const namaKru = (searchParams.get('nama') || '').toLowerCase().trim();
    const cabang = (searchParams.get('cabang') || '').toLowerCase().trim();

    if (!namaKru || !cabang) return NextResponse.json({ error: 'Parameter tidak lengkap.' }, { status: 400 });

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const prefixTanggalID = `/${month}/${year}`; 
    const prefixTanggalWeb = `${year}-${month}`; // Format YYYY-MM untuk pencarian di tab evaluasi

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) return NextResponse.json({ error: 'Kredensial error' }, { status: 500 });

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({ email: clientEmail, key: formattedKey, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
    const sheets = google.sheets({ version: 'v4', auth });

    const rangeOmset = cabang === 'gerobak' ? 'Penjualan_Gerobak!A:H' : 'Penjualan!A:H';

    // FIX DI SINI: Range Evaluasi_Bulanan diubah dari A:D menjadi A:E agar Kolom E ikut terbawa seutuhnya!
    const [resMaster, resOmset, resEvaluasi] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Master_Kru!A:G' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: rangeOmset }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Evaluasi_Bulanan!A:E' }).catch(() => ({ data: { values: [] } }))
    ]);

    const parseRupiah = (val: any) => {
      if (!val) return 0;
      let str = val.toString().trim();
      if (/(,|\.)\d{2}$/.test(str)) str = str.slice(0, -3);
      return parseInt(str.replace(/\D/g, ''), 10) || 0;
    };

    // 1. Cari Gaji Pokok & Cicilan dari Master_Kru
    const rowsMaster = resMaster.data.values || [];
    let gajiPokok = 0;
    let cicilan = 0;
    const kruData = rowsMaster.slice(1).find(r => (r[1] || '').toString().toLowerCase().trim() === namaKru);
    if (kruData) {
      gajiPokok = parseRupiah(kruData[5] || 0);
      cicilan = parseRupiah(kruData[6] || 0);
    }

    // 2. Ambil Tunjangan Objektif, Overtime & Catatan Kinerja dari Owner
    const rowsEvaluasi = resEvaluasi.data.values || [];
    let tunjanganObjektif = 0;
    let uangOvertime = 0; 
    let catatanOwner = "Terima kasih atas kerja kerasmu bulan ini. Pertahankan terus kinerjamu!";

    const evaluasiDitemukan = rowsEvaluasi.slice(1).find(row => {
      const rowBulan = row[0] ? row[0].toString().trim() : '';
      const rowNama = row[1] ? row[1].toString().toLowerCase().trim() : '';
      return rowBulan === prefixTanggalWeb && rowNama === namaKru;
    });

    if (evaluasiDitemukan) {
      tunjanganObjektif = parseRupiah(evaluasiDitemukan[2] || 0); // Kolom C
      uangOvertime = parseRupiah(evaluasiDitemukan[3] || 0);      // Kolom D (Uang Overtime)
      if (evaluasiDitemukan[4] && evaluasiDitemukan[4].toString().trim() !== '') {
        catatanOwner = evaluasiDitemukan[4].toString().trim();   // Kolom E (Catatan Owner)
      }
    }

    // 3. Hitung Total Omset Cabang Bulan Ini
    let totalOmsetCabang = 0;
    (resOmset.data.values || []).slice(1).forEach(row => {
      const tgl = row[0] ? row[0].toString().trim() : '';
      if (tgl.startsWith(prefixTanggalWeb) || tgl.endsWith(prefixTanggalID)) {
        totalOmsetCabang += parseRupiah(row[7]);
      }
    });

    // 4. Hitung Bonus Target Omset
    let bonusOmset = 0;
    if (cabang === 'gerobak' && totalOmsetCabang >= 20000000) {
      bonusOmset = 200000;
    } else if (cabang === 'kedai' && totalOmsetCabang >= 45000000) {
      const totalBonusKedai = totalOmsetCabang * 0.05;
      bonusOmset = totalBonusKedai / 4; 
    }

    // 5. Total Akhir Kalkulasi Take Home Pay (Gabungan Lembur & Insentif)
    const totalPendapatan = gajiPokok + bonusOmset + tunjanganObjektif + uangOvertime;
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
        uangOvertime, 
        totalPendapatan,
        cicilan,
        takeHomePay,
        catatanOwner
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat slip gaji.' }, { status: 500 });
  }
}