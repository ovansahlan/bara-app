'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Wallet, History, Send, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function HalamanKasbonKru() {
  const router = useRouter();
  const [profilKru, setProfilKru] = useState<any>(null);
  const [dataKasbon, setDataKasbon] = useState({ totalKasbon: 0, riwayat: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({ nominal: '', keperluan: '' });

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
          nama: profilKru.nama,
          nominal: bersihAngka(form.nominal),
          keperluan: form.keperluan
        })
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        alert("✅ Pengajuan kasbon berhasil dicatat!");
        setForm({ nominal: '', keperluan: '' });
        fetchDataKasbon(profilKru.nama); // Refresh data riwayat otomatis
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
    <div className="min-h-screen bg-zinc-900 text-zinc-100 pb-20 font-sans p-4 pt-8">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/kru/dashboard" className="p-2.5 bg-zinc-800 text-zinc-400 rounded-full hover:text-white transition-colors border border-zinc-700">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xs font-black tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
            <Wallet size={16} className="text-amber-500" /> Dompet Kasbon
          </h1>
          <div className="w-10 h-10"></div>
        </div>

        {/* KARTU SALDO KASBON */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-3xl shadow-xl shadow-orange-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={100} /></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-100 mb-1 relative z-10">Total Belum Lunas</p>
          {isLoading ? (
            <div className="h-10 flex items-center text-sm font-medium animate-pulse text-white relative z-10">Menghitung tagihan...</div>
          ) : (
            <h2 className="text-3xl font-black text-white relative z-10">
              Rp {dataKasbon.totalKasbon.toLocaleString('id-ID')}
            </h2>
          )}
          <p className="text-[9px] text-orange-200 mt-2 relative z-10 font-medium">Nominal ini akan memotong gaji bulan berjalan.</p>
        </div>

        {/* FORM PENGAJUAN */}
        <div className="bg-zinc-800/80 p-5 rounded-3xl border border-zinc-700/50">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5 border-b border-zinc-700 pb-2">
            <Send size={14} className="text-indigo-400" /> Ajukan Kasbon Baru
          </h3>
          <form onSubmit={handleAjukanKasbon} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Nominal (Rp)</label>
              <input type="text" inputMode="numeric" placeholder="Contoh: 100.000" required
                value={form.nominal} onChange={(e) => setForm({...form, nominal: formatRupiah(e.target.value)})}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-bold text-white outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Keperluan</label>
              <input type="text" placeholder="Contoh: Tambahan bayar kos" required
                value={form.keperluan} onChange={(e) => setForm({...form, keperluan: e.target.value})}
                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-medium text-white outline-none focus:border-amber-500"
              />
            </div>
            <button type="submit" disabled={isSubmitting || isLoading} className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 text-zinc-900 disabled:text-zinc-500 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all">
              {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Wallet size={16} />}
              {isSubmitting ? 'Memproses...' : 'Kirim Pengajuan'}
            </button>
          </form>
        </div>

        {/* RIWAYAT KASBON */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-1.5 px-1">
            <History size={14} /> Riwayat Kasbon
          </h3>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center text-xs text-zinc-600 py-4">Memuat riwayat...</div>
            ) : dataKasbon.riwayat.length === 0 ? (
              <div className="text-center bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700 border-dashed">
                <p className="text-xs text-zinc-500">Belum ada riwayat kasbon.</p>
              </div>
            ) : (
              dataKasbon.riwayat.map((item: any, idx: number) => (
                <div key={idx} className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold mb-0.5">{item.tanggal}</p>
                    <p className="text-xs font-medium text-zinc-300">{item.keperluan}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      {item.status.toLowerCase() === 'belum lunas' ? (
                        <span className="text-[8px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1"><AlertCircle size={10} /> Belum Lunas</span>
                      ) : (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={10} /> Lunas</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">Rp {item.nominal.toLocaleString('id-ID')}</p>
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