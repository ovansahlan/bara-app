'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Import ikon minimalis dari lucide-react
import { 
  Camera, Receipt, ShoppingBag, Package, 
  CreditCard, ShieldCheck, AlertCircle, LayoutDashboard,
  Clock, ArrowRight, User
} from 'lucide-react';

export default function DashboardSaaS() {
  const [waktu, setWaktu] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setWaktu(now.toLocaleString('id-ID', { 
        weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).replace(/,/g, ' •'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = { uangLaci: 850000, pettyCash: 125000, omsetTotal: 2450000, kasbonBerjalan: 450000, belanjaOwner: 1500000 };
  const stokMenipis = [
    { id: "B003", nama: "Susu SKM", sisa: 2, satuan: "Pouch" },
    { id: "B004", nama: "Creamer", sisa: 1, satuan: "Kg" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-28 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* SaaS Premium Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Workspace
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 mt-1">Kedai Kopi Bara</h1>
          </div>
          <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-200 text-zinc-500 shadow-sm">
            <User size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-6">
        
        {/* Real-time Status Alert */}
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-zinc-100/80 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-600">
          <Clock size={14} className="text-zinc-400" />
          <span>{waktu || 'Memuat sistem...'}</span>
          <span className="flex h-2 w-2 relative ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* Total Omset Broad Card */}
        <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-md border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Receipt size={80} />
          </div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Gross Revenue</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-3xl font-extrabold tracking-tight">Rp {stats.omsetTotal.toLocaleString('id-ID')}</h2>
          </div>
          <div className="mt-5 pt-4 border-t border-zinc-800 grid grid-cols-4 gap-1 text-center text-[11px] text-zinc-400 font-medium relative z-10">
            <div><span className="block text-white font-bold mb-0.5">850K</span>Tunai</div>
            <div><span className="block text-indigo-400 font-bold mb-0.5">1.1M</span>QRIS</div>
            <div><span className="block text-purple-400 font-bold mb-0.5">300K</span>EDC</div>
            <div><span className="block text-teal-400 font-bold mb-0.5">200K</span>Grab</div>
          </div>
        </div>

        {/* Quick Menu Hub */}
        <section>
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Menu Utama</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/absen" className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm flex items-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
              <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <Camera size={18} strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-zinc-700">Presensi</span>
            </Link>
            <Link href="/penjualan" className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm flex items-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
              <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <Receipt size={18} strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-zinc-700">Omset</span>
            </Link>
            <Link href="/pengeluaran" className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm flex items-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
              <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <ShoppingBag size={18} strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-zinc-700">Belanja</span>
            </Link>
            <Link href="/stok" className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm flex items-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
              <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <Package size={18} strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-zinc-700">Logistik</span>
            </Link>
          </div>
        </section>

        {/* Secondary Actions (List) */}
        <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <Link href="/kasbon" className="flex items-center justify-between p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                <CreditCard size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800">Kasbon Karyawan</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Total berjalan: Rp {stats.kasbonBerjalan.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
          </Link>
          
          <Link href="/owner/belanja" className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800">Akses Owner</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Input investasi & operasional besar</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-zinc-300 group-hover:text-indigo-600 transition-colors" />
          </Link>
        </section>

        {/* Critical Alerts */}
        <section>
          <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
            {/* Aksen garis merah di sebelah kiri kartu */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
            
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs mb-3">
              <AlertCircle size={16} strokeWidth={2.5} />
              Stok Menipis
            </div>
            <div className="space-y-2">
              {stokMenipis.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-zinc-50 border border-zinc-100 px-3 py-2 rounded-lg text-xs">
                  <span className="font-semibold text-zinc-700">{item.nama}</span>
                  <span className="text-rose-600 font-bold">
                    {item.sisa} {item.satuan}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* SaaS Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center px-6 py-3">
          <Link href="/" className="flex flex-col items-center text-indigo-600 gap-1">
            <LayoutDashboard size={20} strokeWidth={2.5} />
            <span className="text-[9px] font-bold">Home</span>
          </Link>
          <Link href="/penjualan" className="flex flex-col items-center text-zinc-400 hover:text-zinc-700 transition-colors gap-1">
            <Receipt size={20} strokeWidth={2} />
            <span className="text-[9px] font-medium">Kasir</span>
          </Link>
          <Link href="/absen" className="flex flex-col items-center text-zinc-400 hover:text-zinc-700 transition-colors gap-1">
            <Camera size={20} strokeWidth={2} />
            <span className="text-[9px] font-medium">Absen</span>
          </Link>
          <Link href="/stok" className="flex flex-col items-center text-zinc-400 hover:text-zinc-700 transition-colors gap-1">
            <Package size={20} strokeWidth={2} />
            <span className="text-[9px] font-medium">Stok</span>
          </Link>
          <Link href="/pengeluaran" className="flex flex-col items-center text-zinc-400 hover:text-zinc-700 transition-colors gap-1">
            <ShoppingBag size={20} strokeWidth={2} />
            <span className="text-[9px] font-medium">Belanja</span>
          </Link>
        </div>
      </div>

    </div>
  );
}