'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, RefreshCw, Wallet, HelpCircle } from 'lucide-react';

export default function FormPengeluaranGerobak() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaKru: '',
    keterangan: '',
    nominal: ''
  });

  const daftarKru = ["Ruslan", "Elan"];

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };

  const bersihAngka = (teks: string) => parseInt(teks.replace(/\./g, ''), 10) || 0;

  const handleSimpanPengeluaran = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.namaKru) return alert("Pilih nama kru Gerobak!");
    if (!form.keterangan.trim()) return alert("Isi keterangan pengeluaran!");
    
    const nominalMurni = bersihAngka(form.nominal);
    if (nominalMurni <= 0) return alert("Nominal tidak valid!");

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/gerobak/pengeluaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: form.tanggal,
          namaKru: form.namaKru,
          keterangan: form.keterangan,
          nominal: nominalMurni
        }),
      });

      if (response.ok) {
        alert("✅ Pengeluaran Gerobak berhasil dicatat!");
        router.push('/'); 
      } else {
        alert("❌ Gagal menyimpan data pengeluaran.");
      }
    } catch (err) {
      alert("❌ Terjadi kendala jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      <div className="bg-amber-500 border-b border-amber-600 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-amber-400/50 text-amber-950 rounded-full">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black text-amber-950 uppercase flex items-center gap-1.5">
            <Wallet size={16} /> Biaya Gerobak
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <form onSubmit={handleSimpanPengeluaran} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Tanggal</label>
              <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Nama Kru</label>
              <select value={form.namaKru} onChange={(e) => setForm({...form, namaKru: e.target.value})} className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 outline-none cursor-pointer" required>
                <option value="">-- Pilih Kru --</option>
                {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Keterangan Biaya</label>
            <input type="text" placeholder="Contoh: Beli Es Batu / Kresek" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white" required />
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Total Biaya</label>
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:bg-white transition-all">
              <div className="px-3 py-3.5 bg-zinc-100/80 border-r border-zinc-200 min-w-[90px] flex items-center gap-1.5">
                <HelpCircle size={14} className="text-zinc-500" />
                <span className="text-[11px] font-bold text-zinc-600">Nominal</span>
              </div>
              <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
              <input type="text" inputMode="numeric" placeholder="0" value={form.nominal} onChange={(e) => setForm({...form, nominal: formatRupiah(e.target.value)})} className="w-full py-3 pr-4 bg-transparent text-lg font-black text-rose-600 outline-none text-right" required />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-2 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 bg-zinc-900 hover:bg-zinc-800">
            {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSubmitting ? 'MENYIMPAN...' : 'KUNCI BIAYA GEROBAK'}
          </button>
        </form>
      </div>
    </div>
  );
}