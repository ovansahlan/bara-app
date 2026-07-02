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
    
    // Baca Master Product (A sampai E karena ada Batas Minimum di kolom E)
    const resMaster = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Master Product!A:E',
    });

    const masterRows = resMaster.data.values || [];

    const daftarProduk = masterRows.slice(1).map(row => {
      if (!row[0]) return null;
      return {
        id: row[0].toString().trim(),
        nama: row[1] || '',
        kategori: row[2] || '',
        satuan: row[3] || 'Pcs'
      };
    }).filter(p => p !== null);

    return NextResponse.json({ masterProduk: daftarProduk });

  } catch (error: any) {
    console.error('API Stok GET Error:', error);
    return NextResponse.json({ error: 'Gagal memuat Master Product.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, tanggal, penginput, keterangan, lokasiTujuan, daftarStok } = body;

    if (!daftarStok || !Array.isArray(daftarStok) || daftarStok.length === 0) {
      return NextResponse.json({ error: 'Keranjang stok kosong.' }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Kredensial server belum lengkap.' }, { status: 500 });
    }

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Format Tanggal Web ke Format Indonesia DD/MM/YYYY
    const [year, month, day] = tanggal.split('-');
    const formatTanggalID = `${day}/${month}/${year}`;
    
    let rangeTarget = '';
    let kumpulanBarisBaru: any[] = [];

    if (type === 'in') {
      rangeTarget = 'Stok_Masuk!A:G';
      // Format Stok_Masuk: Tanggal | ID Produk | Nama Barang | Qty Masuk | Harga Beli | Total Belanja | Penginput
      kumpulanBarisBaru = daftarStok.map((item: any) => [
        formatTanggalID, 
        item.idProduk, 
        item.namaBarang, 
        item.kuantiti, 
        item.hargaBeliSatuan, 
        item.totalBelanja, 
        penginput
      ]);
    } else if (type === 'out') {
      rangeTarget = 'Stok_Keluar!A:I';
      // Format Stok_Keluar Anda: Tanggal | ID | Nama | Qty | Keterangan | Penginput | Harga/Pcs | Total | Lokasi
      kumpulanBarisBaru = daftarStok.map((item: any) => [
        formatTanggalID, 
        item.idProduk, 
        item.namaBarang, 
        item.kuantiti, 
        keterangan, 
        penginput, 
        0, // Harga Modal Rata2 (Bisa dikosongkan 0 karena dihitung otomatis di dashboard)
        0, // Total Modal Terpakai
        lokasiTujuan
      ]);
    } else {
      return NextResponse.json({ error: 'Aksi logistik tidak dikenali.' }, { status: 400 });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: rangeTarget,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS', // Memaksa baris turun ke bawah
      requestBody: { values: kumpulanBarisBaru },
    });

    return NextResponse.json({ success: true, message: `${daftarStok.length} item mutasi ${type === 'in' ? 'Stok Masuk' : 'Stok Keluar'} berhasil disimpan!` });

  } catch (error: any) {
    console.error('API Stok POST Error:', error);
    return NextResponse.json({ error: 'Gagal mengunci entri mutasi gudang.', details: error.message }, { status: 500 });
  }
}