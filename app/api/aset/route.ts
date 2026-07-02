import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
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

    // Tarik data CurrentStock DAN Master Product sekaligus
    const [resCurrentStock, resMasterProduct] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'CurrentStock!A:J' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Master Product!A:E' }) // Sampai E untuk ambil kolom Batas Minimum
    ]);

    // 1. Buat "Kamus" Batas Minimum per ID dari Master Product
    const thresholdMap: Record<string, number> = {};
    const barisMaster = resMasterProduct.data.values || [];
    
    barisMaster.slice(1).forEach(row => {
      const id = row[0] ? row[0].toString().trim() : '';
      // Jika Kolom E kosong, default alert adalah 10
      const batas = parseInt(row[4] || '10', 10);
      if (id && !isNaN(batas)) {
        thresholdMap[id] = batas;
      }
    });

    // 2. Baca Sisa Stok dan Bandingkan dengan Kamus Batas Minimum
    const rows = resCurrentStock.data.values || [];
    let totalAset = 0;
    const items: any[] = [];
    const stockAlerts: any[] = [];

    rows.slice(1).forEach(row => {
      if (!row[0]) return;
      
      const id = row[0].toString().trim();
      const nama = row[1] || 'Tidak Diketahui';
      const totalMasuk = parseInt(row[2] || '0', 10);
      const totalKeluar = parseInt(row[3] || '0', 10);
      const stockAkhir = parseInt(row[5] || '0', 10);
      const nilaiAset = parseInt((row[8] || '0').toString().replace(/\D/g, ''), 10) || 0;

      totalAset += nilaiAset;

      // Cari batas minimum custom dari kamus, jika tidak ketemu pakai default 10
      const batasAman = thresholdMap[id] !== undefined ? thresholdMap[id] : 10;

      const detailItem = {
        id,
        nama,
        masuk: totalMasuk,
        keluar: totalKeluar,
        sisa: stockAkhir,
        nilai: nilaiAset,
        batasAman: batasAman // Bawa data batas aman ke frontend
      };

      items.push(detailItem);

      // ALGORITMA STOCK ALERT KUSTOM
      // Jika stok sisa <= batas custom dan barang tersebut pernah ada mutasi
      if (stockAkhir <= batasAman && (totalMasuk > 0 || stockAkhir > 0)) {
        stockAlerts.push(detailItem);
      }
    });

    return NextResponse.json({
      success: true,
      totalAset,
      items,
      stockAlerts
    });

  } catch (error: any) {
    console.error('API Aset Error:', error);
    return NextResponse.json({ error: 'Gagal memuat rincian aset gudang.' }, { status: 500 });
  }
}