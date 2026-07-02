'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  RefreshCw, Calendar, TrendingUp, Wallet, PlusCircle, Landmark, 
  PackageMinus, ShieldCheck, LogOut, Boxes,Award
} from 'lucide-react';

export default function DashboardOwner() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [bulanPilih, setBulanPilih] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewCabang, setViewCabang] = useState<'gabungan' | 'kedai' | 'gerobak'>('gabungan');

  const fetchDataOwner = async (tanggalStr: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/owner?tanggal=${tanggalStr}`, { cache: 'no-store' });
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (error) {
      console.error("Gagal menarik data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataOwner(bulanPilih);
  }, [bulanPilih]);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID').format(val || 0);
  const getLabelBulan = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* HEADER */}
      <div className="bg-white/90 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 text-white rounded-xl shadow-md border border-zinc-800">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-widest text-zinc-800 uppercase">Owner Console</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Kedai Kopi Bara</p>
            </div>
          </div>
          <button onClick={() => router.push('/')} className="p-2.5 bg-zinc-100 text-zinc-500 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors shadow-sm active:scale-95">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-6 space-y-5">
        
        {/* SELECTOR BULAN & REFRESH */}
        <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-600">
            <Calendar size={16} className="text-indigo-500" />
            <input type="date" value={bulanPilih} onChange={(e) => setBulanPilih(e.target.value)} className="text-xs font-black uppercase tracking-wider bg-transparent outline-none cursor-pointer text-zinc-800" />
          </div>
          <button onClick={() => fetchDataOwner(bulanPilih)} className="p-2 bg-zinc-50 border border-zinc-200 rounded-full text-zinc-500 hover:text-zinc-900 transition-all active:scale-95 shadow-sm">
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-indigo-500' : ''} />
          </button>
        </div>

        {/* IOS-STYLE SEGMENTED CONTROL */}
        <div className="bg-zinc-200/60 p-1.5 rounded-2xl grid grid-cols-3 gap-1 text-center font-black text-[10px] uppercase tracking-widest shadow-inner">
          <button onClick={() => setViewCabang('gabungan')} className={`py-2.5 rounded-xl transition-all duration-300 ${viewCabang === 'gabungan' ? 'bg-white text-zinc-900 shadow-sm scale-100' : 'text-zinc-500 hover:text-zinc-800 scale-95'}`}>Gabungan</button>
          <button onClick={() => setViewCabang('kedai')} className={`py-2.5 rounded-xl transition-all duration-300 ${viewCabang === 'kedai' ? 'bg-white text-indigo-600 shadow-sm scale-100' : 'text-zinc-500 hover:text-zinc-800 scale-95'}`}>Kedai</button>
          <button onClick={() => setViewCabang('gerobak')} className={`py-2.5 rounded-xl transition-all duration-300 ${viewCabang === 'gerobak' ? 'bg-white text-amber-600 shadow-sm scale-100' : 'text-zinc-500 hover:text-zinc-800 scale-95'}`}>Gerobak</button>
        </div>

        {/* UTAMA CARD: NET PROFIT */}
        <div className="bg-zinc-900 text-white p-6 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
          
          {viewCabang === 'gabungan' && (
            <div className="animate-in fade-in duration-300 relative z-10">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Laba Bersih Gabungan</p>
              <h2 className="text-3xl font-black tracking-tight text-emerald-400">Rp {data ? formatIDR(data.totalLabaGabungan) : '0'}</h2>
            </div>
          )}
          {viewCabang === 'kedai' && (
            <div className="animate-in fade-in duration-300 relative z-10">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Laba Bersih Kedai Utama</p>
              <h2 className="text-3xl font-black tracking-tight text-indigo-400">Rp {data ? formatIDR(data.kedai.labaBersih) : '0'}</h2>
            </div>
          )}
          {viewCabang === 'gerobak' && (
            <div className="animate-in fade-in duration-300 relative z-10">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Laba Bersih Cabang Gerobak</p>
              <h2 className="text-3xl font-black tracking-tight text-amber-400">Rp {data ? formatIDR(data.gerobak.labaBersih) : '0'}</h2>
            </div>
          )}
          
          <div className="mt-5 pt-3 border-t border-zinc-700/50 flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase tracking-wider relative z-10">
            <span>Bulan: {getLabelBulan(bulanPilih)}</span>
            <span>Gross - Kru - Owner - HPP</span>
          </div>
        </div>
{/* --- TAMBAHKAN KODE INI DI BAWAHNYA --- */}
      {/* KHUSUS POV OWNER (KONSOL EVALUASI) */}
      <div className="max-w-md mx-auto px-5 mt-8 pt-5 border-t border-zinc-200">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2.5">Owner Panel Only</p>
        <Link href="/owner/evaluasi" className="bg-slate-800 p-4 rounded-3xl flex items-center justify-between text-slate-100 shadow-lg hover:bg-slate-850 active:scale-95 transition-all border border-slate-700">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-slate-700 text-indigo-400 rounded-2xl shadow-inner">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Input Insentif & Overtime</p>
              <p className="text-sm font-black tracking-wide">Evaluasi Kinerja Tim</p>
            </div>
          </div>
          <div className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-xl">
            Buka
          </div>
        </Link>
      </div>

      <Link 
  href="/owner/slip" 
  className="bg-slate-800/60 p-5 rounded-3xl border border-slate-700/50 hover:border-emerald-500 hover:bg-slate-800 transition-all flex flex-col justify-between min-h-[140px] group shadow-lg"
>
  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit shadow-inner">
    <FileDown size={22} className="group-hover:scale-110 transition-transform" />
  </div>
  <div>
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">HRD Panel</p>
    <h3 className="text-sm font-black text-slate-200 group-hover:text-emerald-400 transition-colors">
      Cetak Semua Slip Gaji
    </h3>
  </div>
</Link>
      {/* ------------------------------------------------------- */}
        {/* TOMBOL LINK INPUT BELANJA OWNER */}
        <Link href="/owner/belanja" className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-5 rounded-3xl flex justify-between items-center hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-sm"><Wallet size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">Kelola Arus Kas</p>
              <p className="text-sm font-black text-amber-950">Catat Belanja Owner</p>
            </div>
          </div>
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
            <PlusCircle size={18} className="text-amber-500" />
          </div>
        </Link>

        {/* ================= VIEW LAPORAN GABUNGAN (TOTAL) ================= */}
        {viewCabang === 'gabungan' && data && (
          <div className="space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Gross Omset Kedai</p>
                <p className="text-base font-black text-zinc-800">Rp {formatIDR(data.kedai.omset)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Gross Omset Gerobak</p>
                <p className="text-base font-black text-zinc-800">Rp {formatIDR(data.gerobak.omset)}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex justify-between items-center bg-zinc-50/50">
              <div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Total Biaya Kedai</p>
                <p className="text-xs font-black text-rose-600">Rp {formatIDR(data.kedai.pengeluaranKru + data.kedai.belanjaOwner)}</p>
                <span className="text-[8px] text-zinc-400 font-medium block mt-0.5">(Kru + Owner)</span>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Total Biaya Gerobak</p>
                <p className="text-xs font-black text-rose-600">Rp {formatIDR(data.gerobak.pengeluaranKru + data.gerobak.belanjaOwner)}</p>
                <span className="text-[8px] text-zinc-400 font-medium block mt-0.5">(Kru + Owner)</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total HPP Kedai</p>
                <p className="text-xs font-black text-slate-700">Rp {formatIDR(data.kedai.totalNilaiPemakaian)}</p>
              </div>
              <div className="w-px h-8 bg-slate-200 mx-2"></div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total HPP Gerobak</p>
                <p className="text-xs font-black text-slate-700">Rp {formatIDR(data.gerobak.totalNilaiPemakaian)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50/30 p-5 rounded-3xl border border-indigo-100 shadow-sm text-center">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Net Kedai</span>
                <p className="text-base font-black text-indigo-600">Rp {formatIDR(data.kedai.labaBersih)}</p>
              </div>
              <div className="bg-amber-50/30 p-5 rounded-3xl border border-amber-100 shadow-sm text-center">
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block mb-1">Net Gerobak</span>
                <p className="text-base font-black text-amber-600">Rp {formatIDR(data.gerobak.labaBersih)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW LAPORAN KEDAI UTAMA ================= */}
        {viewCabang === 'kedai' && data && (
          <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">Gross Omset Kedai</span>
                <div className="flex items-center gap-1.5 text-zinc-900 font-black text-xl">
                  Rp {formatIDR(data.kedai.omset)}
                </div>
              </div>
              <TrendingUp size={24} className="text-emerald-400 opacity-50" />
            </div>
            
            <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Operasional Kru</span>
              <p className="text-sm font-black text-zinc-700">Rp {formatIDR(data.kedai.pengeluaranKru)}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Belanja Owner</span>
              <p className="text-sm font-black text-zinc-700">Rp {formatIDR(data.kedai.belanjaOwner)}</p>
            </div>
            
            <div className="bg-rose-50/50 p-5 rounded-3xl border border-rose-100 shadow-sm col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-1">Total Beban Biaya</span>
                <p className="text-lg font-black text-rose-700">Rp {formatIDR(data.kedai.pengeluaranKru + data.kedai.belanjaOwner)}</p>
              </div>
              <Wallet size={24} className="text-rose-400 opacity-50" />
            </div>

            <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100 shadow-sm col-span-2 flex items-center justify-between mt-1">
              <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">Total Modal Logistik (HPP)</span>
                <p className="text-lg font-black text-indigo-700">Rp {formatIDR(data.kedai.totalNilaiPemakaian)}</p>
              </div>
              <PackageMinus size={24} className="text-indigo-400 opacity-50" />
            </div>

            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden col-span-2 mt-1">
              <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex items-center gap-2">
                <PackageMinus size={16} className="text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Logistik Terpakai Kedai</span>
              </div>
              <div className="divide-y divide-zinc-50 text-xs max-h-48 overflow-y-auto">
                {data.kedai.pemakaian.length > 0 ? data.kedai.pemakaian.map((item: any, i: number) => (
                  <div key={i} className="p-3.5 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                    <div>
                      <span className="font-bold text-zinc-700 block">{item.nama}</span>
                      <span className="text-[10px] font-semibold text-zinc-400 mt-0.5 block">Nilai: Rp {formatIDR(item.nilai)}</span>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg">{item.qty} Keluar</span>
                  </div>
                )) : (
                  <p className="p-5 text-center text-[10px] text-zinc-400 italic">Belum ada pemakaian bahan.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW LAPORAN GEROBAK ================= */}
        {viewCabang === 'gerobak' && data && (
          <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">Gross Omset Gerobak</span>
                <div className="flex items-center gap-1.5 text-zinc-900 font-black text-xl">
                  Rp {formatIDR(data.gerobak.omset)}
                </div>
              </div>
              <TrendingUp size={24} className="text-emerald-400 opacity-50" />
            </div>
            
            <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Operasional Kru</span>
              <p className="text-sm font-black text-zinc-700">Rp {formatIDR(data.gerobak.pengeluaranKru)}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Belanja Owner</span>
              <p className="text-sm font-black text-zinc-700">Rp {formatIDR(data.gerobak.belanjaOwner)}</p>
            </div>
            
            <div className="bg-rose-50/50 p-5 rounded-3xl border border-rose-100 shadow-sm col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-1">Total Beban Biaya</span>
                <p className="text-lg font-black text-rose-700">Rp {formatIDR(data.gerobak.pengeluaranKru + data.gerobak.belanjaOwner)}</p>
              </div>
              <Wallet size={24} className="text-rose-400 opacity-50" />
            </div>

            <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100 shadow-sm col-span-2 flex items-center justify-between mt-1">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">Total Modal Logistik (HPP)</span>
                <p className="text-lg font-black text-amber-700">Rp {formatIDR(data.gerobak.totalNilaiPemakaian)}</p>
              </div>
              <PackageMinus size={24} className="text-amber-400 opacity-50" />
            </div>

            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden col-span-2 mt-1">
              <div className="p-4 bg-amber-50/50 border-b border-amber-100 flex items-center gap-2">
                <PackageMinus size={16} className="text-amber-600" />
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Logistik Terpakai Gerobak</span>
              </div>
              <div className="divide-y divide-zinc-50 text-xs max-h-48 overflow-y-auto">
                {data.gerobak.pemakaian.length > 0 ? data.gerobak.pemakaian.map((item: any, i: number) => (
                  <div key={i} className="p-3.5 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                    <div>
                      <span className="font-bold text-zinc-700 block">{item.nama}</span>
                      <span className="text-[10px] font-semibold text-zinc-400 mt-0.5 block">Nilai: Rp {formatIDR(item.nilai)}</span>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg">{item.qty} Keluar</span>
                  </div>
                )) : (
                  <p className="p-5 text-center text-[10px] text-zinc-400 italic">Belum ada pemakaian bahan.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* METRICS GUDANG TERPUSAT */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm flex flex-col justify-center">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Total Aset Gudang</span>
            <div className="flex items-center gap-2 text-zinc-800 font-black text-sm">
              <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-md"><Boxes size={12} /></div>
              Rp {data ? formatIDR(data.metricsGudang.nilaiAsetGudang) : '0'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Sisa Kas Logistik</span>
              <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">8M</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-800 font-black text-sm">
              <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md"><Landmark size={12} /></div>
              Rp {data ? formatIDR(data.metricsGudang.saldoGudangKas) : '0'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}