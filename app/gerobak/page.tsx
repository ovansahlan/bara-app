'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, TrendingUp, Wallet, Store, ArrowUpRight } from 'lucide-react';

export default function PortalGerobak() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* HEADER GEROBAK */}
      <div className="bg-amber-500 border-b border-amber-600 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-amber-400/50 text-amber-950 rounded-full hover:bg-amber-400 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black text-amber-950 uppercase flex items-center gap-1.5">
            <Store size={16} /> Portal Gerobak
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-8 space-y-6">
        
        <div className="text-center space-y-1 mb-8">
          <h2 className="text-2xl font-black text-zinc-800 tracking-tight">Halo, Kru Gerobak! 👋</h2>
          <p className="text-xs font-medium text-zinc-500">Silakan pilih menu pencatatan di bawah ini.</p>
        </div>

        {/* MENU 1: INPUT OMSET */}
        <Link href="/gerobak/penjualan" className="bg-white border-2 border-emerald-100 p-5 rounded-3xl flex items-center gap-4 hover:border-emerald-400 hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-md z-10">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div className="z-10">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Setor Data Pemasukan</p>
            <p className="text-lg font-black text-zinc-800">Catat Omset</p>
          </div>
          <ArrowUpRight size={20} className="absolute right-5 text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform z-10" />
        </Link>

        {/* MENU 2: INPUT PENGELUARAN */}
        <Link href="/gerobak/pengeluaran" className="bg-white border-2 border-rose-100 p-5 rounded-3xl flex items-center gap-4 hover:border-rose-400 hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={80} />
          </div>
          <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-md z-10">
            <Wallet size={24} strokeWidth={2.5} />
          </div>
          <div className="z-10">
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Catat Uang Keluar Laci</p>
            <p className="text-lg font-black text-zinc-800">Catat Biaya</p>
          </div>
          <ArrowUpRight size={20} className="absolute right-5 text-rose-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform z-10" />
        </Link>

      </div>
    </div>
  );
}