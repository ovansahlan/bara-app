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
    const hariBerjalan = localDate.getDate();
    
    const monthNum = localDate.getMonth() + 1;
    const month = String(monthNum).padStart(2, '0');
    const year = localDate.getFullYear();
    
    // Helper untuk kecocokan tanggal/bulan yang 100% akurat
    const isSameMonthYear = (rowBulanStr: string, targetYear: number, targetMonth: number) => {
      if (!rowBulanStr) return false;
      const str = rowBulanStr.trim().toLowerCase();
      const mStr = String(targetMonth).padStart(2, '0');
      const mSingle = String(targetMonth);
      const yStr = String(targetYear);
      const yShort = String(targetYear).slice(-2);

      if (str.includes(`${yStr}-${mStr}`) || str.includes(`${yStr}-${mSingle}`)) return true;
      if (str.includes(`${mStr}/${yStr}`) || str.includes(`${mSingle}/${yStr}`)) return true;
      if (str.includes(`${mStr}-${yStr}`) || str.includes(`${mSingle}-${yStr}`)) return true;
      if (str.includes(`${yStr}/${mStr}`) || str.includes(`${yStr}/${mSingle}`)) return true;
      if (str.includes(`${mStr}/${yShort}`) || str.includes(`${mSingle}/${yShort}`)) return true;

      const monthNamesID = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
      const monthNamesEN = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const nameID = monthNamesID[targetMonth - 1];
      const nameEN = monthNamesEN[targetMonth - 1];

      if ((str.includes(nameID) || str.includes(nameEN)) && str.includes(yStr)) return true;

      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        if (d.getFullYear() === targetYear && (d.getMonth() + 1) === targetMonth) return true;
      }
      return false;
    };

    const cleanNama = (str: string) => (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const reqNamaClean = cleanNama(namaKru);

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
      const nama = row[1] ? row[1].toString() : '';
      const shift = row[2] ? row[2].toString().trim() : '';

      const rNamaClean = cleanNama(nama);
      const isNamaCocok = rNamaClean === reqNamaClean || 
                           rNamaClean.includes(reqNamaClean) || 
                           reqNamaClean.includes(rNamaClean);

      const isBulanCocok = isSameMonthYear(timestamp, year, monthNum);

      if (isBulanCocok && isNamaCocok) {
        const dateOnly = timestamp.split(' ')[0];
        hariKerjaTercatat.add(dateOnly); 

        // TWEAK: Antisipasi kalau format AM/PM ikut nempel
        const rawWaktu = timestamp.split(' ')[1] || '23:59:59'; 
        const isPM = timestamp.toLowerCase().includes('pm');
        
        const timeParts = rawWaktu.split(':');
        let h = parseInt(timeParts[0] || '23', 10);
        
        // Konversi PM ke format 24 jam (Jika Google Sheets mengubahnya ke AM/PM)
        if (isPM && h !== 12) h += 12;
        if (!isPM && h === 12 && timestamp.toLowerCase().includes('am')) h = 0;

        const hStr = String(h).padStart(2, '0');
        const mStr = (timeParts[1] || '59').padStart(2, '0');
        const sStr = (timeParts[2] || '59').replace(/[^0-9]/g, '').padStart(2, '0'); // Buang huruf AM/PM jika nyangkut
        
        const timeOnly = `${hStr}:${mStr}:${sStr}`; 

        if (shift === 'Shift Pagi') {
          if (timeOnly <= '09:00:59') tepatWaktu++; else telat++;
        } else if (shift === 'Shift Malam') {
          if (timeOnly <= '12:30:59') prepDapur++;
          else if (timeOnly > '12:30:59' && timeOnly <= '14:00:59') tepatWaktu++;
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