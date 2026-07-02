'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, RefreshCw, Landmark, HelpCircle, History } from 'lucide-react';

export default function FormKasbon() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rekapKasbon, setRekapKasbon] = useState<Record<string, number>>({});
  
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaKru: '',
    nominal: '',
    keterangan: ''
  });

  const daftarKru = ["Chika", "Nugye", "Diska", "Ibnu"];

  // Ambil rekap total kasbon berjalan bulan ini dari database server
  const fetchRekapKasbon = async (tglStr: string) => {
    try {
      const res = await fetch(`/api/kasbon?tanggal=${tglStr}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setRekapKasbon(data.rekapKasbonKru || {});
      }
    } catch (e) {
      console.error("Gagal memuat rekap kasbon berjalan", e);
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
    if (!form.namaKru) return alert("Pilih nama kru yang melakukan kasbon!");
    if (!form.keterangan.trim()) return alert("Isi keterangan detail alasan kasbon!");
    
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
          keterangan: form.keterangan
        }),
      });

      if (response.ok) {
        alert("✅ Data kasbon berhasil dikunci dan dicetak fisik ke sheet!");
        router.push('/'); 
      } else {
        alert("❌ Gagal menyimpan data kasbon.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kendala jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mencari nilai kasbon bulan ini milik kru terpilih
  const kasbonSebelumnya = form.namaKru ? (rekapKasbon[form.namaKru] || 0) : 0;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black text-zinc-800 uppercase flex items-center gap-1.5">
            <Landmark size={16} className="text-amber-500" /> Catat Kasbon Kru
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <form onSubmit={handleSimpanKasbon} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Tanggal</label>
              <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Nama Kru</label>
              <select value={form.namaKru} onChange={(e) => setForm({...form, namaKru: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer" required>
                <option value="">-- Pilih Kru --</option>
                {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {/* DYNAMIC ALERT: TAMPIL JIKA KRU TERPILIH SUDAH PERNAH KASBON BULAN INI */}
          {form.namaKru && kasbonSebelumnya > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500"></div>
              <History size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-rose-800 block mb-0.5 uppercase tracking-wide text-[9px]">Catatan Kasbon Aktif Bulan Ini</span>
                <p className="text-zinc-600 font-medium leading-relaxed">
                  Perhatian! <b className="text-zinc-900">{form.namaKru}</b> tercatat sudah melakukan kasbon berjalan sebesar <b className="text-rose-600 font-black">Rp {kasbonSebelumnya.toLocaleString('id-ID')}</b> pada bulan ini.
                </p>
              </div>
            </div>
          )}

          {/* KOLOM KETERANGAN YANG DIKEMBALIKAN */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Keterangan Alasan Kasbon</label>
            <input type="text" placeholder="Contoh: Keperluan Bensin / Makan Shift Malam" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white" required />
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-2">Nominal Pinjaman Baru</label>
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:bg-white transition-all">
              <div className="flex items-center gap-1.5 px-3 py-3.5 bg-zinc-100/80 border-r border-zinc-200 min-w-[90px]">
                <HelpCircle size={14} className="text-zinc-500" />
                <span className="text-[11px] font-bold text-zinc-600">Nominal</span>
              </div>
              <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
              <input type="text" inputMode="numeric" placeholder="0" value={form.nominal} onChange={(e) => setForm({...form, nominal: formatRupiah(e.target.value)})} className="w-full py-3 pr-4 bg-transparent text-lg font-black text-zinc-800 outline-none text-right" required />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className={`w-full py-4 mt-2 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${isSubmitting ? 'bg-zinc-400' : 'bg-zinc-900 hover:bg-zinc-800'}`}>
            {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSubmitting ? 'Mengunci Data...' : 'KUNCI ENTRI KASBON BARU'}
          </button>
        </form>
      </div>
    </div>
  );
}