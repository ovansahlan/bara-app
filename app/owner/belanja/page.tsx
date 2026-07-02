'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, RefreshCw, Wallet, HelpCircle } from 'lucide-react';

export default function InputBelanjaOwner() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'Operational',
    keterangan: '',
    nominal: ''
  });

  const daftarKategori = ["Operational", "Bar", "Dapur", "Gerobak", "Pelangi"];

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };

  const bersihAngka = (teks: string) => parseInt(teks.replace(/\./g, ''), 10) || 0;

  const handleSimpanBelanja = async (e: FormEvent) => {
    e.preventDefault();
    const nominalMurni = bersihAngka(form.nominal);
    if (nominalMurni <= 0) return alert("Masukkan nominal biaya belanja yang valid!");
    if (!form.keterangan.trim()) return alert("Isi keterangan detail belanja!");

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: form.tanggal,
          kategori: form.kategori,
          keterangan: form.keterangan,
          nominal: nominalMurni
        }),
      });

      if (response.ok) {
        alert("✅ Data pengeluaran owner berhasil masuk ke sheet!");
        setForm({ ...form, keterangan: '', nominal: '' });
        router.push('/owner'); // Balik ke halaman konsol utama owner
      } else {
        alert("❌ Gagal menyimpan data belanja.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/owner')} className="p-2 bg-zinc-100 text-zinc-600 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-sm font-black text-zinc-800 uppercase flex items-center gap-1.5">
            <Wallet size={16} className="text-amber-500" /> Form Belanja Owner
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <form onSubmit={handleSimpanBelanja} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Tanggal</label>
              <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Kategori Internal</label>
              <select value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer" required>
                {daftarKategori.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Keterangan Belanja Lengkap</label>
            <input type="text" placeholder="Contoh: Beli Listrik / Syrup Hazelnut" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white" required />
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:bg-white transition-all">
              <div className="flex items-center gap-1.5 px-3 py-3.5 bg-zinc-100/80 border-r border-zinc-200 min-w-[130px]">
                <HelpCircle size={14} className="text-zinc-500" />
                <span className="text-[11px] font-bold text-zinc-600">Nominal Biaya</span>
              </div>
              <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
              <input type="text" inputMode="numeric" placeholder="0" value={form.nominal} onChange={(e) => setForm({...form, nominal: formatRupiah(e.target.value)})} className="w-full py-3 pr-4 bg-transparent text-sm font-black text-zinc-800 outline-none text-right" required />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className={`w-full py-4 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md ${isSubmitting ? 'bg-zinc-400' : 'bg-zinc-900 hover:bg-zinc-800'}`}>
            {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSubmitting ? 'Mengunci Data...' : 'KUNCI DATA BELANJA OWNER'}
          </button>
        </form>
      </div>
    </div>
  );
}