'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, RefreshCw, Wallet, HelpCircle, Plus, Trash2, ListChecks } from 'lucide-react';

interface ItemPengeluaran {
  keterangan: string;
  nominal: number;
}

export default function FormPengeluaranGerobak() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [namaKru, setNamaKru] = useState<string>('');
  
  const [daftarPengeluaran, setDaftarPengeluaran] = useState<ItemPengeluaran[]>([]);
  
  const templateKeterangan = ["Es Tube", "Plastik", "Kresek", "Sedotan", "Evaporasi", "UHT", "SKM", "Lainnya"];
  const [keteranganPilih, setKeteranganPilih] = useState<string>(templateKeterangan[0]);
  const [keteranganManual, setKeteranganManual] = useState<string>('');
  const [nominalInput, setNominalInput] = useState<string>('');

  const daftarKru = ["Ruslan", "Elan"];

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };
  const bersihAngka = (teks: string) => parseInt(teks.replace(/\./g, ''), 10) || 0;

  const handleTambahKeDaftar = (e: FormEvent) => {
    e.preventDefault();
    const finalKeterangan = keteranganPilih === 'Lainnya' ? keteranganManual : keteranganPilih;
    
    if (!finalKeterangan.trim()) return alert("Isi keterangan pengeluaran!");
    const nominalMurni = bersihAngka(nominalInput);
    if (nominalMurni <= 0) return alert("Masukkan nominal biaya yang valid!");

    setDaftarPengeluaran([...daftarPengeluaran, { keterangan: finalKeterangan, nominal: nominalMurni }]);
    
    // Reset form input 
    setKeteranganPilih(templateKeterangan[0]);
    setKeteranganManual('');
    setNominalInput('');
  };

  const hapusItem = (index: number) => {
    setDaftarPengeluaran(daftarPengeluaran.filter((_, i) => i !== index));
  };

  const handleSimpanSemua = async () => {
    if (!namaKru) return alert("Pilih Nama Kru terlebih dahulu di bagian atas!");
    if (daftarPengeluaran.length === 0) return alert("Daftar pengeluaran masih kosong!");
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/gerobak/pengeluaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tanggal, namaKru, daftarPengeluaran }),
      });

      if (response.ok) {
        alert("✅ Seluruh biaya pengeluaran Gerobak berhasil dikunci!");
        router.push('/gerobak'); 
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24 font-sans">
      <div className="bg-amber-500 border-b border-amber-600 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/gerobak" className="p-2 bg-amber-400/50 text-amber-950 rounded-full hover:bg-amber-400 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black text-amber-950 uppercase flex items-center gap-1.5 tracking-wider">
            <Wallet size={16} /> Biaya Gerobak
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-6 space-y-5">
        
        {/* METADATA FORM */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-widest">Tanggal</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-widest">Nama Kru</label>
            <select value={namaKru} onChange={(e) => setNamaKru(e.target.value)} className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 outline-none cursor-pointer" required>
              <option value="">-- Kru --</option>
              {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>

        {/* INPUT DRAFT PENGELUARAN */}
        <form onSubmit={handleTambahKeDaftar} className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-500"></div>
          
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-widest">Keterangan Biaya</label>
            <select value={keteranganPilih} onChange={(e) => setKeteranganPilih(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer mb-2">
              {templateKeterangan.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            
            {keteranganPilih === 'Lainnya' && (
              <input type="text" placeholder="Ketik keterangan manual disini..." value={keteranganManual} onChange={(e) => setKeteranganManual(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white animate-in fade-in" required />
            )}
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-rose-400 focus-within:bg-white transition-all">
              <div className="px-3 py-3.5 bg-zinc-100/80 border-r border-zinc-200 min-w-[100px] flex items-center gap-1.5">
                <HelpCircle size={14} className="text-zinc-500" />
                <span className="text-[11px] font-bold text-zinc-600">Nominal</span>
              </div>
              <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
              <input type="text" inputMode="numeric" placeholder="0" value={nominalInput} onChange={(e) => setNominalInput(formatRupiah(e.target.value))} className="w-full py-3 pr-4 bg-transparent text-base font-black text-rose-600 outline-none text-right" required />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-zinc-100 text-zinc-800 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors border border-zinc-300 active:scale-95">
            <Plus size={16} strokeWidth={2.5} /> TAMBAH KE DAFTAR
          </button>
        </form>

        {/* LIST KERANJANG PENGELUARAN */}
        {daftarPengeluaran.length > 0 && (
          <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 text-white space-y-4 shadow-xl animate-in slide-in-from-bottom-2 fade-in">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <ListChecks size={14} /> Daftar Biaya Gerobak
              </span>
              <span className="text-xs font-black text-rose-400">Total: Rp {daftarPengeluaran.reduce((sum, item) => sum + item.nominal, 0).toLocaleString('id-ID')}</span>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {daftarPengeluaran.map((item, idx) => (
                <div key={idx} className="bg-zinc-800/90 p-3.5 rounded-2xl border border-zinc-700/60 text-xs flex justify-between items-center">
                  <h4 className="font-bold text-white capitalize">{item.keterangan}</h4>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-rose-300">Rp {item.nominal.toLocaleString('id-ID')}</span>
                    <button type="button" onClick={() => hapusItem(idx)} className="p-2 text-zinc-500 bg-zinc-800 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={handleSimpanSemua} disabled={isSubmitting} className="w-full py-4 mt-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs tracking-wide rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
              {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              SIMPAN SEMUA {daftarPengeluaran.length} BIAYA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}