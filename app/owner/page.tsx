'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  RefreshCw, Calendar, TrendingUp, Wallet, Landmark, 
  PackageMinus, ShieldCheck, LogOut, Boxes, Award, FileDown,
  ChevronRight, ArrowRight, History, ShoppingBag
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

  // DATA DUMMY SEMENTARA UNTUK RIWAYAT 5-10 BELANJA OWNER
  const historyBelanja = data?.historyBelanjaOwner || [
    { tanggal: '2026-07-04', barang: 'Biji Kopi Arabika Pusat', qty: 20, satuan: 'Kg', kategori: 'Bar', nominal: 3000000 },
    { tanggal: '2026-07-03', barang: 'Susu UHT Diamond', qty: 10, satuan: 'Dus', kategori: 'Bar', nominal: 1700000 },
    { tanggal: '2026-07-02', barang: 'Cup Plastik 16oz + Sablon', qty: 5, satuan: 'Dus', kategori: 'Lain-lain', nominal: 1250000 },
    { tanggal: '2026-07-02', barang: 'Gas Elpiji 3kg', qty: 4, satuan: 'Tabung', kategori: 'Dapur', nominal: 88000 },
    { tanggal: '2026-07-01', barang: 'Sirup Premium Pandan', qty: 12, satuan: 'Botol', kategori: 'Bar', nominal: 960000 },
    { tanggal: '2026-06-29', barang: 'Tisu Wajah Napkin', qty: 2, satuan: 'Dus', kategori: 'Lain-lain', nominal: 480000 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* GLOBAL HEADER DENGAN LOGO */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img 
              src="/logo.png" 
              alt="Logo Kopi Bara" 
              className="h-8 sm:h-10 w-auto object-contain" 
              crossOrigin="anonymous"
            />
            <div className="border-l-2 border-slate-200 pl-3">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 uppercase">Owner Hub</h1>
              <p className="text-[8px] sm:text-[9px] font-bold text-blue-600 uppercase tracking-widest">Otoritas Pusat</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className="p-2 sm:p-2.5 bg-slate-100 text-slate-500 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95 shadow-sm"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:max-w-4xl mt-5 space-y-4">
        
        {/* SELECTOR BULAN & REFRESH */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Calendar size={16} className="text-blue-600" />
            <input 
              type="date" 
              value={bulanPilih} 
              onChange={(e) => setBulanPilih(e.target.value)} 
              className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-transparent outline-none cursor-pointer text-slate-800" 
            />
          </div>
          <button 
            onClick={() => fetchDataOwner(bulanPilih)} 
            className="p-2 bg-slate-50 border border-slate-200 rounded-full text-slate-500 hover:text-blue-600 transition-all active:scale-95"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>

        {/* TAB SWITCHER (PILL STYLE) */}
        <div className="bg-slate-200/50 p-1.5 rounded-[1.2rem] grid grid-cols-3 gap-1.5 text-center font-black text-[9px] sm:text-[10px] uppercase tracking-widest">
          <button onClick={() => setViewCabang('gabungan')} className={`py-2.5 rounded-xl transition-all duration-300 ${viewCabang === 'gabungan' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Gabungan</button>
          <button onClick={() => setViewCabang('kedai')} className={`py-2.5 rounded-xl transition-all duration-300 ${viewCabang === 'kedai' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Kedai</button>
          <button onClick={() => setViewCabang('gerobak')} className={`py-2.5 rounded-xl transition-all duration-300 ${viewCabang === 'gerobak' ? 'bg-white text-amber-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Gerobak</button>
        </div>

        {/* CARD UTAMA: NET PROFIT (DARK THEME) */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group border border-white/5">
          <div className="absolute -top-10 -right-10 opacity-[0.03] transform rotate-12 group-hover:rotate-45 transition-transform duration-1000">
            <Landmark size={200} />
          </div>
          
          <div className="relative z-10">
            <p className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
              <ShieldCheck size={14} /> 
              {viewCabang === 'gabungan' ? 'Estimasi Laba Bersih Gabungan' : `Laba Bersih ${viewCabang}`}
            </p>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${viewCabang === 'gabungan' ? 'text-emerald-400' : viewCabang === 'kedai' ? 'text-blue-400' : 'text-amber-400'}`}>
              Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.totalLabaGabungan : viewCabang === 'kedai' ? data.kedai.labaBersih : data.gerobak.labaBersih) : '0'}
            </h2>
            
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Periode • <span className="text-white">{getLabelBulan(bulanPilih)}</span>
              </div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-slate-900"></div>
                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-900"></div>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS GRID - DINAMIS BERDASARKAN TAB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          
          {/* BOX OMSET */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Gross Omset</p>
                <h3 className="text-xl font-black text-slate-800">
                  Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.kedai.omset + data.gerobak.omset : data[viewCabang].omset) : '0'}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <TrendingUp size={18} />
              </div>
            </div>
          </div>

          {/* BOX PENGELUARAN */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Operasional &amp; Belanja</p>
                <h3 className="text-xl font-black text-rose-600">
                  Rp {data ? formatIDR(viewCabang === 'gabungan' ? (data.kedai.pengeluaranKru + data.kedai.belanjaOwner + data.gerobak.pengeluaranKru + data.gerobak.belanjaOwner) : (data[viewCabang].pengeluaranKru + data[viewCabang].belanjaOwner)) : '0'}
                </h3>
              </div>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Wallet size={18} />
              </div>
            </div>
          </div>

          {/* BOX HPP (MODAL BAHAN) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Modal Bahan Terpakai (HPP)</p>
                <h3 className="text-xl font-black text-slate-700">
                  Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.kedai.totalNilaiPemakaian + data.gerobak.totalNilaiPemakaian : data[viewCabang].totalNilaiPemakaian) : '0'}
                </h3>
              </div>
              <div className="p-2 bg-slate-50 text-slate-500 rounded-xl">
                <Boxes size={18} />
              </div>
            </div>
          </div>

          {/* BOX GUDANG ASSETS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nilai Aset Di Gudang</p>
                <h3 className="text-xl font-black text-slate-800">
                  Rp {data ? formatIDR(data.metricsGudang.nilaiAsetGudang) : '0'}
                </h3>
              </div>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Landmark size={18} />
              </div>
            </div>
          </div>

        </div>

        {/* 🆕 FITUR BARU: SCROLLABLE FEED LOG 10 INPUT BELANJA OWNER TERAKHIR */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <History size={14} className="text-blue-600" /> 
              Log 10 Belanja Owner Terakhir
            </span>
            <span className="text-[8px] font-bold bg-white px-2 py-1 rounded-full border border-slate-200">Live Sheets Log</span>
          </div>
          
          {/* Scroll container berketinggian tetap */}
          <div className="divide-y divide-slate-100 text-xs max-h-[260px] overflow-y-auto">
            {historyBelanja.length > 0 ? historyBelanja.map((item: any, i: number) => (
              <div key={i} className="p-3.5 flex justify-between items-center hover:bg-slate-50/60 transition-colors">
                <div className="min-w-0 pr-4 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded tracking-wide">
                      {item.tanggal}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 rounded ${
                      item.kategori === 'Bar' ? 'bg-blue-50 text-blue-600' : item.kategori === 'Dapur' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.kategori}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 block truncate text-[11px] sm:text-xs">
                    {item.barang}
                  </span>
                  <span className="text-[9px] font-medium text-slate-400 block">
                    Kuantitas: {item.qty} {item.satuan}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-900 bg-slate-100/80 px-2.5 py-1.5 rounded-xl block">
                    Rp {formatIDR(item.nominal)}
                  </span>
                </div>
              </div>
            )) : (
              <p className="p-10 text-center text-xs text-slate-400 italic">Belum ada riwayat belanja yang masuk.</p>
            )}
          </div>
        </div>

        {/* DAFTAR PEMAKAIAN BAHAN (Hanya muncul jika bukan tab gabungan) */}
        {viewCabang !== 'gabungan' && data && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <PackageMinus size={14} className={viewCabang === 'kedai' ? 'text-blue-600' : 'text-amber-600'} /> 
                Detail Pemakaian Bahan {viewCabang}
              </span>
              <span className="text-[8px] font-bold bg-white px-2 py-1 rounded-full border border-slate-200">Bulan Berjalan</span>
            </div>
            <div className="divide-y divide-slate-50 text-xs max-h-[300px] overflow-y-auto">
              {data[viewCabang].pemakaian.length > 0 ? data[viewCabang].pemakaian.map((item: any, i: number) => (
                <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0 pr-4">
                    <span className="font-bold text-slate-800 block truncate">{item.nama}</span>
                    <span className="text-[9px] font-semibold text-slate-400 mt-0.5 block italic">HPP: Rp {formatIDR(item.nilai)}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${viewCabang === 'kedai' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                      {item.qty} Keluar
                    </span>
                  </div>
                </div>
              )) : (
                <p className="p-10 text-center text-xs text-slate-400 italic">Belum ada data pemakaian logistik.</p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* FIXED FLOATING ACTION DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-40">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full shadow-2xl shadow-slate-200/50 p-2 px-6 flex justify-between items-center">
          
          <Link href="/owner/belanja" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 p-2 transition-all group">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <Wallet size={18} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Belanja</span>
          </Link>

          <Link href="/owner/evaluasi" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 p-2 transition-all group">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <Award size={18} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Evaluasi</span>
          </Link>

          <Link href="/owner/slip" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 p-2 transition-all group">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <FileDown size={18} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">Slip Gaji</span>
          </Link>

        </div>
      </div>

    </div>
  );
}