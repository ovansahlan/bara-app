'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  RefreshCw, Calendar, TrendingUp, Wallet, Landmark, 
  PackageMinus, ShieldCheck, LogOut, Boxes, Award, FileDown,
  History, ShoppingBag, Layers, UserCheck
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

  // FILTER SINKRONISASI DAFTAR HISTORI SECARA DINAMIS BERDASARKAN TAB ACTIVE
  const filteredBelanjaOwner = (data?.historyBelanjaOwner || []).filter((item: any) => 
    viewCabang === 'gabungan' ? true : item.peruntukan.toLowerCase() === viewCabang
  );

  const filteredPengeluaranKru = (data?.historyPengeluaranKru || []).filter((item: any) => 
    viewCabang === 'gabungan' ? true : item.outlet.toLowerCase() === viewCabang
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-36 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* HEADER UTAMA BRANDED */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Logo Kopi Bara" className="h-8 sm:h-10 w-auto object-contain" crossOrigin="anonymous" />
            <div className="border-l-2 border-slate-200 pl-3">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 uppercase">Owner Console</h1>
              <p className="text-[8px] sm:text-[9px] font-bold text-blue-600 uppercase tracking-widest">Otoritas Pusat</p>
            </div>
          </div>
          <button onClick={() => router.push('/')} className="p-2 sm:p-2.5 bg-slate-100 text-slate-500 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm active:scale-95"><LogOut size={16} /></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-5 space-y-5">
        
        {/* CONTROL DECK CONTROL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between sm:col-span-1">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={16} className="text-blue-600" />
              <input type="date" value={bulanPilih} onChange={(e) => setBulanPilih(e.target.value)} className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-transparent outline-none text-slate-800" />
            </div>
            <button onClick={() => fetchDataOwner(bulanPilih)} className="p-2 bg-slate-50 border border-slate-200 rounded-full text-slate-500 hover:text-blue-600 transition-all"><RefreshCw size={13} className={isLoading ? 'animate-spin text-blue-600' : ''} /></button>
          </div>

          <div className="bg-slate-200/50 p-1.5 rounded-[1.2rem] grid grid-cols-3 gap-1.5 text-center font-black text-[9px] sm:text-[10px] uppercase tracking-widest sm:col-span-2">
            <button onClick={() => setViewCabang('gabungan')} className={`py-2 rounded-xl transition-all duration-300 ${viewCabang === 'gabungan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Gabungan</button>
            <button onClick={() => setViewCabang('kedai')} className={`py-2 rounded-xl transition-all duration-300 ${viewCabang === 'kedai' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Kedai</button>
            <button onClick={() => setViewCabang('gerobak')} className={`py-2 rounded-xl transition-all duration-300 ${viewCabang === 'gerobak' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Gerobak</button>
          </div>
        </div>

        {/* CARD HERO LABA BERSIH (DARK THEME) */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group border border-white/5">
          <p className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldCheck size={14} /> Estimasi Laba Bersih ({viewCabang})</p>
          <h2 className={`text-3xl sm:text-4xl font-black tracking-tight ${viewCabang === 'gabungan' ? 'text-emerald-400' : viewCabang === 'kedai' ? 'text-blue-400' : 'text-amber-400'}`}>
            Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.totalLabaGabungan : data[viewCabang].labaBersih) : '0'}
          </h2>
          <div className="mt-5 pt-3 border-t border-white/10 text-[9px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Periode • {getLabelBulan(bulanPilih)}</span>
            <span>Formula: Omset - Beban Kru - Belanja Owner - HPP</span>
          </div>
        </div>

        {/* METRICS 4 BENTO PILAR UTAMA */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gross Omset</p>
              <h3 className="text-base sm:text-lg font-black text-slate-800">Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.kedai.omset + data.gerobak.omset : data[viewCabang].omset) : '0'}</h3>
            </div>
            <div className="p-2 bg-slate-50 text-blue-600 rounded-xl w-fit mt-3"><TrendingUp size={16} /></div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Beban Operasional Kru</p>
              <h3 className="text-base sm:text-lg font-black text-rose-500">Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.kedai.pengeluaranKru + data.gerobak.pengeluaranKru : data[viewCabang].pengeluaranKru) : '0'}</h3>
            </div>
            <div className="p-2 bg-slate-50 text-rose-500 rounded-xl w-fit mt-3"><Wallet size={16} /></div>
          </div>

          {/* INDIKATOR BARU: BELANJA OWNER YANG TERPISAH MANDIRI */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pengeluaran Owner</p>
              <h3 className="text-base sm:text-lg font-black text-purple-600">Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.kedai.belanjaOwner + data.gerobak.belanjaOwner : data[viewCabang].belanjaOwner) : '0'}</h3>
            </div>
            <div className="p-2 bg-slate-50 text-purple-600 rounded-xl w-fit mt-3"><UserCheck size={16} /></div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Modal Bahan (HPP)</p>
              <h3 className="text-base sm:text-lg font-black text-slate-700">Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.kedai.totalNilaiPemakaian + data.gerobak.totalNilaiPemakaian : data[viewCabang].totalNilaiPemakaian) : '0'}</h3>
            </div>
            <div className="p-2 bg-slate-50 text-slate-500 rounded-xl w-fit mt-3"><Boxes size={16} /></div>
          </div>
        </div>

        {/* SECTION TABLE HISTORI BEREDAR (DESKTOP: 2 KOLOM SEJAJAR, MOBILE: STACK VERTICAL) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* TABEL A: LOG HISTORI BELANJA OWNER */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5"><History size={14} className="text-purple-600" /> Log Belanja Owner</span>
              <span className="text-[8px] font-black bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">Live Owner Log</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs max-h-[280px] overflow-y-auto flex-1">
              {filteredBelanjaOwner.length > 0 ? filteredBelanjaOwner.map((item: any, i: number) => (
                <div key={i} className="p-3.5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0 pr-4 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.tanggal}</span>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 rounded ${item.peruntukan === 'Gerobak' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{item.peruntukan}</span>
                    </div>
                    <span className="font-bold text-slate-800 block truncate text-[11px] sm:text-xs">{item.barang}</span>
                    <span className="text-[9px] text-slate-400 block font-medium">Kuantitas: {item.qty} {item.satuan}</span>
                  </div>
                  <span className="text-xs font-black text-purple-700 bg-purple-50/80 px-2.5 py-1.5 rounded-xl shrink-0">Rp {formatIDR(item.nominal)}</span>
                </div>
              )) : <p className="p-10 text-center text-xs text-slate-400 italic">Tidak ada log belanja owner.</p>}
            </div>
          </div>

          {/* TABEL B: LOG HISTORI PENGELUARAN OPERASIONAL KRU */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5"><History size={14} className="text-rose-600" /> Log Operasional Kru</span>
              <span className="text-[8px] font-black bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-100">Live Cashier Log</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs max-h-[280px] overflow-y-auto flex-1">
              {filteredPengeluaranKru.length > 0 ? filteredPengeluaranKru.map((item: any, i: number) => (
                <div key={i} className="p-3.5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0 pr-4 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.tanggal}</span>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 rounded ${item.outlet === 'Gerobak' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{item.outlet}</span>
                    </div>
                    <span className="font-bold text-slate-800 block truncate text-[11px] sm:text-xs">{item.barang}</span>
                    <span className="text-[9px] text-slate-400 block font-medium">Kuantitas: {item.qty} {item.satuan} • Pos: {item.kategori}</span>
                  </div>
                  <span className="text-xs font-black text-rose-600 bg-rose-50/80 px-2.5 py-1.5 rounded-xl shrink-0">Rp {formatIDR(item.nominal)}</span>
                </div>
              )) : <p className="p-10 text-center text-xs text-slate-400 italic">Tidak ada log pengeluaran kru.</p>}
            </div>
          </div>

        </div>

        {/* TABEL C: PEMAKAIAN BAHAN BAKU / STOK GUDANG TERAKHIR (PALING BAWAH MELAR) */}
        {viewCabang !== 'gabungan' && data && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <PackageMinus size={14} className={viewCabang === 'kedai' ? 'text-blue-600' : 'text-amber-600'} /> 
                Detail Alokasi & Pemakaian Bahan Baku ({viewCabang})
              </span>
              <span className="text-[8px] font-bold bg-white px-2 py-1 rounded-full border border-slate-200">HPP Logistik</span>
            </div>
            <div className="divide-y divide-slate-50 text-xs max-h-[300px] overflow-y-auto">
              {data[viewCabang].pemakaian.length > 0 ? data[viewCabang].pemakaian.map((item: any, i: number) => (
                <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0 pr-4">
                    <span className="font-bold text-slate-800 block truncate">{item.nama}</span>
                    <span className="text-[9px] font-semibold text-slate-400 mt-0.5 block italic">Kumulatif Beban HPP: Rp {formatIDR(item.nilai)}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${viewCabang === 'kedai' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                      {item.qty} Unit Keluar
                    </span>
                  </div>
                </div>
              )) : (
                <p className="p-10 text-center text-xs text-slate-400 italic">Belum ada pemakaian logistik gudang bulan ini.</p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* FIXED FLOATING ACTION DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-40">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full shadow-2xl p-2 px-6 flex justify-between items-center">
          <Link href="/owner/belanja" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 p-2 group">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors"><Wallet size={18} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Belanja</span>
          </Link>
          <Link href="/owner/evaluasi" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 p-2 group">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors"><Award size={18} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Evaluasi</span>
          </Link>
          <Link href="/owner/slip" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 p-2 group">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors"><FileDown size={18} /></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Slip Gaji</span>
          </Link>
        </div>
      </div>

    </div>
  );
}