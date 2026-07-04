'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, TrendingUp, Wallet, Box, 
  RefreshCw, Calendar, History, Camera, 
  Layers, MessageCircle, BookOpen, ChevronRight, Store, ShoppingBag
} from 'lucide-react';

export default function DashboardGerobak() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [tanggalPilih, setTanggalPilih] = useState<string>(new Date().toISOString().split('T')[0]);

  const fetchData = async (tanggalFilter: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/gerobak/dashboard?tanggal=${tanggalFilter}`);
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

  const getNamaBulan = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* GLOBAL HEADER */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/logo.png" 
              alt="Logo Kopi Bara" 
              className="h-8 sm:h-10 w-auto object-contain drop-shadow-sm" 
              crossOrigin="anonymous"
            />
            <div className="border-l-2 border-slate-200 pl-3 ml-1">
              <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">Gerobak Hub</h1>
              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Operasional Cabang</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 sm:px-3 py-1.5 rounded-full border border-slate-200/40">
              <Calendar size={12} className="text-amber-500" />
              <input 
                type="date" 
                value={tanggalPilih}
                onChange={(e) => setTanggalPilih(e.target.value)}
                className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-transparent outline-none cursor-pointer text-slate-700 w-[85px] sm:w-auto"
              />
            </div>
            <button onClick={() => fetchData(tanggalPilih)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-amber-50 hover:text-amber-600 transition-all active:scale-95 shadow-sm">
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-amber-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* FLUID BENTO WORKSPACE AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          
          {/* KOLOM KIRI */}
          <div className="md:col-span-2 flex flex-col gap-4 sm:gap-6 h-full">
            
            {/* ROW 1: TOTAL OMSET BULANAN */}
            <div className="bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 text-white p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between group h-full">
              <div className="absolute top-0 right-0 opacity-[0.03] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <TrendingUp size={150} />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <TrendingUp size={12} /> Total Omset Bulan Ini
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-amber-400">
                  Rp {data ? formatIDR(data.totalOmsetBulanIni) : '0'}
                </h2>
              </div>
              <div className="text-[8px] sm:text-[9px] text-slate-300 bg-white/5 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl w-fit font-bold uppercase tracking-wider mt-4 border border-white/10">
                Akumulasi Bruto • {data ? getNamaBulan(tanggalPilih) : '-'}
              </div>
            </div>

            {/* ROW 2: MINI METRICS GRID */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-none">
              <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5 sm:mb-1">Omset Hari Ini</span>
                <p className="text-lg sm:text-xl font-black text-slate-800">Rp {data ? formatIDR(data.omset.total) : '0'}</p>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5 sm:mb-1">Belanja Hari Ini</span>
                <p className="text-lg sm:text-xl font-black text-rose-500">Rp {data ? formatIDR(data.totalKeluar) : '0'}</p>
              </div>
            </div>

            {/* ROW 3: AKSI OUTLET GEROBAK (LINK SUDAH DIPERBAIKI) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-none">
              <Link href="/stok" className="bg-white border border-slate-200 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:border-amber-300 transition-all flex flex-col items-center sm:items-start justify-center sm:justify-between group text-center sm:text-left gap-2 sm:gap-0 h-full">
                <div className="p-2 sm:p-2.5 bg-slate-50 text-slate-500 rounded-lg sm:rounded-xl group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors shrink-0">
                  <Box size={16} />
                </div>
                <div className="w-full sm:mt-2">
                  <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest sm:mb-0.5 truncate">Logistik</p>
                  <p className="text-[9px] sm:text-xs font-black text-slate-800 truncate">Cek Stok</p>
                </div>
              </Link>

              <Link href="/gerobak/report" className="bg-white border border-slate-200 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:border-amber-300 transition-all flex flex-col items-center sm:items-start justify-center sm:justify-between group text-center sm:text-left gap-2 sm:gap-0 h-full">
                <div className="p-2 sm:p-2.5 bg-slate-50 text-slate-500 rounded-lg sm:rounded-xl group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors shrink-0">
                  <MessageCircle size={16} />
                </div>
                <div className="w-full sm:mt-2">
                  <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest sm:mb-0.5 truncate">Closing</p>
                  <p className="text-[9px] sm:text-xs font-black text-slate-800 truncate">Laporan WA</p>
                </div>
              </Link>

              <Link href="/kru/login" className="bg-gradient-to-br from-indigo-500 to-blue-600 border border-indigo-400 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col items-center sm:items-start justify-center sm:justify-between group text-center sm:text-left gap-2 sm:gap-0 h-full">
                <div className="p-2 sm:p-2.5 bg-white/20 text-white rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="w-full sm:mt-2">
                  <p className="text-[7px] sm:text-[9px] font-bold text-indigo-100 uppercase tracking-widest sm:mb-0.5 truncate">Mini-HRIS</p>
                  <p className="text-[9px] sm:text-xs font-black text-white truncate">Portal Kru</p>
                </div>
              </Link>
            </div>

          </div>

          {/* KOLOM KANAN */}
          <div className="flex flex-col gap-4 sm:gap-6 h-full">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[300px] md:min-h-0">
              <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <span className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                  <History size={14} className="text-amber-500" /> Log Belanja Gerobak
                </span>
                <span className="text-[8px] font-bold bg-white px-2 py-1 rounded-full border border-slate-200 text-slate-400">Terakhir</span>
              </div>
              
              <div className="divide-y divide-slate-50 text-[10px] sm:text-[11px] overflow-y-auto flex-1 h-0">
                {data?.historyBelanja && data.historyBelanja.length > 0 ? data.historyBelanja.map((item: any, i: number) => (
                  <div key={i} className="p-3 sm:p-4 flex justify-between items-center hover:bg-slate-50/60 transition-colors">
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <span className="font-bold text-slate-800 truncate">{item.barang}</span>
                      <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium truncate">
                        {item.tanggal} • {item.qty} {item.satuan}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-1 rounded-lg shrink-0">
                      Rp {formatIDR(item.nominal)}
                    </span>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-50 p-6">
                    <ShoppingBag size={32} className="text-slate-300 mb-2" />
                    <p className="text-center text-[10px] text-slate-500 font-medium">Belum ada aktivitas belanja.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FLOATING BOTTOM NAV (LINK SUDAH DIPERBAIKI) */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[90%] max-w-md z-40">
        <div className="bg-white/95 backdrop-blur-lg border border-slate-200/80 rounded-full shadow-xl shadow-slate-200/50 p-1.5 sm:p-2 px-5 sm:px-6 flex justify-between items-center">
          <Link href="/gerobak" className="flex flex-col items-center gap-1 text-amber-600 p-1.5 sm:p-2">
            <LayoutDashboard size={18} strokeWidth={2.5} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/absen" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 p-1.5 sm:p-2 transition-colors">
            <Camera size={18} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Absen</span>
          </Link>
          <Link href="/gerobak/penjualan" className="flex flex-col items-center gap-1 text-amber-600 p-1.5 sm:p-2 transform scale-110 -mt-3 sm:-mt-5">
             <div className="bg-amber-500 text-white p-3 sm:p-3.5 rounded-full shadow-lg shadow-amber-500/30 ring-4 ring-slate-50 transition-transform active:scale-95">
               <TrendingUp size={20} strokeWidth={3} />
             </div>
          </Link>
          <Link href="/stok" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 p-1.5 sm:p-2 transition-colors">
            <Box size={18} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Stok</span>
          </Link>
          <Link href="/gerobak/pengeluaran" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 p-1.5 sm:p-2 transition-colors">
            <Wallet size={18} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Belanja</span>
          </Link>
        </div>
      </div>

    </div>
  );
}