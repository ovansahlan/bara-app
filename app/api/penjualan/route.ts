import { NextResponse } from 'next/server';
import { getAuthSheets } from '@/lib/google-sheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal'); // Format dari frontend: YYYY-MM-DD

    if (!tanggal || typeof tanggal !== 'string' || !tanggal.includes('-')) {
      return NextResponse.json({ error: 'Tanggal diperlukan dengan format YYYY-MM-DD' }, { status: 400 });
    }

    // FORMATTER: Ubah "YYYY-MM-DD" menjadi "DD/MM/YYYY"
    const [year, month, day] = tanggal.split('-');
    const formatTanggalID = `${day}/${month}/${year}`;

    const { sheets, spreadsheetId } = getAuthSheets();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Penjualan!A:H', 
    });

    const rows = response.data.values || [];
    
    const rincianPagi = {
      tunai: 0,
      qris: 0,
      edcTransfer: 0,
      grabOnline: 0,
      totalPenjualan: 0
    };

    rows.forEach(row => {
      if (!row || row.length === 0) return;
      const rowTanggal = row[0]; // Kolom A
      const rowShift = row[2];   // Kolom C

      // Cek apakah tanggal sama dengan format DD/MM/YYYY atau YYYY-MM-DD (histori lama)
      if ((rowTanggal === formatTanggalID || rowTanggal === tanggal) && rowShift === 'Shift 1 (Pagi)') {
        rincianPagi.tunai += parseInt(row[3] || '0', 10) || 0;
        rincianPagi.qris += parseInt(row[4] || '0', 10) || 0;
        rincianPagi.edcTransfer += parseInt(row[5] || '0', 10) || 0;
        rincianPagi.grabOnline += parseInt(row[6] || '0', 10) || 0;
        rincianPagi.totalPenjualan += parseInt(row[7] || '0', 10) || 0;
      }
    });

    return NextResponse.json(rincianPagi);

  } catch (error: any) {
    console.error('GET Sheets Error in Penjualan:', error);
    return NextResponse.json({ error: 'Gagal membaca data pagi.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tanggal, namaKasir, shift, tunai, qris, edcTransfer, grabOnline, totalPenjualan } = body;

    // Input validation
    if (!tanggal || typeof tanggal !== 'string' || !tanggal.includes('-')) {
      return NextResponse.json({ error: 'Tanggal wajib diisi dengan format YYYY-MM-DD.' }, { status: 400 });
    }
    if (!namaKasir || !shift) {
      return NextResponse.json({ error: 'Nama kasir dan shift wajib diisi.' }, { status: 400 });
    }

    // FORMATTER: Ubah "YYYY-MM-DD" menjadi "DD/MM/YYYY" agar diterima Google Sheets
    const [year, month, day] = tanggal.split('-');
    const formatTanggalID = `${day}/${month}/${year}`;

    const { sheets, spreadsheetId } = getAuthSheets();

    // Gunakan formatTanggalID yang sudah diubah formatnya
    const barisBaru = [
      formatTanggalID, 
      namaKasir, 
      shift, 
      parseInt(tunai, 10) || 0, 
      parseInt(qris, 10) || 0, 
      parseInt(edcTransfer, 10) || 0, 
      parseInt(grabOnline, 10) || 0, 
      parseInt(totalPenjualan, 10) || 0
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Penjualan!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS', 
      requestBody: { values: [barisBaru] },
    });

    return NextResponse.json({ success: true, message: 'Omset per kategori berhasil dikunci ke sistem!' });

  } catch (error: any) {
    console.error('POST Sheets Error in Penjualan:', error);
    return NextResponse.json({ error: 'Gagal menyimpan omset.', details: error.message }, { status: 500 });
  }
}