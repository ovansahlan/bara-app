'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LogOut, Fingerprint, FileDown, UserCircle2, 
  CheckCircle2, AlertTriangle, Coffee, FileText, Stethoscope, RefreshCw
} from 'lucide-react';

export default function DashboardKru() {
  const router = useRouter();
  const [profilKru, setProfilKru] = useState<any>(null);
  
  // State untuk menyimpan angka absen asli dari database
  const [rekapAbsen, setRekapAbsen] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Cek Sesi Login Kru
    const sesi = localStorage.getItem('kru_session');
    if (!sesi) {
      router.push('/kru/login');
      return;
    }
    
    const dataKru = JSON.parse(sesi);
    setProfilKru(dataKru);

    // 2. Tarik Data Rapor Absen Real-time dari API yang sama dengan Owner
    const fetchRekap = async () => {
      try {
        const res = await fetch(`/api/owner/rekap-absen?nama=${dataKru.nama}`);
        const data = await res.json();
        if (data.success) {
          setRekapAbsen(data.data);
        }
      } catch (error) {
        console.error("Gagal menarik rapor absen:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRekap();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('kru_session');
    router.push('/kru/login');
  };

  if (!profilKru) return null;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 pb-24 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* HEADER: KARTU IDENTITAS */}
      <div className="bg-zinc-800/80 border-b border-zinc-700/50 sticky top-0 z-20 backdrop-blur-md rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto px-6 py-6 flex items-start justify-between">
          <div className="flex gap-4 items-center">
            <div className="p-1 border-2 border-indigo-500/50 rounded-full">
              <div className="w-14 h-14 bg-zinc-700 rounded-full flex items-center justify-center text-indigo-400">
                <UserCircle2 size={32} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Selamat Bertugas,</p>
              <h1 className="text-xl font-black text-white uppercase mt-0.5">{profilKru.nama}</h1>
              <div className="inline-block mt-1 text-[9px] font-black px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded uppercase tracking-widest border border-indigo-500/20">
                {profilKru.cabang}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2.5 bg-zinc-900/50 text-zinc-500 rounded-full hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-8 space-y-6">
        
        {/* QUICK ACTIONS (TOMBOL MENU UTAMA) */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/absen" className="bg-indigo-600 hover:bg-indigo-500 p-5 rounded-3xl shadow-lg shadow-indigo-900/50 flex flex-col items-center justify-center gap-3 transition-transform active:scale-95">
            <div className="p-3 bg-white/20 rounded-2xl text-white backdrop-blur-sm"><Fingerprint size={28} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-50 text-center">Catat<br/>Kehadiran</span>
          </Link>
          
          <Link href="/kru/slip" className="bg-zinc-800 border border-zinc-700 hover:border-zinc-600 p-5 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all active:scale-95 group">
            <div className="p-3 bg-zinc-700 text-zinc-300 group-hover:text-emerald-400 rounded-2xl transition-colors"><FileDown size={28} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200 text-center">Cetak Slip<br/>Gaji PDF</span>
          </Link>
        </div>

        {/* RAPOR ABSENSI REAL-TIME */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Rapor Disiplin Bulan Ini</h2>
            {isLoading && <RefreshCw size={12} className="text-zinc-500 animate-spin" />}
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-3xl">
            {isLoading ? (
              <div className="h-40 flex items-center justify-center text-xs text-zinc-500 font-medium animate-pulse">
                Menyinkronkan data dengan pusat...
              </div>
            ) : rekapAbsen ? (
              <div className="space-y-3">
                {/* BARIS UTAMA: TEPAT WAKTU & TELAT */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
                    <div className="flex items-center gap-2 mb-2 text-emerald-500"><CheckCircle2 size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">Tepat Waktu</span></div>
                    <p className="text-2xl font-black text-zinc-100">{rekapAbsen.tepatWaktu} <span className="text-[10px] text-zinc-500 font-medium">Hari</span></p>
                  </div>
                  <div className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
                    <div className="flex items-center gap-2 mb-2 text-rose-500"><AlertTriangle size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider">Kesiangan</span></div>
                    <p className="text-2xl font-black text-zinc-100">{rekapAbsen.telat} <span className="text-[10px] text-zinc-500 font-medium">Hari</span></p>
                  </div>
                </div>

                {/* BARIS IZIN & SAKIT */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg"><FileText size={14} /></div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Izin Resmi</span>
                    </div>
                    <span className="text-sm font-black text-zinc-200">{rekapAbsen.izin}</span>
                  </div>
                  <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg"><Stethoscope size={14} /></div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sakit</span>
                    </div>
                    <span className="text-sm font-black text-zinc-200">{rekapAbsen.sakit}</span>
                  </div>
                </div>

                {/* INFO LIBUR & HARI KOSONG (TRANSPARANSI KRU) */}
                <div className={`mt-2 p-4 rounded-2xl border flex items-center justify-between ${rekapAbsen.hariKosong > 5 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${rekapAbsen.hariKosong > 5 ? 'text-rose-400' : 'text-zinc-400'}`}>
                      Hari Kosong / Jatah Libur
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-black text-zinc-200">{rekapAbsen.hariKosong} <span className="text-[10px] text-zinc-500 font-medium">Hari</span></p>
                      {rekapAbsen.hariKosong > 4 && (
                        <span className="text-[8px] bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Melebihi Jatah</span>
                      )}
                    </div>
                  </div>
                  <Coffee size={24} className={rekapAbsen.hariKosong > 5 ? 'text-rose-500/50' : 'text-zinc-600'} />
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-rose-400 py-4">Gagal memuat rekap presensi.</div>
            )}
          </div>
          
          <p className="text-center text-[9px] text-zinc-500 mt-4 px-4 leading-relaxed font-medium">
            Rapor ini dihitung otomatis oleh sistem berdasarkan jam kedatangan. Jika ada ketidaksesuaian, harap lapor ke Kepala Kedai.
          </p>
        </div>

      </div>
    </div>
  );
}