'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, TrendingUp, Wallet, Box, 
  RefreshCw, Calendar, ArrowUpRight, ArrowDownRight, 
  CreditCard, Smartphone, Banknote, History, Camera, 
  Landmark, Lock, KeyRound, X, Layers, MessageCircle, 
  Store, BookOpen, ShieldCheck, ChevronRight
} from 'lucide-react';
// IMPORT SENJATA GRAFIK BARU KITA
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

export default function HomeDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [tanggalPilih, setTanggalPilih] = useState<string>(new Date().toISOString().split('T')[0]);

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const fetchData = async (tanggalFilter: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard?tanggal=${tanggalFilter}`);
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(tanggalPilih); 
  }, [tanggalPilih]);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID').format(val || 0);

  const getNamaBulan = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '000000') {
      setShowAuthModal(false);
      router.push('/owner'); 
    } else {
      setAuthError('Sandi tidak valid.');
      setTimeout(() => setAuthError(''), 2000);
    }
  };

  // DATA DUMMY SEMENTARA UNTUK GRAFIK (Akan terganti otomatis kalau API sudah di-update)
  const grafikTrend = data?.trendOmset || [
    { hari: 'H-6', omset: 320000 },
    { hari: 'H-5', omset: 410000 },
    { hari: 'H-4', omset: 290000 },
    { hari: 'H-3', omset: 550000 },
    { hari: 'H-2', omset: 480000 },
    { hari: 'Kemarin', omset: 620000 },
    { hari: 'Hari Ini', omset: data?.omset?.total || 750000 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* GLOBAL HEADER DENGAN LOGO */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/logo.png" 
              alt="Logo Kopi Bara" 
              className="h-12 sm:h-12 w-auto object-contain drop-shadow-sm" 
              crossOrigin="anonymous"
            />
            <div className="hidden sm:block border-l-2 border-slate-200 pl-3 ml-1">
              <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">Kedai Pusat</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Command Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 sm:px-3 py-1.5 rounded-full border border-slate-200/40">
              <Calendar size={12} className="text-blue-600" />
              <input 
                type="date" 
                value={tanggalPilih}
                onChange={(e) => setTanggalPilih(e.target.value)}
                className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-transparent outline-none cursor-pointer text-slate-700 w-[85px] sm:w-auto"
              />
            </div>
            <button onClick={() => fetchData(tanggalPilih)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95 shadow-sm">
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* SECURITY AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full bg-slate-50 transition-colors">
              <X size={18} />
            </button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 border border-blue-100/50">
              <KeyRound size={20} />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-0.5 tracking-tight">Otoritas Finansial</h3>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 mb-4 sm:mb-5">Masukkan kode akses owner.</p>
            <form onSubmit={handleOwnerLogin} className="space-y-3 sm:space-y-4">
              <input 
                type="password" inputMode="numeric" placeholder="••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-center text-xl sm:text-2xl tracking-[0.5em] font-black outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                autoFocus
              />
              {authError && <p className="text-[10px] text-rose-500 font-bold text-center">{authError}</p>}
              <button type="submit" className="w-full py-3.5 sm:py-4 bg-slate-900 text-white font-black text-[10px] sm:text-xs tracking-widest uppercase rounded-xl sm:rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
                Buka Gerbang Akses
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLUID BENTO WORKSPACE AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 sm:mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          
          {/* KOLOM KIRI (UTAMA - SPAN 2) */}
          <div className="md:col-span-2 flex flex-col gap-4 sm:gap-6 h-full">
            
            {/* ROW 1: CORE FINANSIAL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-none">
              <div className="sm:col-span-2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between group h-full">
                <div className="absolute top-0 right-0 opacity-[0.03] transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <Landmark size={150} />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Wallet size={12} /> Estimasi Kas Di Laci
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Rp {data ? formatIDR(data.saldoLaciKasir) : '0'}
                  </h2>
                </div>
                <div className="text-[8px] sm:text-[9px] text-slate-400 bg-white/5 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl w-fit font-bold uppercase tracking-wider mt-4">
                  Net Akumulasi • {data ? getNamaBulan(tanggalPilih) : '-'}
                </div>
              </div>

              <button onClick={() => setShowAuthModal(true)} className="bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-row sm:flex-col items-center sm:items-start justify-between group active:scale-95 gap-3 sm:gap-0 text-left h-full">
                <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0 w-full">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm sm:mb-4">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Manager &amp; HRD</p>
                    <h4 className="text-xs sm:text-sm font-black text-slate-800">Portal Owner</h4>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform shrink-0 sm:hidden" />
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform hidden sm:block w-full text-right" />
              </button>
            </div>

            {/* ROW 2: MINI METRICS GRID */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-none">
              <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5 sm:mb-1">Omset Hari Ini</span>
                <p className="text-sm sm:text-lg font-black text-slate-800">Rp {data ? formatIDR(data.omset.total) : '0'}</p>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5 sm:mb-1">Pengeluaran Laci</span>
                <p className="text-sm sm:text-lg font-black text-rose-500">Rp {data ? formatIDR(data.totalKeluar) : '0'}</p>
              </div>
            </div>

            {/* ROW 3: AKSI OUTLET */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-none">
              <Link href="/aset-gudang" className="bg-white border border-slate-200 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:border-blue-300 transition-all flex flex-col items-center sm:items-start justify-center sm:justify-between group text-center sm:text-left gap-2 sm:gap-0 h-full">
                <div className="p-2 sm:p-2.5 bg-slate-50 text-slate-500 rounded-lg sm:rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0"><Layers size={16} /></div>
                <div className="w-full sm:mt-2">
                  <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest sm:mb-0.5 truncate">Nilai Gudang</p>
                  <p className="text-[9px] sm:text-xs font-black text-slate-800 truncate">Rp {data ? formatIDR(data.nilaiAsetGudang) : '0'}</p>
                </div>
              </Link>
              <Link href="/report" className="bg-white border border-slate-200 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:border-blue-300 transition-all flex flex-col items-center sm:items-start justify-center sm:justify-between group text-center sm:text-left gap-2 sm:gap-0 h-full">
                <div className="p-2 sm:p-2.5 bg-slate-50 text-slate-500 rounded-lg sm:rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0"><MessageCircle size={16} /></div>
                <div className="w-full sm:mt-2">
                  <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest sm:mb-0.5 truncate">Laporan</p>
                  <p className="text-[9px] sm:text-xs font-black text-slate-800 truncate">Kirim WA</p>
                </div>
              </Link>
              <Link href="/revisi" className="bg-white border border-slate-200 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm hover:border-blue-300 transition-all flex flex-col items-center sm:items-start justify-center sm:justify-between group text-center sm:text-left gap-2 sm:gap-0 h-full">
                <div className="p-2 sm:p-2.5 bg-slate-50 text-slate-500 rounded-lg sm:rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0"><History size={16} /></div>
                <div className="w-full sm:mt-2">
                  <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest sm:mb-0.5 truncate">Koreksi Log</p>
                  <p className="text-[9px] sm:text-xs font-black text-slate-800 truncate">Revisi Typo</p>
                </div>
              </Link>
            </div>

            {/* ROW 4: STRUKTUR STRATEGI PEMBAYARAN */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-none">
              <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard size={14} className="text-slate-400" /> Arus Kas Masuk
                </span>
              </div>
              <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0"><Banknote size={14} /></div>
                  <div className="min-w-0"><p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase truncate">Tunai</p><p className="text-[10px] sm:text-xs font-black text-slate-700 truncate">Rp {data ? formatIDR(data.omset.tunai) : '0'}</p></div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0"><Smartphone size={14} /></div>
                  <div className="min-w-0"><p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase truncate">QRIS</p><p className="text-[10px] sm:text-xs font-black text-slate-700 truncate">Rp {data ? formatIDR(data.omset.qris) : '0'}</p></div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0"><Landmark size={14} /></div>
                  <div className="min-w-0"><p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase truncate">EDC/Bank</p><p className="text-[10px] sm:text-xs font-black text-slate-700 truncate">Rp {data ? formatIDR(data.omset.edc) : '0'}</p></div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0"><ArrowUpRight size={14} /></div>
                  <div className="min-w-0"><p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase truncate">Grab</p><p className="text-[10px] sm:text-xs font-black text-slate-700 truncate">Rp {data ? formatIDR(data.omset.grab) : '0'}</p></div>
                </div>
              </div>
            </div>

            {/* NEW ROW 5: GRAFIK TREND OMSET MINGGUAN */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-none">
              <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-blue-500" /> Tren Omset Harian
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">7 Hari Terakhir</span>
              </div>
              <div className="p-4 h-[180px] sm:h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={grafikTrend} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip
                      formatter={(value: any) => [`Rp ${formatIDR(Number(value || 0))}`, 'Omset']}
                      labelStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}
                      itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#1e293b' }}
                    />
                    <XAxis dataKey="hari" hide />
                    <Area type="monotone" dataKey="omset" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorOmset)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN (LOGISTIK & PORTAL - OTOMATIS MELAR MENGIKUTI TINGGI KIRI) */}
          <div className="flex flex-col gap-4 sm:gap-6 h-full">
            
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 sm:gap-3 shrink-0">
              <Link href="/gerobak" className="bg-white border border-slate-200 p-3 sm:p-4 rounded-xl shadow-sm hover:border-blue-400 flex items-center justify-between group transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><Store size={14} /></div>
                  <span className="text-[10px] sm:text-xs font-black text-slate-800">Gerobak</span>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
              </Link>
              <Link href="/kru/login" className="bg-white border border-slate-200 p-3 sm:p-4 rounded-xl shadow-sm hover:border-blue-400 flex items-center justify-between group transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><BookOpen size={14} /></div>
                  <span className="text-[10px] sm:text-xs font-black text-slate-800">Portal Kru</span>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
              </Link>
            </div>

            {/* LOGISTIK BOXES (FLEX-1: AKAN MELAR MENUTUPI SPACE KOSONG) */}
            <div className="flex flex-col flex-1 gap-3 sm:gap-4 min-h-[300px] md:min-h-0">
              <div className="flex items-center gap-1.5 px-1 text-slate-400 shrink-0">
                <Box size={12} />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Aktivitas Logistik</span>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="p-2.5 sm:p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 shrink-0">
                  <ArrowDownRight size={14} className="text-blue-600 shrink-0" />
                  <span className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-wider">Barang Masuk (In)</span>
                </div>
                <div className="divide-y divide-slate-50 text-[10px] sm:text-[11px] overflow-y-auto flex-1 h-0">
                  {data?.historyStokIn && data.historyStokIn.length > 0 ? data.historyStokIn.map((row: any, i: number) => (
                    <div key={i} className="p-2.5 sm:p-3 flex justify-between items-center hover:bg-slate-50/60 transition-colors">
                      <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                        <span className="font-bold text-slate-800 truncate">{row[2]}</span>
                        <span className="text-[7px] sm:text-[8px] text-slate-400 truncate">Oleh {row[6]}</span>
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">{row[3]} Pcs</span>
                    </div>
                  )) : (
                    <p className="p-3 text-center text-[9px] sm:text-[10px] text-slate-400 italic">Belum ada barang masuk.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="p-2.5 sm:p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 shrink-0">
                  <ArrowUpRight size={14} className="text-slate-400 shrink-0" />
                  <span className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-wider">Barang Keluar (Out)</span>
                </div>
                <div className="divide-y divide-slate-50 text-[10px] sm:text-[11px] overflow-y-auto flex-1 h-0">
                  {data?.historyStokOut && data.historyStokOut.length > 0 ? data.historyStokOut.map((row: any, i: number) => (
                    <div key={i} className="p-2.5 sm:p-3 flex justify-between items-center hover:bg-slate-50/60 transition-colors">
                      <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                        <span className="font-bold text-slate-800 truncate">{row[2]}</span>
                        <span className="text-[7px] sm:text-[8px] text-slate-400 truncate">Tujuan: {row[8] || row[4]}</span>
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">-{row[3]} Pcs</span>
                    </div>
                  )) : (
                    <p className="p-3 text-center text-[9px] sm:text-[10px] text-slate-400 italic">Belum ada barang keluar.</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* FLOATING BOTTOM NAV */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[90%] max-w-md z-40">
        <div className="bg-white/95 backdrop-blur-lg border border-slate-200/80 rounded-full shadow-xl shadow-slate-200/50 p-1.5 sm:p-2 px-5 sm:px-6 flex justify-between items-center">
          <Link href="/" className="flex flex-col items-center gap-1 text-blue-600 p-1.5 sm:p-2">
            <LayoutDashboard size={18} strokeWidth={2.5} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Home</span>
          </Link>
          <Link href="/absen" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 p-1.5 sm:p-2 transition-colors">
            <Camera size={18} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Absen</span>
          </Link>
          <Link href="/penjualan" className="flex flex-col items-center gap-1 text-blue-600 p-1.5 sm:p-2 transform scale-110 -mt-3 sm:-mt-5">
             <div className="bg-blue-600 text-white p-3 sm:p-3.5 rounded-full shadow-lg shadow-blue-600/30 ring-4 ring-slate-50 transition-transform active:scale-95">
               <TrendingUp size={20} strokeWidth={3} />
             </div>
          </Link>
          <Link href="/stok" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 p-1.5 sm:p-2 transition-colors">
            <Box size={18} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Stok</span>
          </Link>
          <Link href="/pengeluaran" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 p-1.5 sm:p-2 transition-colors">
            <Wallet size={18} />
            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Belanja</span>
          </Link>
        </div>
      </div>

    </div>
  );
}