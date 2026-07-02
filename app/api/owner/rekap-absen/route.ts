import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const namaKru = (searchParams.get('nama') || '').toLowerCase().trim();

    if (!namaKru) return NextResponse.json({ error: 'Nama kru tidak valid.' }, { status: 400 });

    const today = new Date();
    const localDate = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const year = localDate.getFullYear();
    const prefixBulan = `${year}-${month}`;
    const hariBerjalan = localDate.getDate(); 

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) return NextResponse.json({ error: 'Kredensial error' }, { status: 500 });

    const formattedKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({ email: clientEmail, key: formattedKey, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
    const sheets = google.sheets({ version: 'v4', auth });

    const resAbsen = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Absensi!A:D' });
    const rows = resAbsen.data.values || [];

    let tepatWaktu = 0; let telat = 0; let prepDapur = 0; 
    let fullDay = 0; let izin = 0; let sakit = 0;
    
    const hariKerjaTercatat = new Set(); 

    rows.slice(1).forEach(row => {
      const timestamp = row[0] ? row[0].toString().trim() : '';
      const nama = row[1] ? row[1].toString().toLowerCase().trim() : '';
      const shift = row[2] ? row[2].toString().trim() : '';

      if (timestamp.startsWith(prefixBulan) && nama === namaKru) {
        const dateOnly = timestamp.split(' ')[0];
        hariKerjaTercatat.add(dateOnly); 

        // =========================================================
        // FIX: NORMALISASI JAM ( Google Sheets membuang angka 0 di depan)
        // =========================================================
        const timeRaw = timestamp.split(' ')[1] || '23:59:59'; 
        const timeParts = timeRaw.split(':');
        
        // Memaksa (padStart) jam, menit, detik selalu berformat 2 digit (contoh: '9' jadi '09')
        const h = (timeParts[0] || '23').padStart(2, '0');
        const m = (timeParts[1] || '59').padStart(2, '0');
        const s = (timeParts[2] || '59').padStart(2, '0');
        const timeOnly = `${h}:${m}:${s}`; 
        // =========================================================

        if (shift === 'Shift Pagi') {
          if (timeOnly <= '09:00:59') tepatWaktu++; else telat++;
        } else if (shift === 'Shift Malam') {
          if (timeOnly <= '12:30:59') prepDapur++;
          else if (timeOnly <= '12:30:59' && timeOnly <= '14:00:59') tepatWaktu++;
          else telat++;
        } else if (shift === 'Full Day') fullDay++;
        else if (shift === 'Izin Resmi') izin++;
        else if (shift === 'Sakit') sakit++;
      }
    });

    const totalHariKerja = hariKerjaTercatat.size;
    const hariKosong = Math.max(0, hariBerjalan - totalHariKerja);

    return NextResponse.json({
      success: true,
      data: { tepatWaktu, telat, prepDapur, fullDay, izin, sakit, hariKosong, hariBerjalan }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat rekap absen.' }, { status: 500 });
  }
}