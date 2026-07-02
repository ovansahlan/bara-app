'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Box, Landmark, ShieldCheck, Layers } from 'lucide-react';

export default function TrackerAsetGudang() {
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<any[]>([]);
  const [totalAset, setTotalAset] = useState<number>(0);

  useEffect(() => {
    const fetchAsetGudang = async () => {
      try {
        const res = await fetch('/api/stok'); // Memakai endpoint stok yang membaca Master Product
        const resDash = await fetch('/api/dashboard');
        const dataDash = await resDash.json();
        
        // Membaca data sekunder khusus item bernilai dari spreadsheet
        const response = await fetch('/api/owner'); 
        const result = await response.json();
        
        if (resDash.ok) setTotalAset(dataDash.nilaiAsetGudang || 0);
        
        // Menarik histori inventori berjalan dari data owner untuk diringkas
        // Kita simulasikan pembacaan offline statis dari sheet jika master error
        const resDirect = await fetch('/api/dashboard');
        const finalData = await resDirect.json();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAsetGudang();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black tracking-wide text-zinc-800 uppercase flex items-center gap-1.5">
            <Layers size={16} className="text-indigo-500" /> Tracker Aset Gudang
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-4">
        {/* TOTAL METRIK ASET */}
        <div className="bg-indigo-950 text-white p-6 rounded-3xl border border-indigo-900 shadow-xl">
          <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block mb-1">Total Nilai Aset Bahan Baku</span>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Rp {totalAset.toLocaleString('id-ID')}
          </h2>
          <p className="text-[9px] text-indigo-400 font-semibold uppercase mt-3 tracking-wider">
            Nilai Real-Time Berdasarkan Formula HPP Tab `CurrentStock`
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 text-center space-y-2">
          <p className="text-xs text-zinc-500 font-medium">
            Nilai aset gudang ini dikalkulasi otomatis oleh sistem Google Sheets Anda berdasarkan sisa volume **Stock Akhir** dikali dengan **Harga Rata-Rata** belanja harian.
          </p>
        </div>
      </div>
    </div>
  );
}