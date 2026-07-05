'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, RefreshCw, Wallet, TrendingUp, Package, 
  Camera, Box, ClipboardList, Boxes, Store, ShieldCheck, Users,
  ArrowDownToLine, ArrowUpFromLine, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, LabelList } from 'recharts';

export default function DashboardUtama() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [tanggalPilih, setTanggalPilih] = useState<string>(new Date().toISOString().split('T')[0]);

  const fetchData = async (tanggalFilter: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard?tanggal=${tanggalFilter}`);
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(tanggalPilih); 
  }, [tanggalPilih]);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID').format(val || 0);

  // Helper untuk format string rupiah dari Google Sheets
  const formatRupiahString = (val: any) => {
    const num = parseInt(String(val).replace(/\D/g, ''), 10) || 0;
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Helper untuk Grafik: Menyingkat angka agar tidak overlap (Contoh: 1.5M, 500K)
  const formatShortIDR = (val: number) => {
    if (!val || val === 0) return '';
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toString();
  };

  const getNamaBulan = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // FORMATTER TANGGAL INDONESIA
  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      if (dateStr.includes('-')) {
        const [y, m, d] = dateStr.split('-');
        const bulanNama = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${parseInt(d, 10)} ${bulanNama[parseInt(m, 10) - 1]} ${y}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-28 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* HEADER UTAMA */}
      <div className="bg-white/90 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
             <img src="/logo.png" alt="Logo Kopi Bara" className="h-8 sm:h-10 w-auto object-contain drop-shadow-sm" crossOrigin="anonymous" />
            <div className="border-l-2 border-zinc-200 pl-3 ml-1">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-zinc-900 uppercase">Kedai Pusat</h1>
              <p className="text-[8px] sm:text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Dashboard Utama</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-zinc-100 px-2 sm:px-3 py-1.5 rounded-full border border-zinc-200/40">
              <Calendar size={12} className="text-indigo-500" />
              <input type="date" value={tanggalPilih} onChange={(e) => setTanggalPilih(e.target.value)} className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-transparent outline-none cursor-pointer text-zinc-700 w-[85px] sm:w-auto" />
            </div>
            <button onClick={() => fetchData(tanggalPilih)} className="p-2 bg-zinc-100 text-zinc-500 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95 shadow-xs">
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-indigo-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          
          {/* ================= KOLOM KIRI (UTAMA) ================= */}
          <div className="md:col-span-2 flex flex-col gap-4 sm:gap-6 h-full">
            
            {/* ROW 1: KAS LACI KASIR */}
            <div className="bg-zinc-900 text-white p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between group min-h-[160px]">
              <div className="absolute top-0 right-0 opacity-[0.02] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Wallet size={150} />
              </div>
              <div className="relative z-10">
                <span className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <Wallet size={12} /> Estimasi Fisik Laci Kasir
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Rp {data ? formatIDR(data.saldoLaciKasir) : '0'}
                </h2>
              </div>
              <div className="relative z-10 text-[8px] sm:text-[9px] text-zinc-400 bg-white/5 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl w-fit font-bold uppercase tracking-wider mt-4 border border-white/5">
                Net Tunai Bulanan • {data ? getNamaBulan(tanggalPilih) : '-'}
              </div>
            </div>

            {/* ROW 2: METRICS KEUANGAN HARIAN */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-none">
              <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Omset Hari Ini</span>
                <p className="text-sm sm:text-lg font-black text-zinc-800 truncate">Rp {data ? formatIDR(data.omset.total) : '0'}</p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Keluar Hari Ini</span>
                <p className="text-sm sm:text-lg font-black text-rose-500 truncate">Rp {data ? formatIDR(data.totalKeluar) : '0'}</p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Kasbon Hari Ini</span>
                <p className="text-sm sm:text-lg font-black text-amber-600 truncate">Rp {data ? formatIDR(data.totalKasbon) : '0'}</p>
              </div>
            </div>

            {/* ROW 3: TOMBOL NAVIGASI PORTAL */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-none">
              <Link href="/owner" className="bg-white border border-zinc-200 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:border-indigo-400 transition-all flex flex-col items-center sm:items-start justify-center sm:justify-between group text-center sm:text-left gap-2 sm:gap-0 h-full">
                <div className="p-2 sm:p-2.5 bg-zinc-50 text-zinc-500 rounded-lg sm:rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="w-full sm:mt-2">
                  <p className="text-[7px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-widest sm:mb-0.5 truncate">Otoritas Pusat</p>
                  <p className="text-[9px] sm:text-xs font-black text-zinc-800 truncate">Portal Owner</p>
                </div>
              </Link>

              <Link href="/gerobak" className="bg-white border border-zinc-200 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:border-amber-400 transition-all flex flex-col items-center sm:items-start justify-center sm:justify-between group text-center sm:text-left gap-2 sm:gap-0 h-full">
                <div className="p-2 sm:p-2.5 bg-zinc-50 text-zinc-500 rounded-lg sm:rounded-xl group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors shrink-0">
                  <Store size={16} />
                </div>
                <div className="w-full sm:mt-2">
                  <p className="text-[7px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-widest sm:mb-0.5 truncate">Cabang</p>
                  <p className="text-[9px] sm:text-xs font-black text-zinc-800 truncate">Portal Gerobak</p>
                </div>
              </Link>

              <Link href="/kru/login" className="bg-zinc-900 border border-zinc-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-md hover:bg-zinc-800 transition-all flex flex-col items-center sm:items-start justify-center sm:justify-between group text-center sm:text-left gap-2 sm:gap-0 h-full">
                <div className="p-2 sm:p-2.5 bg-zinc-800 text-zinc-300 rounded-lg sm:rounded-xl group-hover:text-white transition-colors shrink-0">
                  <Users size={16} />
                </div>
                <div className="w-full sm:mt-2">
                  <p className="text-[7px] sm:text-[9px] font-bold text-zinc-400 uppercase tracking-widest sm:mb-0.5 truncate">Mini HRIS</p>
                  <p className="text-[9px] sm:text-xs font-black text-white truncate">Portal Kru</p>
                </div>
              </Link>
            </div>

            {/* 🔥 ROW 4: GRAFIK TREND OMSET 7 HARI (FLEX-1 UNTUK DESKTOP VIEW) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col flex-1 min-h-[260px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-indigo-500" /> Trend Omset 7 Hari
                </span>
              </div>
              <div className="flex-1 w-full mt-4 min-h-[180px]">
                {data?.trendOmset ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trendOmset} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="hari" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold' }} dy={10} />
                      <Tooltip
                        formatter={(value: any) => [`Rp ${formatIDR(Number(value || 0))}`, 'Omset']}
                        labelStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#71717a' }}
                        itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#18181b' }}
                      />
                      <Area type="monotone" dataKey="omset" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorOmset)">
                        {/* 🌟 LABEL ANGKA DI ATAS GARIS GRAFIK */}
                        <LabelList 
                          dataKey="omset" 
                          position="top" 
                          offset={8} 
                          formatter={formatShortIDR} 
                          style={{ fontSize: '10px', fontWeight: '900', fill: '#4f46e5' }} 
                        />
                      </Area>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-50 rounded-xl text-xs font-bold text-zinc-400">
                    Memuat grafik...
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ================= KOLOM KANAN: GUDANG & LOGISTIK ================= */}
          <div className="flex flex-col gap-4 sm:gap-6 h-full">
            
            {/* 🔥 CARD ASET GUDANG (LINK KE RIWAYAT STOK) */}
            <Link href="/aset-gudang" className="bg-white p-5 rounded-2xl shadow-xs border border-zinc-200/80 relative overflow-hidden shrink-0 group min-h-[110px] flex flex-col justify-center cursor-pointer hover:border-indigo-400 transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                 <Boxes size={80} className="text-indigo-900" />
               </div>
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1 mb-1 relative z-10">
                 Total Nilai Aset Gudang <ArrowUpRight size={10} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
               </span>
               <h3 className="text-2xl font-black tracking-tight text-zinc-800 relative z-10 group-hover:text-indigo-600 transition-colors">
                 Rp {data ? formatIDR(data.nilaiAsetGudang) : '0'}
               </h3>
            </Link>

            {/* TABEL 1: LOGISTIK MASUK */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col h-[280px] lg:h-[300px]">
              <div className="p-3.5 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5"><ArrowDownToLine size={14} className="text-emerald-500" /> Stok Masuk</span>
                <span className="text-[8px] font-bold bg-white px-2 py-1 rounded-full border border-emerald-200 text-emerald-600">Terbaru</span>
              </div>
              <div className="divide-y divide-zinc-50 text-[10px] overflow-y-auto flex-1">
                {data?.historyStokIn?.length > 0 ? data.historyStokIn.map((item: any[], i: number) => (
                  <div key={`in-${i}`} className="p-3 sm:p-4 flex justify-between items-center hover:bg-emerald-50/30 transition-colors">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-zinc-800 block truncate text-[11px] sm:text-xs">{item[2]}</span>
                      <span className="text-[9px] font-medium text-zinc-500 mt-0.5 block">{formatTanggalIndo(item[0])}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-black px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg block w-fit ml-auto mb-1">
                        + {item[3]} Unit
                      </span>
                      <span className="text-[9px] font-bold text-zinc-500 block">
                        Rp {formatRupiahString(item[5])}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-50 p-6">
                    <Package size={24} className="text-zinc-300 mb-2" />
                    <p className="text-center text-[10px] text-zinc-400 font-medium">Belum ada stok masuk.</p>
                  </div>
                )}
              </div>
            </div>

            {/* TABEL 2: LOGISTIK KELUAR */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col h-[280px] lg:h-[300px]">
              <div className="p-3.5 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1.5"><ArrowUpFromLine size={14} className="text-amber-500" /> Stok Keluar</span>
                <span className="text-[8px] font-bold bg-white px-2 py-1 rounded-full border border-amber-200 text-amber-600">Terbaru</span>
              </div>
              <div className="divide-y divide-zinc-50 text-[10px] overflow-y-auto flex-1">
                {data?.historyStokOut?.length > 0 ? data.historyStokOut.map((item: any[], i: number) => (
                  <div key={`out-${i}`} className="p-3 sm:p-4 flex justify-between items-center hover:bg-amber-50/30 transition-colors">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-zinc-800 block truncate text-[11px] sm:text-xs">{item[2]}</span>
                      <div className="text-[9px] mt-0.5 flex flex-col gap-0.5">
                        <span className="font-medium text-zinc-500">{formatTanggalIndo(item[0])}</span>
                        <span className="font-semibold text-amber-600 truncate">Tujuan: {item[8] || 'Kedai Pusat'}</span>
                        {item[4] && item[4] !== '-' && (
                          <span className="text-[8px] text-zinc-400 italic truncate mt-0.5">Ket: {item[4]}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-black px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">
                        - {item[3]} Unit
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-50 p-6">
                    <Package size={24} className="text-zinc-300 mb-2" />
                    <p className="text-center text-[10px] text-zinc-400 font-medium">Belum ada stok keluar.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ================= FLOATING BOTTOM NAV ================= */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[90%] max-w-md z-40">
        <div className="bg-white/95 backdrop-blur-lg border border-zinc-200/80 rounded-full shadow-xl shadow-zinc-200/50 p-1.5 sm:p-2 px-5 sm:px-6 flex justify-between items-center">
          <Link href="/absen" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-800 p-1.5 sm:p-2 transition-colors">
            <Camera size={18} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Absen</span>
          </Link>
          <Link href="/pengeluaran" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-800 p-1.5 sm:p-2 transition-colors">
            <Wallet size={18} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Belanja</span>
          </Link>
          <Link href="/penjualan" className="flex flex-col items-center gap-1 text-indigo-600 p-1.5 sm:p-2 transform scale-110 -mt-3 sm:-mt-5">
             <div className="bg-indigo-600 text-white p-3 sm:p-3.5 rounded-full shadow-lg shadow-indigo-600/30 ring-4 ring-zinc-50 transition-transform active:scale-95">
               <TrendingUp size={20} strokeWidth={3} />
             </div>
          </Link>
          <Link href="/stok" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-800 p-1.5 sm:p-2 transition-colors">
            <Box size={18} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Stok</span>
          </Link>
          <Link href="/report" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-800 p-1.5 sm:p-2 transition-colors">
            <ClipboardList size={18} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Laporan</span>
          </Link>
        </div>
      </div>

    </div>
  );
}