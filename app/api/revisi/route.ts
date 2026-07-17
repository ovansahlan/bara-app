import { NextResponse } from 'next/server';
import { 
  getAuthSheets, 
  normalisasiTanggal, 
  verifyOwnerSession 
} from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = ['Penjualan', 'Pengeluaran', 'Kasbon'];

export async function GET(request: Request) {
  try {
    // 1. Enforce security check: verify owner session cookie
    if (!verifyOwnerSession()) {
      return NextResponse.json({ error: 'Unauthorized. Akses ditolak.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal') || new Date().toISOString().split('T')[0];

    // Validate date format to prevent split crashes
    if (!tanggal || typeof tanggal !== 'string' || !tanggal.includes('-')) {
      return NextResponse.json({ error: 'Format tanggal filter tidak valid (harus YYYY-MM-DD).' }, { status: 400 });
    }

    const [year, month, day] = tanggal.split('-');
    const formatTanggalID = `${day}/${month}/${year}`;

    const { sheets, spreadsheetId } = getAuthSheets();

    const [resPenjualan, resPengeluaran, resKasbon] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Penjualan!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Pengeluaran!A:H' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Kasbon!A:E' }).catch(() => ({ data: { values: [] } }))
    ]);

    // Fungsi penyaring data hari ini dengan melacak Nomor Baris aslinya (Index + 1)
    const filterHariIni = (rows: any[]) => {
      return rows
        .map((row, index) => ({ rowNumber: index + 1, rowData: row }))
        .filter(item => {
          if (!item.rowData || item.rowData.length === 0) return false;
          const tgl = item.rowData[0] ? item.rowData[0].toString().replace(/'/g, '').trim() : '';
          return tgl === tanggal || tgl === formatTanggalID;
        })
        .reverse(); // Urutkan dari yang paling baru diinput
    };

    return NextResponse.json({
      success: true,
      penjualan: filterHariIni(resPenjualan.data.values || []),
      pengeluaran: filterHariIni(resPengeluaran.data.values || []),
      kasbon: filterHariIni(resKasbon.data.values || [])
    });

  } catch (error) {
    console.error('API Revisi GET Error:', error);
    return NextResponse.json({ error: 'Gagal memuat data revisi.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Enforce security check: verify owner session cookie
    if (!verifyOwnerSession()) {
      return NextResponse.json({ error: 'Unauthorized. Akses ditolak.' }, { status: 401 });
    }

    const body = await request.json();
    const { kategori, rowNumber } = body; 

    // Validate inputs
    if (!kategori || typeof kategori !== 'string' || !VALID_CATEGORIES.includes(kategori)) {
      return NextResponse.json({ error: 'Kategori tidak valid.' }, { status: 400 });
    }

    const parsedRowNumber = parseInt(rowNumber, 10);
    if (isNaN(parsedRowNumber) || parsedRowNumber <= 1) {
      return NextResponse.json({ error: 'Nomor baris tidak valid.' }, { status: 400 });
    }

    const { sheets, spreadsheetId } = getAuthSheets();

    // Hapus/Kosongkan baris spesifik tersebut (Clear Row)
    const rangeTarget = `${kategori}!A${parsedRowNumber}:I${parsedRowNumber}`;
    
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: rangeTarget,
    });

    return NextResponse.json({ success: true, message: `Data di baris ${parsedRowNumber} berhasil dihapus/divoid!` });

  } catch (error) {
    console.error('API Revisi DELETE Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus data.' }, { status: 500 });
  }
}