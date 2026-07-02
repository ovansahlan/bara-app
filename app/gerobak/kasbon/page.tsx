'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, RefreshCw, Landmark, HelpCircle, History } from 'lucide-react';

export default function FormKasbonGerobak() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rekapKasbon, setRekapKasbon] = useState<Record<string, number>>({});
  
  const [daftarKru, setDaftarKru] = useState<any[]>([]);
  const [loadingKru, setLoadingKru] = useState<boolean>(true);

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaKru: '',
    nominal: '',
    keterangan: ''
  });

  // KODE DINAMIS: Ambil data kru Gerobak yang aktif dari API
  useEffect(() => {
    const fetchKru = async () => {
      try {
        const res = await fetch('/api/kru?cabang=gerobak', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) setDaftarKru(data.kru);
      } catch (e) {
        console.error("Gagal memuat data kru", e);
      } finally {
        setLoadingKru(false);
      }
    };
    fetchKru();
  }, []);

  const fetchRekapKasbon = async (tglStr: string) => {
    try {
      const res = await fetch(`/api/kasbon?tanggal=${tglStr}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setRekapKasbon(data.rekapKasbonKru || {});
    } catch (e) {
      console.error("Gagal memuat rekap kasbon", e);
    }
  };

  useEffect(() => {
    fetchRekapKasbon(form.tanggal);
  }, [form.tanggal]);

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };

  const bersihAngka = (teks: string) => parseInt(teks.replace(/\./g, ''), 10) || 0;

  const handleSimpanKasbon = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.namaKru) return alert("Pilih nama kru Gerobak!");
    if (!form.keterangan.trim()) return alert("Isi keterangan kasbon!");
    
    const nominalMurni = bersihAngka(form.nominal);
    if (nominalMurni <= 0) return alert("Masukkan nominal kasbon yang valid!");

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/kasbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: form.tanggal,
          namaKru: form.namaKru,
          nominal: form.nominal,
          keterangan: `(Gerobak) ${form.keterangan}`
        }),
      });

      if (response.ok) {
        alert("✅ Data kasbon berhasil dikunci ke spreadsheet utama!");
        router.push('/gerobak'); 
      } else {
        alert("❌ Gagal menyimpan data kasbon.");
      }
    } catch (err) {
      alert("❌ Terjadi kendala jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const kasbonSebelumnya = form.namaKru ? (rekapKasbon[form.namaKru] || 0) : 0;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24 font-sans">
      <div className="bg-amber-500 border-b border-amber-600 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/gerobak" className="p-2.5 bg-amber-400/50 text-amber-950 rounded-full">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black text-amber-950 uppercase flex items-center gap-1.5 tracking-wider">
            <Landmark size={16} /> Kasbon Gerobak
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-6">
        <form onSubmit={handleSimpanKasbon} className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-widest">Tanggal</label>
              <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-widest">Nama Kru</label>
              <select value={form.namaKru} onChange={(e) => setForm({...form, namaKru: e.target.value})} className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 outline-none cursor-pointer" required>
                <option value="">{loadingKru ? 'Memuat...' : '-- Pilih --'}</option>
                {daftarKru.map(k => <option key={k.id} value={k.nama}>{k.nama}</option>)}
              </select>
            </div>
          </div>

          {form.namaKru && kasbonSebelumnya > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs flex items-start gap-3 animate-in fade-in duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-500"></div>
              <History size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-rose-800 block mb-1 uppercase tracking-wider text-[10px]">Riwayat Kasbon Bulan Ini</span>
                <p className="text-zinc-600 font-medium leading-relaxed">
                  <b className="text-zinc-900">{form.namaKru}</b> sudah mengambil kasbon sebesar <b className="text-rose-600 font-black">Rp {kasbonSebelumnya.toLocaleString('id-ID')}</b> bulan ini.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-widest">Alasan / Keterangan</label>
            <input type="text" placeholder="Contoh: Tambahan Bensin" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white" required />
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-widest">Nominal Tarik Tunai</label>
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:bg-white transition-all">
              <div className="px-3 py-4 bg-zinc-100/80 border-r border-zinc-200 min-w-[100px] flex items-center gap-1.5">
                <HelpCircle size={14} className="text-zinc-500" />
                <span className="text-[11px] font-bold text-zinc-600">Total Rp</span>
              </div>
              <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
              <input type="text" inputMode="numeric" placeholder="0" value={form.nominal} onChange={(e) => setForm({...form, nominal: formatRupiah(e.target.value)})} className="w-full py-3 pr-4 bg-transparent text-lg font-black text-zinc-800 outline-none text-right" required />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || loadingKru} className="w-full py-4 mt-2 text-white font-black text-xs tracking-wide rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50">
            {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {isSubmitting ? 'MENGUNCI...' : 'KUNCI ENTRI KASBON'}
          </button>
        </form>
      </div>
    </div>
  );
}