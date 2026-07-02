'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, RefreshCw, TrendingUp, HelpCircle } from 'lucide-react';

export default function FormPenjualanGerobak() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaKru: '',
    shift: 'Full Day', // Default shift gerobak
    tunai: '', qris: '', edc: '', grab: ''
  });

  const daftarKru = ["Ruslan", "Elan"];

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };

  const bersihAngka = (teks: string) => parseInt(teks.replace(/\./g, ''), 10) || 0;

  const totalOmset = bersihAngka(form.tunai) + bersihAngka(form.qris) + bersihAngka(form.edc) + bersihAngka(form.grab);

  const handleSimpanOmset = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.namaKru) return alert("Pilih nama kru Gerobak!");
    if (totalOmset <= 0) return alert("Total omset tidak boleh kosong!");

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/gerobak/penjualan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: form.tanggal,
          namaKru: form.namaKru,
          shift: form.shift,
          tunai: bersihAngka(form.tunai),
          qris: bersihAngka(form.qris),
          edc: bersihAngka(form.edc),
          grab: bersihAngka(form.grab),
          total: totalOmset
        }),
      });

      if (response.ok) {
        alert("✅ Omset Gerobak berhasil dikunci ke spreadsheet!");
        router.push('/'); // Bisa diarahkan ke dashboard khusus gerobak nanti
      } else {
        alert("❌ Gagal menyimpan data omset gerobak.");
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
            <TrendingUp size={16} /> Input Omset Gerobak
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <form onSubmit={handleSimpanOmset} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
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

          <div className="space-y-3 pt-3 border-t border-zinc-100">
            {['Tunai', 'QRIS', 'EDC', 'Grab'].map((metode) => {
              const key = metode.toLowerCase() as keyof typeof form;
              return (
                <div key={metode} className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:bg-white transition-all">
                  <div className="px-3 py-3 bg-zinc-100/80 border-r border-zinc-200 min-w-[90px]">
                    <span className="text-[11px] font-bold text-zinc-600">{metode}</span>
                  </div>
                  <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
                  <input type="text" inputMode="numeric" placeholder="0" value={form[key]} onChange={(e) => setForm({...form, [key]: formatRupiah(e.target.value)})} className="w-full py-2.5 pr-4 bg-transparent text-sm font-black text-zinc-800 outline-none text-right" />
                </div>
              )
            })}
          </div>

          <div className="p-4 bg-zinc-900 rounded-xl mt-4 flex justify-between items-center text-white shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Omset Kotor</span>
            <span className="text-lg font-black text-emerald-400">Rp {totalOmset.toLocaleString('id-ID')}</span>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-2 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 bg-amber-600 hover:bg-amber-700">
            {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSubmitting ? 'MENYIMPAN...' : 'KUNCI DATA OMSET'}
          </button>
        </form>
      </div>
    </div>
  );
}