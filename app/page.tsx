'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, TrendingUp, Wallet, Box, 
  RefreshCw, Calendar, ArrowUpRight, ArrowDownRight, 
  CreditCard, Smartphone, Banknote, History, Camera, Landmark, Lock, KeyRound, X, Layers, MessageCircle, Store, BookOpen
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-32 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* HEADER STICKY */}
      <div className="bg-white/90 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-30">
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
          <div className="flex gap-2.5">
            <button onClick={() => fetchData(tanggalPilih)} className="p-2.5 bg-zinc-100 text-zinc-500 rounded-full hover:bg-zinc-200 transition-all active:scale-95">
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowAuthModal(true)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-all active:scale-95">
              <Lock size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL LOGIN OWNER */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-rose-500 rounded-full bg-zinc-50 transition-colors">
              <X size={18} />
            </button>
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-5 border border-indigo-100">
              <KeyRound size={26} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-zinc-800 mb-1 tracking-tight">Portal Owner</h3>
            <p className="text-xs font-medium text-zinc-500 mb-5">Masukkan sandi untuk mengakses finansial.</p>
            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder="••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl text-center text-xl tracking-[0.5em] font-black outline-none focus:border-indigo-400 focus:bg-white transition-all"
                autoFocus
              />
              {authError && <p className="text-[10px] text-rose-500 font-bold text-center">{authError}</p>}
              <button type="submit" className="w-full py-4 bg-zinc-900 text-white font-black text-sm tracking-wide rounded-2xl shadow-lg hover:bg-zinc-800 transition-all active:scale-95">
                AUTENTIKASI MASUK
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BANNER NAVIGASI GEROBAK */}
      <div className="max-w-md mx-auto px-5 mt-5">
        <Link href="/gerobak" className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-3xl flex items-center justify-between text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-amber-100 uppercase tracking-widest mb-0.5">Akses Kru Cabang</p>
              <p className="text-sm font-black tracking-wide">Buka Portal Gerobak</p>
            </div>
          </div>
          <div className="p-2 bg-white/10 rounded-full">
            <ArrowUpRight size={18} className="text-amber-50" />
          </div>
        </Link>
      </div>
{/* --- TAMBAHKAN KODE INI TEPAT DI BAWAH BANNER GEROBAK --- */}
      {/* BANNER NAVIGASI PORTAL KRU (HANDBOOK) */}
      <div className="max-w-md mx-auto px-5 mt-3">
        <Link href="/kru/login" className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4 rounded-3xl flex items-center justify-between text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-indigo-100 uppercase tracking-widest mb-0.5">Mini-HRIS & Slip Gaji</p>
              <p className="text-sm font-black tracking-wide">Buka Handbook Kru</p>
            </div>
          </div>
          <div className="p-2 bg-white/10 rounded-full flex shrink-0">
            <ArrowUpRight size={18} className="text-indigo-50" />
          </div>
        </Link>
      </div>
      {/* ------------------------------------------------------- */}
      <div className="max-w-md mx-auto px-5 mt-5 space-y-5">
        
        {/* ESTIMASI KAS LACI KASIR */}
        <div className="bg-zinc-900 text-white p-6 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-white/10 text-zinc-300 rounded-lg"><Landmark size={14} /></div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Estimasi Uang Laci</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            Rp {data ? formatIDR(data.saldoLaciKasir) : '0'}
          </h2>
          <p className="text-[10px] text-zinc-400 font-medium mt-2 bg-white/5 w-fit px-2 py-1 rounded-md">
            Akumulasi Kas Net Bulan {getNamaBulan(tanggalPilih)}
          </p>
        </div>

        {/* METRICS GRID HARIAN */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Omset Hari Ini</span>
            <p className="text-lg font-black text-zinc-800">Rp {data ? formatIDR(data.omset.total) : '0'}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Pengeluaran Laci</span>
            <p className="text-lg font-black text-rose-600">Rp {data ? formatIDR(data.totalKeluar) : '0'}</p>
          </div>
        </div>

        {/* ACTION BUTTONS (2x2 GRID COMPACT) */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/aset-gudang" className="bg-indigo-50 border border-indigo-100/80 p-4 rounded-3xl flex flex-col justify-between hover:bg-indigo-100/60 transition-all shadow-sm group relative">
            <div className="p-2.5 bg-indigo-500 text-white rounded-xl w-fit mb-3 shadow-md"><Layers size={16} /></div>
            <div>
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">Gudang</p>
              <p className="text-sm font-black text-indigo-950 truncate">Rp {data ? formatIDR(data.nilaiAsetGudang) : '0'}</p>
            </div>
          </Link>

          <Link href="/kasbon" className="bg-amber-50 border border-amber-100/80 p-4 rounded-3xl flex flex-col justify-between hover:bg-amber-100/60 transition-all shadow-sm group relative">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl w-fit mb-3 shadow-md"><Landmark size={16} /></div>
            <div>
              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">Administrasi</p>
              <p className="text-sm font-black text-amber-950 truncate">Catat Kasbon</p>
            </div>
          </Link>

          <Link href="/report" className="bg-emerald-50 border border-emerald-100/80 p-4 rounded-3xl flex flex-col justify-between hover:bg-emerald-100/60 transition-all shadow-sm group relative">
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl w-fit mb-3 shadow-md"><MessageCircle size={16} /></div>
            <div>
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Closing</p>
              <p className="text-sm font-black text-emerald-950">Laporan WA</p>
            </div>
          </Link>

          <Link href="/revisi" className="bg-rose-50 border border-rose-100/80 p-4 rounded-3xl flex flex-col justify-between hover:bg-rose-100/60 transition-all shadow-sm group relative">
            <div className="p-2.5 bg-rose-500 text-white rounded-xl w-fit mb-3 shadow-md"><History size={16} /></div>
            <div>
              <p className="text-[9px] font-bold text-rose-600 uppercase tracking-widest mb-0.5">Koreksi Typo</p>
              <p className="text-sm font-black text-rose-950">Revisi Data</p>
            </div>
          </Link>
        </div>

        {/* BREAKDOWN METODE PEMBAYARAN */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
            <Wallet size={14} className="text-zinc-400" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rincian Pembayaran</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-y-5 gap-x-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><Banknote size={16} /></div>
              <div><p className="text-[9px] font-bold text-zinc-400 uppercase">Tunai</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.tunai) : '0'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><Smartphone size={16} /></div>
              <div><p className="text-[9px] font-bold text-zinc-400 uppercase">QRIS</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.qris) : '0'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><CreditCard size={16} /></div>
              <div><p className="text-[9px] font-bold text-zinc-400 uppercase">EDC/Bank</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.edc) : '0'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500"><ArrowUpRight size={16} /></div>
              <div><p className="text-[9px] font-bold text-zinc-400 uppercase">Grab Online</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.grab) : '0'}</p></div>
            </div>
          </div>
        </div>

        {/* LOGISTIK GUDANG TERBARU */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-1.5 px-2 text-zinc-400">
            <History size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Aktivitas Gudang</span>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="p-3.5 bg-emerald-50/50 border-b border-zinc-100 flex items-center gap-2">
              <ArrowDownRight size={14} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Barang Masuk (In)</span>
            </div>
            <div className="divide-y divide-zinc-50 text-xs">
              {data?.historyStokIn && data.historyStokIn.length > 0 ? data.historyStokIn.map((row: any, i: number) => (
                <div key={i} className="p-3.5 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-zinc-800">{row[2]}</span>
                    <span className="text-[9px] font-medium text-zinc-400">Oleh {row[6]} • {row[0]}</span>
                  </div>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg">+{row[3]}</span>
                </div>
              )) : (
                <p className="p-4 text-center text-[10px] text-zinc-400 italic">Belum ada data masuk.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="p-3.5 bg-rose-50/50 border-b border-zinc-100 flex items-center gap-2">
              <ArrowUpRight size={14} className="text-rose-600" />
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Barang Keluar (Out)</span>
            </div>
            <div className="divide-y divide-zinc-50 text-xs">
              {data?.historyStokOut && data.historyStokOut.length > 0 ? data.historyStokOut.map((row: any, i: number) => (
                <div key={i} className="p-3.5 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-zinc-800">{row[2]}</span>
                    <span className="text-[9px] font-medium text-zinc-400">Tujuan: {row[8] || row[4]} • {row[0]}</span>
                  </div>
                  <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg">-{row[3]}</span>
                </div>
              )) : (
                <p className="p-4 text-center text-[10px] text-zinc-400 italic">Belum ada data keluar.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* FLOATING BOTTOM NAV */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
        <div className="bg-zinc-900/95 backdrop-blur-lg border border-zinc-700/50 rounded-[2rem] shadow-2xl p-2 px-6 flex justify-between items-center">
          <Link href="/" className="flex flex-col items-center gap-1.5 text-indigo-400 p-2">
            <LayoutDashboard size={20} strokeWidth={2.5} />
            <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/absen" className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white p-2 transition-colors">
            <Camera size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Absen</span>
          </Link>
          <Link href="/penjualan" className="flex flex-col items-center gap-1 text-emerald-500 p-2 transform scale-110 -mt-3">
             <div className="bg-emerald-500 text-white p-3.5 rounded-full shadow-lg shadow-emerald-500/30 ring-4 ring-zinc-900 transition-transform active:scale-95">
               <TrendingUp size={22} strokeWidth={3} />
             </div>
          </Link>
          <Link href="/stok" className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white p-2 transition-colors">
            <Box size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Stok</span>
          </Link>
          <Link href="/pengeluaran" className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-white p-2 transition-colors">
            <Wallet size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Biaya</span>
          </Link>
        </div>
      </div>

    </div>
  );
}