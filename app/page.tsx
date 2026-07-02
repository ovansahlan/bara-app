'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, TrendingUp, Wallet, Box, 
  RefreshCw, Calendar, ArrowUpRight, ArrowDownRight, 
  CreditCard, Smartphone, Banknote, History, Camera, Landmark, Lock, KeyRound, X
} from 'lucide-react';

export default function HomeDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [tanggalPilih, setTanggalPilih] = useState<string>(new Date().toISOString().split('T')[0]);

  // State untuk Modal Login Owner
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

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID').format(val);

  const getNamaBulan = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Handler Login Portal Owner
  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '000000') {
      setShowAuthModal(false);
      router.push('/owner'); // Akan mengarahkan ke halaman /owner
    } else {
      setAuthError('Sandi tidak valid. Akses ditolak.');
      setTimeout(() => setAuthError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-32">
      
      {/* TOP HEADER */}
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
            {/* TOMBOL REFRESH */}
            <button onClick={() => fetchData(tanggalPilih)} className="p-2 bg-zinc-100 text-zinc-500 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            {/* TOMBOL PORTAL OWNER */}
            <button onClick={() => setShowAuthModal(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm">
              <Lock size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL LOGIN OWNER (Z-INDEX TINGGI) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-rose-500 rounded-full bg-zinc-50 hover:bg-rose-50 transition-colors">
              <X size={18} />
            </button>
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <KeyRound size={24} />
            </div>
            <h3 className="text-lg font-black text-zinc-800 mb-1">Akses Portal Owner</h3>
            <p className="text-xs text-zinc-500 mb-5">Silakan masukkan sandi keamanan Anda.</p>
            
            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div>
                <input 
                  type="password" 
                  autoFocus
                  placeholder="••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-center text-xl tracking-[0.5em] font-black outline-none focus:border-indigo-400 focus:bg-white transition-all"
                />
              </div>
              {authError && <p className="text-[10px] text-rose-500 font-bold text-center animate-pulse">{authError}</p>}
              <button type="submit" className="w-full py-3.5 bg-zinc-900 text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg shadow-zinc-900/20">
                Masuk ke Portal
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 mt-6 space-y-4">
        
        {/* HIGHLIGHT: SALDO LACI KASIR */}
        <div className="bg-zinc-900 text-white p-5 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4">
            <Landmark size={120} />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-white/10 text-zinc-300 rounded-lg"><Landmark size={12} /></div>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Estimasi Uang Fisik Laci</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Rp {data ? formatIDR(data.saldoLaciKasir) : '0'}
          </h2>
          <p className="text-[9px] text-zinc-400 font-bold uppercase mt-2 tracking-wider">
            Akumulasi (Tunai - Biaya - Kasbon) di {getNamaBulan(tanggalPilih)}
          </p>
        </div>

        {/* METRICS GRID (HARIAN) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={14} /></div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Omset Hari Ini</span>
            </div>
            <p className="text-base font-black text-zinc-800">Rp {data ? formatIDR(data.omset.total) : '0'}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Wallet size={14} /></div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Biaya Hari Ini</span>
            </div>
            <p className="text-base font-black text-zinc-800">Rp {data ? formatIDR(data.totalKeluar) : '0'}</p>
          </div>
        </div>

        {/* BREAKDOWN METODE PEMBAYARAN HARIAN */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rincian Pembayaran Masuk</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 text-zinc-500 rounded-xl"><Banknote size={16} /></div>
              <div><p className="text-[9px] font-bold text-zinc-400 uppercase">Tunai (Cash)</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.tunai) : '0'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 text-zinc-500 rounded-xl"><Smartphone size={16} /></div>
              <div><p className="text-[9px] font-bold text-zinc-400 uppercase">QRIS</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.qris) : '0'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 text-zinc-500 rounded-xl"><CreditCard size={16} /></div>
              <div><p className="text-[9px] font-bold text-zinc-400 uppercase">EDC / Trans</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.edc) : '0'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 text-zinc-500 rounded-xl"><ArrowUpRight size={16} /></div>
              <div><p className="text-[9px] font-bold text-zinc-400 uppercase">Grab / Online</p><p className="text-xs font-black">Rp {data ? formatIDR(data.omset.grab) : '0'}</p></div>
            </div>
          </div>
        </div>

        {/* LOGISTIK GUDANG TERBARU */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-1">
            <History size={14} className="text-zinc-400" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Logistik Gudang Terbaru</span>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-2.5 bg-emerald-50/50 border-b border-zinc-100 flex items-center gap-2">
              <ArrowDownRight size={14} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Barang Masuk Terakhir</span>
            </div>
            <div className="divide-y divide-zinc-50">
              {data?.historyStokIn && data.historyStokIn.length > 0 ? data.historyStokIn.map((row: any, i: number) => (
                <div key={i} className="p-3 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-700">{row[2]}</span>
                    <span className="text-[9px] text-zinc-400 font-medium">Oleh {row[6]} ({row[0]})</span>
                  </div>
                  <span className="text-[10px] font-black bg-zinc-100 px-2 py-1 rounded-lg">+{row[3]}</span>
                </div>
              )) : (
                <p className="p-4 text-center text-[10px] text-zinc-400 italic font-medium">Belum ada data masuk.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-2.5 bg-rose-50/50 border-b border-zinc-100 flex items-center gap-2">
              <ArrowUpRight size={14} className="text-rose-600" />
              <span className="text-[10px] font-bold text-rose-700 uppercase">Barang Keluar Terakhir</span>
            </div>
            <div className="divide-y divide-zinc-50">
              {data?.historyStokOut && data.historyStokOut.length > 0 ? data.historyStokOut.map((row: any, i: number) => (
                <div key={i} className="p-3 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-700">{row[2]}</span>
                    <span className="text-[9px] text-zinc-400 font-medium">Tujuan: {row[5]} ({row[0]})</span>
                  </div>
                  <span className="text-[10px] font-black bg-zinc-100 px-2 py-1 rounded-lg text-rose-500">-{row[3]}</span>
                </div>
              )) : (
                <p className="p-4 text-center text-[10px] text-zinc-400 italic font-medium">Belum ada data keluar.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* FLOATING FOOTER NAVIGATION */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
        <div className="bg-zinc-900/95 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-2 px-6 flex justify-between items-center">
          <Link href="/" className="flex flex-col items-center gap-1 text-indigo-400 p-2">
            <LayoutDashboard size={20} strokeWidth={2.5} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Home</span>
          </Link>
          <Link href="/absen" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white p-2 transition-all">
            <Camera size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Absen</span>
          </Link>
          <Link href="/penjualan" className="flex flex-col items-center gap-1 text-emerald-500 p-2 transform scale-110 -mt-2">
             <div className="bg-emerald-500 text-white p-3 rounded-full shadow-lg shadow-emerald-500/20 ring-4 ring-zinc-900">
               <TrendingUp size={20} strokeWidth={3} />
             </div>
          </Link>
          <Link href="/stok" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white p-2 transition-all">
            <Box size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Stok</span>
          </Link>
          <Link href="/pengeluaran" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white p-2 transition-all">
            <Wallet size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter">Biaya</span>
          </Link>
        </div>
      </div>

    </div>
  );
}