'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Camera, Wallet, TrendingUp, Box, Landmark, RefreshCw, CalendarDays } from 'lucide-react';

export default function HomeDashboard() {
  const [waktu, setWaktu] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [laporan, setLaporan] = useState({
    omsetHariIni: 0,
    pengeluaranHariIni: 0,
    kasbonHariIni: 0,
    absenHariIni: 0
  });

  const hariIniStr = new Date().toISOString().split('T')[0];

  // Jam Realtime
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setWaktu(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tarik Data API Dashboard
  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard?tanggal=${hariIniStr}`);
      const data = await res.json();
      if (res.ok) {
        setLaporan({
          omsetHariIni: data.omsetHariIni || 0,
          pengeluaranHariIni: data.pengeluaranHariIni || 0,
          kasbonHariIni: data.kasbonHariIni || 0,
          absenHariIni: data.absenHariIni || 0
        });
      }
    } catch (error) {
      console.error("Gagal menarik data dashboard", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [hariIniStr]);

  const formatRupiah = (angka: number) => {
    return angka.toLocaleString('id-ID');
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      
      {/* HEADER KONSISTEN DENGAN PAGE LAIN */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Store size={18} strokeWidth={2.5} />
            </div>
            <h1 className="text-sm font-black tracking-wide text-zinc-800 uppercase">Kedai Kopi Bara</h1>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
            <CalendarDays size={12} /> {waktu || "--:--"}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-5">
        
        {/* KARTU DASHBOARD RINGKASAN */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Ringkasan Hari Ini</span>
            <button onClick={fetchDashboard} disabled={isLoading} className="text-zinc-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase">
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Omset */}
            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl flex flex-col justify-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Omset</p>
              <p className="text-sm font-black text-emerald-600">Rp {formatRupiah(laporan.omsetHariIni)}</p>
            </div>
            
            {/* Pengeluaran */}
            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl flex flex-col justify-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Pengeluaran</p>
              <p className="text-sm font-black text-rose-600">Rp {formatRupiah(laporan.pengeluaranHariIni)}</p>
            </div>

            {/* Kasbon */}
            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl flex flex-col justify-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Kasbon</p>
              <p className="text-sm font-black text-amber-600">Rp {formatRupiah(laporan.kasbonHariIni)}</p>
            </div>

            {/* Absensi */}
            <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl flex flex-col justify-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Kru Hadir</p>
              <p className="text-sm font-black text-indigo-600">{laporan.absenHariIni} <span className="text-[10px] text-zinc-400">Orang</span></p>
            </div>
          </div>
        </div>

        {/* MENU NAVIGASI MODUL */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pl-1">Menu Operasional</span>
          
          <div className="grid grid-cols-2 gap-3">
            <Link href="/absen" className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-2 group">
              <div className="w-10 h-10 bg-zinc-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                <Camera size={18} />
              </div>
              <span className="text-[11px] font-bold text-zinc-700">Absen Selfie</span>
            </Link>

            <Link href="/penjualan" className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col items-center justify-center gap-2 group">
              <div className="w-10 h-10 bg-zinc-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-50 transition-all">
                <TrendingUp size={18} />
              </div>
              <span className="text-[11px] font-bold text-zinc-700">Setor Omset</span>
            </Link>

            <Link href="/pengeluaran" className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs hover:border-rose-300 transition-all flex flex-col items-center justify-center gap-2 group">
              <div className="w-10 h-10 bg-zinc-50 text-rose-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-50 transition-all">
                <Wallet size={18} />
              </div>
              <span className="text-[11px] font-bold text-zinc-700">Pengeluaran</span>
            </Link>

            <Link href="/stok" className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-2 group">
              <div className="w-10 h-10 bg-zinc-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                <Box size={18} />
              </div>
              <span className="text-[11px] font-bold text-zinc-700">Logistik Gudang</span>
            </Link>

            <Link href="/kasbon" className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs hover:border-amber-300 transition-all flex flex-col items-center justify-center gap-2 group col-span-2">
              <div className="w-10 h-10 bg-zinc-50 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-50 transition-all">
                <Landmark size={18} />
              </div>
              <span className="text-[11px] font-bold text-zinc-700">Catat Kasbon Kru</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}