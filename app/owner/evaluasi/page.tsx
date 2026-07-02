'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Award, ShieldCheck, RefreshCw, MessageSquareQuote } from 'lucide-react';

export default function FormEvaluasiOwner() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [daftarKru, setDaftarKru] = useState<any[]>([]);
  const [loadingKru, setLoadingKru] = useState<boolean>(true);

  const [form, setForm] = useState({
    namaKru: '',
    tunjangan: '',
    overtime: '', 
    catatan: ''
  });

  // Ambil semua master kru aktif (Kedai + Gerobak) dari API
  useEffect(() => {
    const fetchSemuaKru = async () => {
      try {
        const res = await fetch('/api/kru', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) setDaftarKru(data.kru);
      } catch (e) {
        console.error("Gagal memuat data kru", e);
      } finally {
        setLoadingKru(false);
      }
    };
    fetchSemuaKru();
  }, []);

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };

  const bersihAngka = (teks: string) => teks.replace(/\./g, '');

  const handleSimpanEvaluasi = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.namaKru) return alert("Pilih nama kru yang ingin dievaluasi!");
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/owner/evaluasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaKru: form.namaKru,
          tunjangan: bersihAngka(form.tunjangan) || '0',
          overtime: bersihAngka(form.overtime) || '0', 
          catatan: form.catatan
        }),
      });

      if (response.ok) {
        alert(`✅ Evaluasi & Overtime untuk ${form.namaKru} Berhasil Dikunci!`);
        setForm({ namaKru: '', tunjangan: '', overtime: '', catatan: '' });
        router.push('/');
      } else {
        alert("❌ Gagal menyimpan data evaluasi.");
      }
    } catch (err) {
      alert("❌ Terjadi kendala jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 font-sans flex flex-col justify-center px-4">
      <div className="w-full max-w-md mx-auto space-y-5">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="p-2.5 bg-slate-800 text-slate-400 rounded-full hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
            <Award size={16} className="text-indigo-400" /> Konsol Evaluasi Owner
          </h1>
          <div className="w-10 h-10"></div>
        </div>

        {/* CONTAINER FORM */}
        <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSimpanEvaluasi} className="space-y-5">
            
            {/* 1. PILIH KRU */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Anggota Tim</label>
              <select 
                value={form.namaKru} 
                onChange={(e) => setForm({...form, namaKru: e.target.value})}
                className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-bold text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                required
              >
                <option value="">{loadingKru ? 'Memuat database tim...' : '-- Pilih Anggota --'}</option>
                {daftarKru.map(k => (
                  <option key={k.id} value={k.nama}>{k.nama.toUpperCase()} ({k.cabang})</option>
                ))}
              </select>
            </div>

            {/* 2. INPUT TUNJANGAN OBJEKTIF */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nominal Insentif / Tunjangan Kinerja</label>
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition-all">
                <div className="px-4 py-3.5 bg-slate-950 text-slate-500 border-r border-slate-700 text-xs font-bold min-w-[70px] text-center">
                  BONUS
                </div>
                <div className="pl-3 pr-1 text-slate-400 font-bold text-xs">Rp</div>
                <input 
                  type="text" inputMode="numeric" placeholder="0"
                  value={form.tunjangan}
                  onChange={(e) => setForm({...form, tunjangan: formatRupiah(e.target.value)})}
                  className="w-full py-3.5 pr-4 bg-transparent text-base font-black text-emerald-400 outline-none text-right tracking-wide"
                />
              </div>
            </div>

            {/* 3. INPUT UANG OVERTIME */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Upah Overtime (Lembur)</label>
              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition-all">
                <div className="px-4 py-3.5 bg-slate-950 text-slate-500 border-r border-slate-700 text-xs font-bold min-w-[70px] text-center">
                  LEMBUR
                </div>
                <div className="pl-3 pr-1 text-slate-400 font-bold text-xs">Rp</div>
                <input 
                  type="text" inputMode="numeric" placeholder="0"
                  value={form.overtime}
                  onChange={(e) => setForm({...form, overtime: formatRupiah(e.target.value)})}
                  className="w-full py-3.5 pr-4 bg-transparent text-base font-black text-amber-400 outline-none text-right tracking-wide"
                />
              </div>
            </div>

            {/* 4. INPUT CATATAN / FEEDBACK BULANAN */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catatan Kinerja (Muncul di Slip)</label>
              <div className="relative flex items-start bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition-all">
                <div className="pl-4 pt-4 pr-2 text-slate-500">
                  <MessageSquareQuote size={16} />
                </div>
                <textarea 
                  rows={3}
                  placeholder="Contoh: Bulan ini performa pelayananmu sangat memuaskan, pertahankan!"
                  value={form.catatan}
                  onChange={(e) => setForm({...form, catatan: e.target.value})}
                  className="w-full py-3.5 pr-4 bg-transparent text-xs font-medium text-slate-300 outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* BUTTON SUBMIT */}
            <button 
              type="submit" 
              disabled={isSubmitting || loadingKru}
              className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white font-black text-xs tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} strokeWidth={2.5} />}
              {isSubmitting ? 'MENGUNCI EVALUASI...' : 'KUNCI & KIRIM KE SLIP GAJI'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}