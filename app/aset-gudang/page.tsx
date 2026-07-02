'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Layers, AlertTriangle, Package, 
  ArrowDownRight, ArrowUpRight, RefreshCw, Box, ShieldAlert
} from 'lucide-react';

export default function TrackerAsetGudang() {
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [totalAset, setTotalAset] = useState<number>(0);

  const fetchAsetGudang = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/aset');
      const data = await res.json();
      
      if (res.ok) {
        setTotalAset(data.totalAset || 0);
        setItems(data.items || []);
        setAlerts(data.stockAlerts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsetGudang();
  }, []);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID').format(val || 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black tracking-wide text-zinc-800 uppercase flex items-center gap-1.5">
            <Layers size={16} className="text-indigo-500" /> Aset Gudang
          </h1>
          <button onClick={fetchAsetGudang} className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors">
             <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        
        {/* TOTAL METRIK ASET */}
        <div className="bg-indigo-950 text-white p-6 rounded-3xl border border-indigo-900 shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Box size={140} />
          </div>
          <div className="relative z-10">
            <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block mb-1">Total Nilai Aset Fisik Tersedia</span>
            <h2 className="text-3xl font-black tracking-tight text-white mb-3">
              Rp {formatIDR(totalAset)}
            </h2>
            <div className="inline-block bg-indigo-900/60 border border-indigo-800 px-3 py-1.5 rounded-lg text-[9px] font-bold text-indigo-200 uppercase tracking-wider">
              {items.length} Jenis Barang Tercatat
            </div>
          </div>
        </div>

        {/* 🚨 STOCK ALERT SECTION KUSTOM */}
        {alerts.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 animate-pulse"></div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-rose-600" />
              <h3 className="text-xs font-black text-rose-700 uppercase tracking-wide">Peringatan Kritis!</h3>
            </div>
            <p className="text-[10px] text-rose-600/80 font-semibold mb-3">
              Ada {alerts.length} item menembus batas minimum stok. Segera jadwalkan Restock!
            </p>
            <div className="grid grid-cols-2 gap-2">
              {alerts.map((alert, idx) => (
                <div key={idx} className="bg-white border border-rose-100 p-2.5 rounded-xl flex flex-col shadow-2xs relative">
                  <span className="text-[10px] font-black text-zinc-800 leading-tight mb-1">{alert.nama}</span>
                  <div className="flex justify-between items-end mt-auto">
                    <div>
                      <span className="text-[8px] font-bold text-zinc-400 uppercase">Sisa Fisik</span>
                      <p className="text-xs font-black text-rose-600">{alert.sisa}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-bold text-zinc-400 uppercase">Batas Aman</span>
                      <p className="text-xs font-black text-zinc-400">{alert.batasAman}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIST PERGERAKAN & RINCIAN BARANG */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-3">
            <Package size={14} className="text-zinc-500" />
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rincian Logistik & Aset</h3>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-xs text-zinc-400 py-10 font-medium animate-pulse">Memuat data gudang...</p>
            ) : items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className={`bg-white p-4 rounded-2xl border shadow-3xs flex flex-col gap-3 transition-all ${item.sisa <= item.batasAman ? 'border-rose-200' : 'border-zinc-200 hover:border-indigo-200'}`}>
                  
                  {/* Header Item */}
                  <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                    <div>
                      <div className="text-[9px] font-bold text-zinc-400 mb-0.5">{item.id}</div>
                      <h4 className="text-sm font-black text-zinc-800 leading-tight">{item.nama}</h4>
                      {item.sisa <= item.batasAman && (
                        <div className="flex items-center gap-1 mt-1.5 text-rose-500 bg-rose-50 w-fit px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                          <ShieldAlert size={10} /> Perlu Restock
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Nilai Aset</div>
                      <span className="text-xs font-black text-indigo-600">Rp {formatIDR(item.nilai)}</span>
                    </div>
                  </div>

                  {/* Body Pergerakan */}
                  <div className="grid grid-cols-4 gap-2 divide-x divide-zinc-100">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-400 uppercase">
                        <ArrowDownRight size={10} className="text-emerald-500" /> Masuk
                      </div>
                      <span className="text-xs font-black text-emerald-600 mt-1">{item.masuk}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-400 uppercase">
                        <ArrowUpRight size={10} className="text-rose-500" /> Keluar
                      </div>
                      <span className="text-xs font-black text-rose-600 mt-1">{item.keluar}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-[8px] font-black text-zinc-400 uppercase text-center">Batas<br/>Aman</div>
                      <span className="text-xs font-bold text-zinc-400 mt-0.5">{item.batasAman}</span>
                    </div>
                    <div className={`flex flex-col items-center justify-center rounded-xl py-1 ${item.sisa <= item.batasAman ? 'bg-rose-50' : 'bg-zinc-50'}`}>
                      <div className="text-[8px] font-black text-zinc-500 uppercase">Sisa Stok</div>
                      <span className={`text-sm font-black mt-0.5 ${item.sisa <= item.batasAman ? 'text-rose-600' : 'text-zinc-800'}`}>
                        {item.sisa}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-zinc-400 py-10 font-medium">Belum ada data barang di gudang.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}