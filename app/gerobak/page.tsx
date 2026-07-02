'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, TrendingUp, Wallet, Store, ArrowUpRight, Landmark, RefreshCw } from 'lucide-react';

export default function PortalGerobak() {
  const [omsetBulanan, setOmsetBulanan] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  const tanggalHariIni = new Date().toISOString().split('T')[0];
  const namaBulan = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const fetchDashboardGerobak = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gerobak?tanggal=${tanggalHariIni}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setOmsetBulanan(data.omsetBulanan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardGerobak();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-24">
      {/* HEADER */}
      <div className="bg-amber-500 border-b border-amber-600 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2.5 bg-amber-400/50 text-amber-950 rounded-full hover:bg-amber-400 transition-colors active:scale-95">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black text-amber-950 uppercase flex items-center gap-1.5 tracking-wider">
            <Store size={16} /> Portal Gerobak
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-6 space-y-6">
        
        {/* WELCOME & OMSET CARD */}
        <div className="bg-zinc-900 text-white p-6 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h2 className="text-xl font-black text-zinc-100 tracking-tight">Kru Gerobak 👋</h2>
              <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mt-1">Semangat Shift Hari Ini</p>
            </div>
            <button onClick={fetchDashboardGerobak} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <RefreshCw size={14} className={`text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-700/50 relative z-10">
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Omset Bulan {namaBulan}</p>
            <h2 className="text-3xl font-black tracking-tight text-amber-400">
              Rp {loading ? '...' : omsetBulanan.toLocaleString('id-ID')}
            </h2>
          </div>
        </div>

        {/* MENU GRID */}
        <div className="space-y-3 pt-2">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2">Menu Pencatatan</p>

          <Link href="/gerobak/penjualan" className="bg-white border-2 border-emerald-50 p-4 rounded-3xl flex items-center gap-4 hover:border-emerald-200 shadow-sm transition-all group relative overflow-hidden">
            <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            <div className="z-10 flex-1">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Pemasukan</p>
              <p className="text-base font-black text-zinc-800">Catat Omset Shift</p>
            </div>
            <ArrowUpRight size={18} className="text-zinc-300 group-hover:text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>

          <Link href="/gerobak/pengeluaran" className="bg-white border-2 border-rose-50 p-4 rounded-3xl flex items-center gap-4 hover:border-rose-200 shadow-sm transition-all group relative overflow-hidden">
            <div className="p-3.5 bg-rose-50 text-rose-500 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <Wallet size={24} strokeWidth={2.5} />
            </div>
            <div className="z-10 flex-1">
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-0.5">Uang Keluar Laci</p>
              <p className="text-base font-black text-zinc-800">Catat Biaya Belanja</p>
            </div>
            <ArrowUpRight size={18} className="text-zinc-300 group-hover:text-rose-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>

          <Link href="/gerobak/kasbon" className="bg-white border-2 border-amber-50 p-4 rounded-3xl flex items-center gap-4 hover:border-amber-200 shadow-sm transition-all group relative overflow-hidden">
            <div className="p-3.5 bg-amber-50 text-amber-500 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Landmark size={24} strokeWidth={2.5} />
            </div>
            <div className="z-10 flex-1">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-0.5">Administrasi Kru</p>
              <p className="text-base font-black text-zinc-800">Tarik Uang Kasbon</p>
            </div>
            <ArrowUpRight size={18} className="text-zinc-300 group-hover:text-amber-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>

        </div>
      </div>
    </div>
  );
}