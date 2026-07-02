'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  RefreshCw, Calendar, TrendingUp, Wallet, Landmark, 
  PackageMinus, ShieldCheck, LogOut, Boxes, Award, FileDown
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-32 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* HEADER */}
      <div className="bg-white/90 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-20 shadow-xs">
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

      <div className="max-w-md mx-auto px-4 mt-5 space-y-4">
        
        {/* SELECTOR BULAN & REFRESH */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-600">
            <Calendar size={16} className="text-indigo-500" />
            <input type="date" value={bulanPilih} onChange={(e) => setBulanPilih(e.target.value)} className="text-xs font-black uppercase tracking-wider bg-transparent outline-none cursor-pointer text-zinc-800" />
          </div>
          <button onClick={() => fetchDataOwner(bulanPilih)} className="p-2 bg-zinc-50 border border-zinc-200 rounded-full text-zinc-500 hover:text-zinc-900 transition-all active:scale-95 shadow-xs">
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-indigo-500' : ''} />
          </button>
        </div>

        {/* SEGMENTED CONTROL TAB */}
        <div className="bg-zinc-200/60 p-1 rounded-xl grid grid-cols-3 gap-1 text-center font-black text-[10px] uppercase tracking-widest shadow-inner">
          <button onClick={() => setViewCabang('gabungan')} className={`py-2.5 rounded-lg transition-all duration-300 ${viewCabang === 'gabungan' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>Gabungan</button>
          <button onClick={() => setViewCabang('kedai')} className={`py-2.5 rounded-lg transition-all duration-300 ${viewCabang === 'kedai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>Kedai</button>
          <button onClick={() => setViewCabang('gerobak')} className={`py-2.5 rounded-lg transition-all duration-300 ${viewCabang === 'gerobak' ? 'bg-white text-amber-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>Gerobak</button>
        </div>

        {/* CARD UTAMA: NET PROFIT */}
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

        {/* ================= VIEW LAPORAN GABUNGAN ================= */}
        {viewCabang === 'gabungan' && data && (
          <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Gross Omset Kedai</p>
                <p className="text-sm font-black text-zinc-800">Rp {formatIDR(data.kedai.omset)}</p>
              </div>
              <div className="w-px h-6 bg-zinc-200"></div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Gross Omset Gerobak</p>
                <p className="text-sm font-black text-zinc-800">Rp {formatIDR(data.gerobak.omset)}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex justify-between items-center bg-zinc-50/60">
              <div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Total Biaya Kedai</p>
                <p className="text-xs font-black text-rose-600">Rp {formatIDR(data.kedai.pengeluaranKru + data.kedai.belanjaOwner)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Total Biaya Gerobak</p>
                <p className="text-xs font-black text-rose-600">Rp {formatIDR(data.gerobak.pengeluaranKru + data.gerobak.belanjaOwner)}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Total HPP Kedai</p>
                <p className="text-xs font-black text-zinc-700">Rp {formatIDR(data.kedai.totalNilaiPemakaian)}</p>
              </div>
              <div className="w-px h-6 bg-zinc-200"></div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Total HPP Gerobak</p>
                <p className="text-xs font-black text-zinc-700">Rp {formatIDR(data.gerobak.totalNilaiPemakaian)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/60 text-center">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-0.5">Net Kedai</span>
                <p className="text-sm font-black text-indigo-600">Rp {formatIDR(data.kedai.labaBersih)}</p>
              </div>
              <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100/60 text-center">
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block mb-0.5">Net Gerobak</span>
                <p className="text-sm font-black text-amber-600">Rp {formatIDR(data.gerobak.labaBersih)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW LAPORAN KEDAI UTAMA ================= */}
        {viewCabang === 'kedai' && data && (
          <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-0.5">Gross Omset Kedai</span>
                <p className="text-xl font-black text-zinc-900">Rp {formatIDR(data.kedai.omset)}</p>
              </div>
              <TrendingUp size={20} className="text-emerald-400 opacity-60" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Operasional Kru</span>
                <p className="text-xs font-black text-zinc-700">Rp {formatIDR(data.kedai.pengeluaranKru)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Belanja Owner</span>
                <p className="text-xs font-black text-zinc-700">Rp {formatIDR(data.kedai.belanjaOwner)}</p>
              </div>
            </div>
            
            <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Total Beban Biaya</span>
              <p className="text-sm font-black text-rose-700">Rp {formatIDR(data.kedai.pengeluaranKru + data.kedai.belanjaOwner)}</p>
            </div>

            <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Total Modal Logistik (HPP)</span>
              <p className="text-sm font-black text-indigo-700">Rp {formatIDR(data.kedai.totalNilaiPemakaian)}</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-indigo-50/40 border-b border-indigo-100 flex items-center gap-2">
                <PackageMinus size={14} className="text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Logistik Terpakai Kedai</span>
              </div>
              <div className="divide-y divide-zinc-50 text-xs max-h-40 overflow-y-auto">
                {data.kedai.pemakaian.length > 0 ? data.kedai.pemakaian.map((item: any, i: number) => (
                  <div key={i} className="p-3 flex justify-between items-center hover:bg-zinc-50/50 transition-colors">
                    <div>
                      <span className="font-bold text-zinc-700 block">{item.nama}</span>
                      <span className="text-[9px] font-semibold text-zinc-400 mt-0.5 block">Nilai: Rp {formatIDR(item.nilai)}</span>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">{item.qty} Keluar</span>
                  </div>
                )) : (
                  <p className="p-4 text-center text-[10px] text-zinc-400 italic">Belum ada pemakaian bahan.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW LAPORAN GEROBAK ================= */}
        {viewCabang === 'getobak' || viewCabang === 'gerobak' ? (data && (
          <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-0.5">Gross Omset Gerobak</span>
                <p className="text-xl font-black text-zinc-900">Rp {formatIDR(data.gerobak.omset)}</p>
              </div>
              <TrendingUp size={20} className="text-emerald-400 opacity-60" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Operasional Kru</span>
                <p className="text-xs font-black text-zinc-700">Rp {formatIDR(data.gerobak.pengeluaranKru)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Belanja Owner</span>
                <p className="text-xs font-black text-zinc-700">Rp {formatIDR(data.gerobak.belanjaOwner)}</p>
              </div>
            </div>
            
            <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Total Beban Biaya</span>
              <p className="text-sm font-black text-rose-700">Rp {formatIDR(data.gerobak.pengeluaranKru + data.gerobak.belanjaOwner)}</p>
            </div>

            <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Total Modal Logistik (HPP)</span>
              <p className="text-sm font-black text-amber-700">Rp {formatIDR(data.gerobak.totalNilaiPemakaian)}</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-amber-50/40 border-b border-amber-100 flex items-center gap-2">
                <PackageMinus size={14} className="text-amber-600" />
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Logistik Terpakai Gerobak</span>
              </div>
              <div className="divide-y divide-zinc-50 text-xs max-h-40 overflow-y-auto">
                {data.gerobak.pemakaian.length > 0 ? data.gerobak.pemakaian.map((item: any, i: number) => (
                  <div key={i} className="p-3 flex justify-between items-center hover:bg-zinc-50/50 transition-colors">
                    <div>
                      <span className="font-bold text-zinc-700 block">{item.nama}</span>
                      <span className="text-[9px] font-semibold text-zinc-400 mt-0.5 block">Nilai: Rp {formatIDR(item.nilai)}</span>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md">{item.qty} Keluar</span>
                  </div>
                )) : (
                  <p className="p-4 text-center text-[10px] text-zinc-400 italic">Belum ada pemakaian bahan.</p>
                )}
              </div>
            </div>
          </div>
        )) : null}

        {/* METRICS GUDANG TERPUSAT */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-center">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Total Aset Gudang</span>
            <div className="flex items-center gap-2 text-zinc-800 font-black text-xs">
              <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-md"><Boxes size={12} /></div>
              Rp {data ? formatIDR(data.metricsGudang.nilaiAsetGudang) : '0'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-center">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Sisa Kas Logistik</span>
              <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded">8M</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-800 font-black text-xs">
              <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md"><Landmark size={12} /></div>
              Rp {data ? formatIDR(data.metricsGudang.saldoGudangKas) : '0'}
            </div>
          </div>
        </div>

      </div>

      {/* FIXED FLOATING ACTION DOCK (iOS-STYLE FLOATING MENU BAR) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-zinc-900/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex justify-around items-center z-30 border border-zinc-800 animate-in slide-in-from-bottom-5 duration-500">
        
        {/* Tombol Catat Belanja Owner */}
        <Link href="/owner/belanja" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors group">
          <div className="p-2 bg-zinc-800 group-hover:bg-amber-500 group-hover:text-white rounded-xl transition-all">
            <Wallet size={16} />
          </div>
          <span className="text-[9px] font-bold tracking-tight">Belanja</span>
        </Link>

        {/* Garis Pembatas Kecil */}
        <div className="w-px h-6 bg-zinc-800"></div>

        {/* Tombol Evaluasi Kinerja */}
        <Link href="/owner/evaluasi" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors group">
          <div className="p-2 bg-zinc-800 group-hover:bg-indigo-500 group-hover:text-white rounded-xl transition-all">
            <Award size={16} />
          </div>
          <span className="text-[9px] font-bold tracking-tight">Evaluasi</span>
        </Link>

        {/* Garis Pembatas Kecil */}
        <div className="w-px h-6 bg-zinc-800"></div>

        {/* Tombol Cetak Semua Slip Gaji */}
        <Link href="/owner/slip" className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors group">
          <div className="p-2 bg-zinc-800 group-hover:bg-emerald-500 group-hover:text-white rounded-xl transition-all">
            <FileDown size={16} />
          </div>
          <span className="text-[9px] font-bold tracking-tight">Cetak Slip</span>
        </Link>

      </div>

    </div>
  );
}