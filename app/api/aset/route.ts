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

    // Tarik data khusus dari lembar CurrentStock
    const resCurrentStock = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'CurrentStock!A:J' // Sampai J untuk mencakup seluruh kolom penting
    });

    const rows = resCurrentStock.data.values || [];
    let totalAset = 0;
    const items: any[] = [];
    const stockAlerts: any[] = [];

    // Mapping Kolom Berdasarkan Format CSV Anda:
    // A:ID, B:Nama, C:Total Masuk, D:Total Keluar, E:Selisih, F:Stock Akhir, G:Total Belanja, H:Harga Rata2, I:Nilai Aset
    rows.slice(1).forEach(row => {
      if (!row[0]) return; // Lewati baris kosong
      
      const id = row[0].toString().trim();
      const nama = row[1] || 'Tidak Diketahui';
      const totalMasuk = parseInt(row[2] || '0', 10);
      const totalKeluar = parseInt(row[3] || '0', 10);
      const stockAkhir = parseInt(row[5] || '0', 10);
      
      // Ambil nilai aset dan bersihkan dari titik/koma/simbol Rp
      const nilaiAset = parseInt((row[8] || '0').toString().replace(/\D/g, ''), 10) || 0;

      totalAset += nilaiAset;

      const detailItem = {
        id,
        nama,
        masuk: totalMasuk,
        keluar: totalKeluar,
        sisa: stockAkhir,
        nilai: nilaiAset
      };

      items.push(detailItem);

      // ALGORITMA STOCK ALERT (Jika stok sisa 10 atau kurang, dan barang tersebut pernah dibeli/ada pergerakan)
      if (stockAkhir <= 10 && (totalMasuk > 0 || stockAkhir > 0)) {
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