'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  RefreshCw, Calendar, TrendingUp, Wallet, Landmark, 
  PackageMinus, ShieldCheck, LogOut, Boxes, Award, FileDown,
  History, ShoppingBag, Layers, UserCheck, Lock, Delete
} from 'lucide-react';

export default function DashboardOwner() {
  const router = useRouter();
  
  // ==========================================
  // STATE AUTENTIKASI PIN
  // ==========================================
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [errorAuth, setErrorAuth] = useState<string>('');
  
  // ==========================================
  // STATE DATA UTAMA
  // ==========================================
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [bulanPilih, setBulanPilih] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewCabang, setViewCabang] = useState<'gabungan' | 'kedai' | 'gerobak'>('gabungan');

  const handleKeyPress = async (num: string) => {
    setErrorAuth('');
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      
      if (newPin.length === 4) {
        try {
          const res = await fetch('/api/owner/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: newPin }),
          });
          const result = await res.json();
          if (res.ok && result.success) {
            setIsAuthorized(true);
          } else {
            setTimeout(() => {
              setErrorAuth(result.error || 'PIN Salah! Akses Ditolak.');
              setPinInput('');
            }, 150);
          }
        } catch (error) {
          setTimeout(() => {
            setErrorAuth('Terjadi kesalahan jaringan.');
            setPinInput('');
          }, 150);
        }
      }
    }
  };

  const handleDelete = () => {
    setPinInput(pinInput.slice(0, -1));
  };

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
    if (isAuthorized) {
      fetchDataOwner(bulanPilih);
    }
  }, [bulanPilih, isAuthorized]);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID').format(val || 0);
  const getLabelBulan = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const filteredBelanjaOwner = (data?.historyBelanjaOwner || []).filter((item: any) => 
    viewCabang === 'gabungan' ? true : item.peruntukan.toLowerCase() === viewCabang
  );

  const filteredPengeluaranKru = (data?.historyPengeluaranKru || []).filter((item: any) => 
    viewCabang === 'gabungan' ? true : item.outlet.toLowerCase() === viewCabang
  );

  // ==========================================
  // 1. LOCK SCREEN PIN 
  // ==========================================
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans select-none">
        <div className="w-full max-w-sm bg-slate-950/40 backdrop-blur-2xl border border-slate-800 p-8 sm:p-10 rounded-[2rem] shadow-2xl flex flex-col items-center space-y-6">
          
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center shadow-md">
            <Lock size={20} />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xs font-black text-white uppercase tracking-wider">Otoritas Pemilik</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Masukkan PIN Akses Console</p>
          </div>

          {/* Indikator Dot Password */}
          <div className="flex justify-center gap-4 py-2">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full border border-slate-700 transition-all duration-150 ${
                  i < pinInput.length ? 'bg-blue-500 border-blue-400 scale-110 shadow-xs shadow-blue-500/50' : 'bg-slate-900'
                }`}
              />
            ))}
          </div>

          {/* Pesan Error */}
          <div className="h-4 flex items-center justify-center">
            {errorAuth && <p className="text-[10px] text-rose-500 font-bold tracking-wide uppercase">{errorAuth}</p>}
          </div>

          {/* Grid Keypad Numpad Simetris */}
          <div className="w-full grid grid-cols-3 gap-3 max-w-[280px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button 
                key={num} 
                onClick={() => handleKeyPress(num)}
                className="aspect-square bg-slate-900/80 border border-slate-800/60 text-white font-black text-base rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-xs"
              >
                {num}
              </button>
            ))}
            <button 
              onClick={() => router.push('/')}
              className="text-slate-500 font-bold text-[10px] hover:text-rose-400 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center"
            >
              Batal
            </button>
            <button 
              onClick={() => handleKeyPress('0')}
              className="aspect-square bg-slate-900/80 border border-slate-800/60 text-white font-black text-base rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-xs"
            >
              0
            </button>
            <button 
              onClick={handleDelete}
              className="text-slate-400 hover:text-white active:scale-95 transition-all flex items-center justify-center"
            >
              <Delete size={18} />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // 2. DASHBOARD UTAMA
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-36 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* HEADER UTAMA BRANDED */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Kopi Bara" className="h-8 sm:h-9 w-auto object-contain" crossOrigin="anonymous" />
            <div className="border-l border-slate-200 pl-3">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 uppercase">Owner Console</h1>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Otoritas Pusat</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsAuthorized(false);
              setPinInput('');
            }} 
            className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all shadow-xs active:scale-95"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-4 sm:space-y-6">
        
        {/* CONTROL DECK CONTROL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between sm:col-span-1">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={14} className="text-blue-600" />
              <input type="date" value={bulanPilih} onChange={(e) => setBulanPilih(e.target.value)} className="text-xs font-black uppercase tracking-wider bg-transparent outline-none text-slate-800 cursor-pointer" />
            </div>
            <button onClick={() => fetchDataOwner(bulanPilih)} className="p-1.5 bg-slate-50 border border-slate-200 rounded-full text-slate-500 hover:text-blue-600 transition-all"><RefreshCw size={12} className={isLoading ? 'animate-spin text-blue-600' : ''} /></button>
          </div>

          <div className="bg-slate-200/60 p-1 rounded-xl grid grid-cols-3 gap-1 text-center font-black text-[10px] uppercase tracking-widest sm:col-span-2 shadow-inner">
            <button onClick={() => setViewCabang('gabungan')} className={`py-2 rounded-lg transition-all duration-200 ${viewCabang === 'gabungan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>Gabungan</button>
            <button onClick={() => setViewCabang('kedai')} className={`py-2 rounded-lg transition-all duration-200 ${viewCabang === 'kedai' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>Kedai</button>
            <button onClick={() => setViewCabang('gerobak')} className={`py-2 rounded-lg transition-all duration-200 ${viewCabang === 'gerobak' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>Gerobak</button>
          </div>
        </div>

        {/* CARD HERO LABA BERSIH */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl sm:rounded-[1.5rem] shadow-xl relative overflow-hidden group border border-white/5">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><ShieldCheck size={14} /> Estimasi Laba Bersih ({viewCabang})</p>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${viewCabang === 'gabungan' ? 'text-emerald-400' : viewCabang === 'kedai' ? 'text-blue-400' : 'text-amber-400'}`}>
            Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.totalLabaGabungan : data[viewCabang].labaBersih) : '0'}
          </h2>
          <div className="mt-4 pt-3 border-t border-white/10 text-[9px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Periode • {getLabelBulan(bulanPilih)}</span>
            <span>Formula: Omset - Beban Kru - Belanja Owner - HPP</span>
          </div>
        </div>

        {/* 🔥 METRICS 4 BENTO PILAR UTAMA (DESAIN BACKGROUND ICON BARU) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Gross Omset */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group min-h-[100px] flex flex-col justify-center">
            {/* Background Icon Raksasa */}
            <div className="absolute -right-3 -bottom-3 opacity-[0.04] transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <TrendingUp size={90} className="text-blue-600" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-blue-500" /> Gross Omset
              </p>
              <h3 className="text-base sm:text-lg font-black text-slate-800">Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.kedai.omset + data.gerobak.omset : data[viewCabang].omset) : '0'}</h3>
            </div>
          </div>

          {/* Card 2: Operasional Kru */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group min-h-[100px] flex flex-col justify-center">
            <div className="absolute -right-3 -bottom-3 opacity-[0.04] transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Wallet size={90} className="text-rose-600" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Wallet size={13} className="text-rose-500" /> Operasional Kru
              </p>
              <h3 className="text-base sm:text-lg font-black text-rose-500">Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.kedai.pengeluaranKru + data.gerobak.pengeluaranKru : data[viewCabang].pengeluaranKru) : '0'}</h3>
            </div>
          </div>

          {/* Card 3: Pengeluaran Owner */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group min-h-[100px] flex flex-col justify-center">
            <div className="absolute -right-3 -bottom-3 opacity-[0.04] transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <UserCheck size={90} className="text-purple-600" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <UserCheck size={13} className="text-purple-500" /> Pengeluaran Owner
              </p>
              <h3 className="text-base sm:text-lg font-black text-purple-600">Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.kedai.belanjaOwner + data.gerobak.belanjaOwner : data[viewCabang].belanjaOwner) : '0'}</h3>
            </div>
          </div>

          {/* Card 4: Modal Bahan (HPP) */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group min-h-[100px] flex flex-col justify-center">
            <div className="absolute -right-3 -bottom-3 opacity-[0.04] transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Boxes size={90} className="text-slate-600" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Boxes size={13} className="text-slate-500" /> Modal Bahan (HPP)
              </p>
              <h3 className="text-base sm:text-lg font-black text-slate-700">Rp {data ? formatIDR(viewCabang === 'gabungan' ? data.kedai.totalNilaiPemakaian + data.gerobak.totalNilaiPemakaian : data[viewCabang].totalNilaiPemakaian) : '0'}</h3>
            </div>
          </div>

        </div>

        {/* SECTION TABLE HISTORI BEREDAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* TABEL A: LOG HISTORI BELANJA OWNER */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[340px]">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5"><History size={14} className="text-purple-600" /> Log Belanja Owner</span>
              <span className="text-[9px] font-black bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">Live Owner Log</span>
            </div>
            
            <div className="divide-y divide-slate-100 text-xs overflow-y-auto flex-1 px-1">
              {filteredBelanjaOwner.length > 0 ? filteredBelanjaOwner.map((item: any, i: number) => (
                <div key={i} className="p-3 flex justify-between items-center hover:bg-slate-50/60 transition-colors rounded-lg mx-1 my-0.5">
                  <div className="min-w-0 flex-1 pr-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.tanggal}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${item.peruntukan === 'Gerobak' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{item.peruntukan}</span>
                    </div>
                    <span className="font-bold text-slate-800 block truncate text-xs sm:text-sm">{item.barang}</span>
                    <span className="text-[10px] text-slate-400 font-medium block">Kategori: {item.kategori}</span>
                  </div>
                  <span className="text-xs font-black text-purple-700 bg-purple-50/80 px-2.5 py-1.5 rounded-lg shrink-0">Rp {formatIDR(item.nominal)}</span>
                </div>
              )) : <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium italic">Tidak ada log belanja owner.</div>}
            </div>
          </div>

          {/* TABEL B: LOG HISTORI PENGELUARAN OPERASIONAL KRU */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[340px]">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5"><History size={14} className="text-rose-600" /> Log Operasional Kru</span>
              <span className="text-[9px] font-black bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-100">Live Cashier Log</span>
            </div>
            
            <div className="divide-y divide-slate-100 text-xs overflow-y-auto flex-1 px-1">
              {filteredPengeluaranKru.length > 0 ? filteredPengeluaranKru.map((item: any, i: number) => (
                <div key={i} className="p-3 flex justify-between items-center hover:bg-slate-50/60 transition-colors rounded-lg mx-1 my-0.5">
                  <div className="min-w-0 flex-1 pr-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.tanggal}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${item.outlet === 'Gerobak' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{item.outlet}</span>
                    </div>
                    <span className="font-bold text-slate-800 block truncate text-xs sm:text-sm">{item.barang}</span>
                    <span className="text-[10px] text-slate-400 font-medium block">Qty: {item.qty} {item.satuan} • Pos: {item.kategori}</span>
                  </div>
                  <span className="text-xs font-black text-rose-600 bg-rose-50/80 px-2.5 py-1.5 rounded-lg shrink-0">Rp {formatIDR(item.nominal)}</span>
                </div>
              )) : <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium italic">Tidak ada log pengeluaran kru.</div>}
            </div>
          </div>

        </div>

        {/* TABEL C: PEMAKAIAN GUDANG (ALOKASI HPP BAHAN BAKU) */}
        {viewCabang !== 'gabungan' && data && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[320px] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <PackageMinus size={14} className={viewCabang === 'kedai' ? 'text-blue-600' : 'text-amber-600'} /> 
                Detail Alokasi & Pemakaian Bahan Baku ({viewCabang})
              </span>
              <span className="text-[9px] font-bold bg-white px-2 py-1 rounded-full border border-slate-200 text-slate-400">HPP Logistik</span>
            </div>
            
            <div className="divide-y divide-slate-50 text-xs overflow-y-auto flex-1 px-1">
              {data[viewCabang].pemakaian.length > 0 ? data[viewCabang].pemakaian.map((item: any, i: number) => (
                <div key={i} className="p-3.5 flex justify-between items-center hover:bg-slate-50/60 transition-colors rounded-lg mx-1 my-0.5">
                  <div className="min-w-0 flex-1 pr-3 space-y-0.5">
                    <span className="font-bold text-slate-800 block truncate text-xs sm:text-sm">{item.nama}</span>
                    <span className="text-[10px] font-semibold text-slate-400 block italic">Kumulatif Beban HPP: Rp {formatIDR(item.nilai)}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg ${viewCabang === 'kedai' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                      {item.qty} Unit Keluar
                    </span>
                  </div>
                </div>
              )) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium italic">Belum ada pemakaian logistik gudang bulan ini.</div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* FIXED FLOATING ACTION DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-xs z-40">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full shadow-2xl p-1.5 px-4 flex justify-between items-center">
          <Link href="/owner/belanja" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-blue-600 p-1.5 group flex-1">
            <Wallet size={16} className="group-hover:scale-110 transition-transform text-slate-400 group-hover:text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">Belanja</span>
          </Link>
          <Link href="/owner/evaluasi" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-blue-600 p-1.5 group flex-1">
            <Award size={16} className="group-hover:scale-110 transition-transform text-slate-400 group-hover:text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">Evaluasi</span>
          </Link>
          <Link href="/owner/slip" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-blue-600 p-1.5 group flex-1">
            <FileDown size={16} className="group-hover:scale-110 transition-transform text-slate-400 group-hover:text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">Slip Gaji</span>
          </Link>
        </div>
      </div>

    </div>
  );
}