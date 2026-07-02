'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Target, Star, ShieldCheck, MapPin, Award, Clock, FileText, Fingerprint } from 'lucide-react';

export default function DashboardKru() {
  const router = useRouter();
  const [profilKru, setProfilKru] = useState<any>(null);
  const [dataStats, setDataStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Cek sesi login di localStorage
  useEffect(() => {
    const sesi = localStorage.getItem('kru_session');
    if (!sesi) {
      router.push('/kru/login');
    } else {
      const dataSesi = JSON.parse(sesi);
      setProfilKru(dataSesi);
      fetchDashboardData(dataSesi.nama, dataSesi.cabang);
    }
  }, []);

  const fetchDashboardData = async (nama: string, cabang: string) => {
    try {
      const res = await fetch(`/api/kru/dashboard?nama=${nama}&cabang=${cabang}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setDataStats(data);
    } catch (e) {
      console.error("Gagal menarik data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kru_session');
    router.push('/kru/login');
  };

  const formatIDR = (val: number) => `Rp ${new Intl.NumberFormat('id-ID').format(val || 0)}`;

  // Kalkulasi Progress Bonus Omset
  const omset = dataStats?.omsetBulanIni || 0;
  const target = dataStats?.targetOmset || 1;
  const persentase = Math.min(Math.round((omset / target) * 100), 100);
  const sisaTarget = target - omset > 0 ? target - omset : 0;
  
  // Tentukan Lencana Disiplin
  const poin = dataStats?.evaluasi?.poin || 100;
  let lencana = { label: 'Kru Teladan 🌟', color: 'text-amber-400', bg: 'bg-amber-400/10' };
  if (poin < 90 && poin >= 75) lencana = { label: 'Disiplin Baik 👍', color: 'text-blue-400', bg: 'bg-blue-400/10' };
  if (poin < 75) lencana = { label: 'Butuh Evaluasi ⚠️', color: 'text-rose-400', bg: 'bg-rose-400/10' };

  if (!profilKru) return null; // Cegah kedip sebelum redirect

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-24">
      
      {/* HEADER PROFIL */}
      <div className="bg-zinc-900 rounded-b-[2.5rem] pt-8 pb-10 px-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-2xl border border-indigo-400/50">
              {profilKru.nama.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Selamat Bekerja,</p>
              <h1 className="text-xl font-black text-white capitalize">{profilKru.nama}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin size={10} className="text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{profilKru.cabang}</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2.5 bg-white/10 text-zinc-300 rounded-full hover:bg-rose-500/20 hover:text-rose-400 transition-colors backdrop-blur-md">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 -mt-6 relative z-20 space-y-4">
        
        {/* KARTU TARGET BONUS OMSET */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-lg shadow-zinc-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Target size={16} /></div>
              <h2 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Target Bonus Cabang</h2>
            </div>
            {persentase >= 100 && <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-1 rounded-md animate-pulse">ACHIEVED! 🎉</span>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-2xl font-black text-zinc-900">{formatIDR(omset)}</span>
              <span className="text-[10px] font-bold text-zinc-400">dari {formatIDR(target)}</span>
            </div>
            
            {/* PROGRESS BAR */}
            <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/80">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${persentase}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
            
            <p className="text-[10px] font-semibold text-zinc-500 text-center pt-1">
              {sisaTarget > 0 
                ? `🚀 Semangat! Kurang ${formatIDR(sisaTarget)} lagi menuju cairnya bonus!` 
                : `🌟 Luar biasa! Target bonus bulan ini sudah tembus!`}
            </p>
          </div>
        </div>

        {/* KARTU SMART EVALUATION (RAPOR) */}
        <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Star size={100} /></div>
          
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck size={16} className="text-amber-400" />
              <h2 className="text-xs font-black uppercase tracking-widest">Skor Disiplin</h2>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${lencana.bg}`}>
              <span className={`text-[9px] font-black uppercase tracking-widest ${lencana.color}`}>{lencana.label}</span>
            </div>
          </div>

          <div className="flex items-end gap-3 mb-5 relative z-10">
            <span className="text-5xl font-black text-white">{loading ? '-' : poin}</span>
            <span className="text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">/ 100 Poin</span>
          </div>

          <div className="grid grid-cols-3 gap-2 relative z-10">
            <div className="bg-zinc-800/80 p-3 rounded-2xl border border-zinc-700/50">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Hadir</span>
              <span className="text-lg font-black text-white">{loading ? '-' : dataStats?.evaluasi?.hadir} <span className="text-[9px] text-zinc-500">Hari</span></span>
            </div>
            <div className="bg-zinc-800/80 p-3 rounded-2xl border border-zinc-700/50">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Telat</span>
              <span className="text-lg font-black text-rose-400">{loading ? '-' : dataStats?.evaluasi?.telat} <span className="text-[9px] text-zinc-500">Kali</span></span>
            </div>
            <div className="bg-zinc-800/80 p-3 rounded-2xl border border-zinc-700/50">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Izin/Sakit</span>
              <span className="text-lg font-black text-amber-400">{loading ? '-' : dataStats?.evaluasi?.izin} <span className="text-[9px] text-zinc-500">Kali</span></span>
            </div>
          </div>
        </div>

        {/* MENU AKSI KRU */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Fitur Absensi (Segera Hadir / Next Step) */}
          <button className="bg-indigo-50 border border-indigo-100 p-4 rounded-3xl flex flex-col justify-between hover:bg-indigo-100/60 transition-all shadow-sm group">
            <div className="p-3 bg-indigo-500 text-white rounded-2xl w-fit mb-4 shadow-md"><Fingerprint size={20} /></div>
            <div className="text-left">
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">Catat Kehadiran</p>
              <p className="text-sm font-black text-indigo-950">Absen Harian</p>
            </div>
          </button>

         {/* Fitur Slip Gaji */}
         <Link href="/kru/slip" className="bg-white border border-zinc-200/80 p-4 rounded-3xl flex flex-col justify-between hover:bg-zinc-50 transition-all shadow-sm group">
            <div className="p-3 bg-zinc-900 text-white rounded-2xl w-fit mb-4 shadow-md"><FileText size={20} /></div>
            <div className="text-left">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Download PDF</p>
              <p className="text-sm font-black text-zinc-800">Slip Gaji</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}