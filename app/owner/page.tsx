'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  RefreshCw, Calendar, TrendingUp, Wallet, PlusCircle,
  UserCheck, Landmark, PackagePlus, PackageMinus, ShieldCheck, LogOut, ArrowRightLeft, Boxes
} from 'lucide-react';

export default function DashboardOwner() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [bulanPilih, setBulanPilih] = useState<string>(new Date().toISOString().split('T')[0]);

  const fetchDataOwner = async (tanggalStr: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/owner?tanggal=${tanggalStr}`);
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (error) {
      console.error("Gagal menarik data owner panel", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataOwner(bulanPilih);
  }, [bulanPilih]);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID').format(val || 0);

  const getLabelBulan = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      
      {/* HEADER */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-900 text-white rounded-xl shadow-md">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-wider text-zinc-800 uppercase">Owner Console</h1>
              <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Kedai Kopi Bara</p>
            </div>
          </div>
          <button onClick={() => router.push('/')} className="p-2 bg-zinc-100 text-zinc-500 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-4">
        
        {/* MONTH SELECTOR */}
        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-600">
            <Calendar size={14} className="text-zinc-400" />
            <input type="date" value={bulanPilih} onChange={(e) => setBulanPilih(e.target.value)} className="text-xs font-black uppercase tracking-wider bg-transparent outline-none cursor-pointer text-zinc-800" />
          </div>
          <button onClick={() => fetchDataOwner(bulanPilih)} className="p-1.5 text-zinc-400 hover:text-zinc-800 transition-colors">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* UTAMA CARD: NET PROFIT BULANAN */}
        <div className="bg-zinc-900 text-white p-5 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Laba Bersih Berjalan ({getLabelBulan(bulanPilih)})</p>
          <h2 className="text-3xl font-black tracking-tight text-emerald-400">
            Rp {data ? formatIDR(data.metrics.sisaSaldo) : '0'}
          </h2>
          <div className="mt-4 pt-3 border-t border-zinc-800/50 text-[9px] font-bold text-zinc-500 uppercase tracking-wide">
            <span>Formula: Omset - Biaya Kru - Belanja Owner</span>
          </div>
        </div>

        {/* TOMBOL LINK KHUSUS UNTUK CATAT BELANJA OWNER */}
        <Link href="/owner/belanja" className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex justify-between items-center hover:bg-amber-100/60 transition-all shadow-3xs group">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs"><Wallet size={16} /></div>
            <div>
              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Aksi Owner</p>
              <p className="text-xs font-black text-amber-950">Catat Belanja Pribadi / Investasi</p>
            </div>
          </div>
          <PlusCircle size={18} className="text-amber-500 group-hover:scale-110 transition-transform" />
        </Link>

        {/* METRICS GRID FINANSIAL SINKRONISASI ASSET GUDANG */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Omset Kotor Kedai</span>
            <div className="flex items-baseline gap-1 text-zinc-800 font-black text-sm">
              <TrendingUp size={14} className="text-emerald-500 mr-1" />
              Rp {data ? formatIDR(data.metrics.omset) : '0'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Nilai Bahan Baku (Aset)</span>
            <div className="flex items-baseline gap-1 text-zinc-800 font-black text-sm">
              <Boxes size={14} className="text-indigo-500 mr-1" />
              Rp {data ? formatIDR(data.metrics.nilaiAsetGudang) : '0'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Sisa Uang Kas Gudang</span>
            <div className="flex items-baseline gap-1 text-zinc-800 font-black text-sm">
              <Landmark size={14} className="text-slate-600 mr-1" />
              Rp {data ? formatIDR(data.metrics.saldoGudangKas) : '0'}
            </div>
            <p className="text-[8px] text-zinc-400 font-bold mt-1 uppercase">Plafon: Rp 8.000.000</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Belanja Pribadi Owner</span>
            <div className="flex items-baseline gap-1 text-zinc-800 font-black text-sm">
              <Wallet size={14} className="text-amber-500 mr-1" />
              Rp {data ? formatIDR(data.metrics.pengenerOwner) || formatIDR(data.metrics.pengeluaranOwner) : '0'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm col-span-2">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Biaya Operasional Kru</span>
            <div className="flex items-baseline gap-1 text-zinc-800 font-black text-sm">
              <UserCheck size={14} className="text-rose-500 mr-1" />
              Rp {data ? formatIDR(data.metrics.pengeluaranKru) : '0'}
            </div>
          </div>
        </div>

        {/* LOG PERGERAKAN STOK GUDANG TERBARU */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-1.5 px-1">
            <ArrowRightLeft size={13} className="text-zinc-400" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pergerakan Logistik Gudang</span>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
              <PackagePlus size={14} className="text-emerald-600" />
              <span className="text-[10px] font-black text-zinc-600 uppercase">Pasokan Masuk (Stock-In)</span>
            </div>
            <div className="divide-y divide-zinc-100 text-xs">
              {data?.stokMasuk && data.stokMasuk.length > 0 ? data.stokMasuk.map((row: any, i: number) => (
                <div key={i} className="p-3 flex justify-between items-center bg-white hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="font-bold text-zinc-700">{row.nama}</p>
                    <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Oleh {row.pic} • {row.tgl}</p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">+{row.qty}</span>
                </div>
              )) : (
                <p className="p-4 text-center text-[10px] text-zinc-400 italic">Tidak ada mutasi masuk bulan ini.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
              <PackageMinus size={14} className="text-rose-600" />
              <span className="text-[10px] font-black text-zinc-600 uppercase">Bahan Terpakai (Stock-Out)</span>
            </div>
            <div className="divide-y divide-zinc-100 text-xs">
              {data?.stokKeluar && data.stokKeluar.length > 0 ? data.stokKeluar.map((row: any, i: number) => (
                <div key={i} className="p-3 flex justify-between items-center bg-white hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="font-bold text-zinc-700">{row.nama}</p>
                    <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Tujuan: {row.tujuan} • {row.tgl}</p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-1 bg-rose-50 text-rose-700 rounded-lg">-{row.qty}</span>
                </div>
              )) : (
                <p className="p-4 text-center text-[10px] text-zinc-400 italic">Tidak ada mutasi keluar bulan ini.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}