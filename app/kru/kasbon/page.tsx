'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Wallet, History, Send, RefreshCw, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';

export default function HalamanKasbonKru() {
  const router = useRouter();
  const [profilKru, setProfilKru] = useState<any>(null);
  const [dataKasbon, setDataKasbon] = useState({ totalKasbon: 0, riwayat: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATE BARU: Mengandung TANGGAL
  const [form, setForm] = useState({ 
    tanggal: new Date().toISOString().split('T')[0], 
    nominal: '', 
    keperluan: '' 
  });

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };

  const bersihAngka = (teks: string) => teks.replace(/\./g, '');

  const fetchDataKasbon = async (nama: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/kru/kasbon?nama=${nama}&t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) setDataKasbon(json.data);
    } catch (error) {
      console.error("Gagal memuat kasbon:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const sesi = localStorage.getItem('kru_session');
    if (!sesi) {
      router.push('/kru/login');
      return;
    }
    const user = JSON.parse(sesi);
    setProfilKru(user);
    fetchDataKasbon(user.nama);
  }, [router]);

  const handleAjukanKasbon = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nominal || !form.keperluan) return alert("Lengkapi nominal dan keperluannya!");
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/kru/kasbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: form.tanggal, // Kirim tanggal (bisa direkayasa/backdate)
          nama: profilKru.nama,
          nominal: bersihAngka(form.nominal),
          keperluan: form.keperluan
        })
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        alert("✅ Pengajuan kasbon berhasil dicatat!");
        setForm({ tanggal: new Date().toISOString().split('T')[0], nominal: '', keperluan: '' });
        fetchDataKasbon(profilKru.nama); 
      } else {
        alert("❌ Gagal mengajukan: " + json.error);
      }
    } catch (error) {
      alert("Terjadi kendala jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profilKru) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* HEADER ELEGAN */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/kru/dashboard" className="p-2.5 bg-slate-100 text-slate-500 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <Wallet size={16} className="text-blue-600" /> Dompet Kasbon
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-6">
        
        {/* KARTU SALDO KASBON (DARK THEME WITH AMBER ALERT) */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform rotate-12"><Wallet size={120} /></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 relative z-10 flex items-center gap-1.5">
            <AlertCircle size={12} className="text-amber-500" /> Total Belum Lunas
          </p>
          {isLoading ? (
            <div className="h-10 flex items-center text-sm font-medium animate-pulse text-white relative z-10">Menghitung tagihan...</div>
          ) : (
            <h2 className="text-3xl sm:text-4xl font-black text-amber-400 relative z-10">
              Rp {dataKasbon.totalKasbon.toLocaleString('id-ID')}
            </h2>
          )}
          <p className="text-[9px] text-slate-400 mt-3 relative z-10 font-bold bg-white/5 w-fit px-3 py-1.5 rounded-xl border border-white/10 uppercase tracking-widest">
            Akan memotong gaji bulan berjalan
          </p>
        </div>

        {/* FORM PENGAJUAN (BARA BLUE STYLE) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Send size={14} className="text-blue-600" /> Catat Kasbon Baru
          </h3>
          <form onSubmit={handleAjukanKasbon} className="space-y-4">
            
            {/* INPUT TANGGAL (BISA DI REKAYASA) */}
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Calendar size={12} /> Tanggal Kasbon
              </label>
              <input type="date" required
                value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nominal (Rp)</label>
              <input type="text" inputMode="numeric" placeholder="Contoh: 100.000" required
                value={form.nominal} onChange={(e) => setForm({...form, nominal: formatRupiah(e.target.value)})}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Keperluan</label>
              <input type="text" placeholder="Contoh: Tambahan bayar kos" required
                value={form.keperluan} onChange={(e) => setForm({...form, keperluan: e.target.value})}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
            
            <button type="submit" disabled={isSubmitting || isLoading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white disabled:text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 mt-2">
              {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Wallet size={16} />}
              {isSubmitting ? 'Memproses Data...' : 'Kirim Pengajuan Kasbon'}
            </button>
          </form>
        </div>

        {/* RIWAYAT KASBON */}
        <div className="pb-8">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5 px-1">
            <History size={14} className="text-blue-500" /> Riwayat Penarikan
          </h3>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center text-xs text-slate-400 py-6 animate-pulse">Memuat riwayat...</div>
            ) : dataKasbon.riwayat.length === 0 ? (
              <div className="text-center bg-white rounded-2xl p-6 border border-slate-200 border-dashed">
                <p className="text-xs font-bold text-slate-400">Belum ada riwayat kasbon.</p>
              </div>
            ) : (
              dataKasbon.riwayat.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold mb-0.5 uppercase tracking-widest">{item.tanggal}</p>
                    <p className="text-xs font-bold text-slate-800">{item.keperluan}</p>
                    <div className="mt-2 flex items-center gap-1">
                      {item.status.toLowerCase() === 'belum lunas' ? (
                        <span className="text-[8px] bg-rose-50 text-rose-600 px-2 py-1 rounded-md font-black uppercase tracking-wider flex items-center gap-1 border border-rose-100"><AlertCircle size={10} /> Belum Lunas</span>
                      ) : (
                        <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-100"><CheckCircle2 size={10} /> Lunas</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">Rp {item.nominal.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}