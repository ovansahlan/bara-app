'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, TrendingUp, Wallet, Box, 
  RefreshCw, Calendar, ArrowUpRight, ArrowDownRight, 
  CreditCard, Smartphone, Banknote, History, Camera, Landmark, Lock, KeyRound, X, Layers,MessageCircle
} from 'lucide-react';

export default function HomeDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [tanggalPilih, setTanggalPilih] = useState<string>(new Date().toISOString().split('T')[0]);

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

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

  const getNamaBulan = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '000000') {
      setShowAuthModal(false);
      router.push('/owner'); 
    } else {
      setAuthError('Sandi tidak valid.');
      setTimeout(() => setAuthError(''), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-32">
      
      {/* HEADER */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-black tracking-tight text-zinc-800 uppercase">Kedai Kopi Bara</h1>
            <div className="flex items-center gap-1.5 mt-1 text-zinc-500">
              <Calendar size={12} />
              <input 
                type="date" 
                value={tanggalPilih}
                onChange={(e) => setTanggalPilih(e.target.value)}
                className="text-[10px] font-bold uppercase tracking-widest bg-transparent outline-none cursor-pointer hover:text-indigo-600 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchData(tanggalPilih)} className="p-2 bg-zinc-100 text-zinc-500 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowAuthModal(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-all">
              <Lock size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* LOCK MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-rose-500 rounded-full bg-zinc-50 transition-colors">
              <X size={18} />
            </button>
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound size={24} />
            </div>
            <h3 className="text-lg font-black text-zinc-800 mb-1">Portal Owner</h3>
            <form onSubmit={handleOwnerLogin} className="space-y-4 mt-4">
              <input 
                type="password" 
                placeholder="••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-center text-xl tracking-[0.5em] font-black outline-none focus:border-indigo-400 focus:bg-white transition-all"
              />
              {authError && <p className="text-[10px] text-rose-500 font-bold text-center">{authError}</p>}
              <button type="submit" className="w-full py-3.5 bg-zinc-900 text-white font-bold rounded-xl shadow-lg">Masuk</button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 mt-6 space-y-4">
        
        {/* ESTIMASI KAS LACI KASIR */}
        <div className="bg-zinc-900 text-white p-5 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-white/10 text-zinc-300 rounded-lg"><Landmark size={12} /></div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Estimasi Uang Fisik Laci</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Rp {data ? formatIDR(data.saldoLaciKasir) : '0'}
          </h2>
          <p className="text-[9px] text-zinc-400 font-bold uppercase mt-2 tracking-wider">
            Akumulasi Kas Net Bulan {getNamaBulan(tanggalPilih)}
          </p>
        </div>
        

        {/* METRICS GRID HARIAN */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Omset Hari Ini</span>
            <p className="text-base font-black text-zinc-800">Rp {data ? formatIDR(data.omset.total) : '0'}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Total Pengeluaran Hari Ini</span>
            <p className="text-base font-black text-zinc-800">Rp {data ? formatIDR(data.totalKeluar) : '0'}</p>
          </div>
        </div>

        {/* DOUBLE BUTTON: ASET GUDANG & KASBON (CLEAN UI) */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/aset-gudang" className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col justify-between hover:bg-indigo-100/60 transition-all shadow-2xs group relative overflow-hidden">
            <ArrowUpRight size={16} className="absolute top-3 right-3 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs w-fit mb-3"><Layers size={14} /></div>
            <div>
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Nilai Aset Gudang</p>
              <p className="text-sm font-black text-indigo-950 truncate">Rp {data ? formatIDR(data.nilaiAsetGudang) : '0'}</p>
            </div>
          </Link>

          <Link href="/kasbon" className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex flex-col justify-between hover:bg-amber-100/60 transition-all shadow-2xs group relative overflow-hidden">
            <ArrowUpRight size={16} className="absolute top-3 right-3 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs w-fit mb-3"><Landmark size={14} /></div>
            <div>
              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Administrasi Kru</p>
              <p className="text-sm font-black text-amber-950 truncate">Catat Kasbon</p>
            </div>
          </Link>
        </div>

        {/* BREAKDOWN METODE PEMBAYARAN HARIAN */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mt-2">
          <div className="p-3 border-b border-zinc-100 bg-zinc-50/50">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rincian Pembayaran Masuk</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Banknote size={14} className="text-zinc-400" />
              <div><p className="text-[8px] font-bold text-zinc-400 uppercase">Tunai</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.tunai) : '0'}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone size={14} className="text-zinc-400" />
              <div><p className="text-[8px] font-bold text-zinc-400 uppercase">QRIS</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.qris) : '0'}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-zinc-400" />
              <div><p className="text-[8px] font-bold text-zinc-400 uppercase">EDC/Bank</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.edc) : '0'}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpRight size={14} className="text-zinc-400" />
              <div><p className="text-[8px] font-bold text-zinc-400 uppercase">Grab Online</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.grab) : '0'}</p></div>
            </div>
          </div>
        </div>

       {/* ACTION BUTTONS: LAPORAN WA & REVISI */}
       <div className="grid grid-cols-2 gap-3">
          <Link href="/report" className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between hover:bg-emerald-100/60 transition-all shadow-2xs group relative overflow-hidden">
            <ArrowUpRight size={16} className="absolute top-3 right-3 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs w-fit mb-3"><MessageCircle size={14} /></div>
            <div>
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Closing Shift</p>
              <p className="text-sm font-black text-emerald-950">Laporan WA</p>
            </div>
          </Link>

          <Link href="/revisi" className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col justify-between hover:bg-rose-100/60 transition-all shadow-2xs group relative overflow-hidden">
            <ArrowUpRight size={16} className="absolute top-3 right-3 text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div className="p-2 bg-rose-500 text-white rounded-xl shadow-xs w-fit mb-3"><History size={14} /></div>
            <div>
              <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Koreksi Typo</p>
              <p className="text-sm font-black text-rose-950">Revisi Data</p>
            </div>
          </Link>
        </div>

        {/* LOGISTIK GUDANG TERBARU */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-1.5 px-1 text-zinc-400">
            <History size={13} />
            <span className="text-[10px] font-black uppercase tracking-widest">Logistik Gudang Terbaru</span>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-2 bg-emerald-50/50 border-b border-zinc-100 flex items-center gap-2">
              <ArrowDownRight size={12} className="text-emerald-600" />
              <span className="text-[9px] font-bold text-emerald-700 uppercase">Barang Masuk (Stock-In)</span>
            </div>
            <div className="divide-y divide-zinc-50 text-xs">
              {data?.historyStokIn && data.historyStokIn.length > 0 ? data.historyStokIn.map((row: any, i: number) => (
                <div key={i} className="p-2.5 flex justify-between items-center bg-white">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-700">{row[2]}</span>
                    <span className="text-[9px] text-zinc-400">Oleh {row[6]} ({row[0]})</span>
                  </div>
                  <span className="text-[10px] font-black bg-zinc-100 px-2 py-0.5 rounded-md">+{row[3]}</span>
                </div>
              )) : (
                <p className="p-3 text-center text-[10px] text-zinc-400 italic">Belum ada data masuk.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-2 bg-rose-50/50 border-b border-zinc-100 flex items-center gap-2">
              <ArrowUpRight size={12} className="text-rose-600" />
              <span className="text-[9px] font-bold text-rose-700 uppercase">Barang Keluar (Stock-Out)</span>
            </div>
            <div className="divide-y divide-zinc-50 text-xs">
              {data?.historyStokOut && data.historyStokOut.length > 0 ? data.historyStokOut.map((row: any, i: number) => (
                <div key={i} className="p-2.5 flex justify-between items-center bg-white">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-700">{row[2]}</span>
                    <span className="text-[9px] text-zinc-400">Tujuan: {row[8] || row[4]} ({row[0]})</span>
                  </div>
                  <span className="text-[10px] font-black bg-zinc-100 px-2 py-0.5 rounded-md text-rose-500">-{row[3]}</span>
                </div>
              )) : (
                <p className="p-3 text-center text-[10px] text-zinc-400 italic">Belum ada data keluar.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER (FLOATING BOTTOM NAV) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
        <div className="bg-zinc-900/95 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-2 px-6 flex justify-between items-center">
          <Link href="/" className="flex flex-col items-center gap-1 text-indigo-400 p-2">
            <LayoutDashboard size={20} strokeWidth={2.5} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Home</span>
          </Link>
          <Link href="/absen" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white p-2 transition-colors">
            <Camera size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Absen</span>
          </Link>
          <Link href="/penjualan" className="flex flex-col items-center gap-1 text-emerald-500 p-2 transform scale-110 -mt-2">
             <div className="bg-emerald-500 text-white p-3 rounded-full shadow-lg ring-4 ring-zinc-900 transition-transform active:scale-95">
               <TrendingUp size={20} strokeWidth={3} />
             </div>
          </Link>
          <Link href="/stok" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white p-2 transition-colors">
            <Box size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Stok</span>
          </Link>
          <Link href="/pengeluaran" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white p-2 transition-colors">
            <Wallet size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Belanja</span>
          </Link>
        </div>
      </div>

    </div>
  );
}