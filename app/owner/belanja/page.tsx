'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, RefreshCw, Wallet, HelpCircle, Plus, Trash2, ListChecks, Store } from 'lucide-react';

interface ItemBelanja {
  kategori: string;
  keterangan: string;
  nominal: number;
  peruntukan: string;
}

export default function InputBelanjaOwner() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [daftarBelanja, setDaftarBelanja] = useState<ItemBelanja[]>([]);

  const [inputItem, setInputItem] = useState({
    kategori: 'Operational',
    keterangan: '',
    nominal: '',
    peruntukan: 'Kedai' // Default untuk Kedai Utama
  });

  const daftarKategori = ["Operational", "Bar", "Dapur",];

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };

  const bersihAngka = (teks: string) => parseInt(teks.replace(/\./g, ''), 10) || 0;

  const handleTambahKeDaftar = (e: FormEvent) => {
    e.preventDefault();
    const nominalMurni = bersihAngka(inputItem.nominal);
    if (nominalMurni <= 0) return alert("Masukkan nominal biaya belanja yang valid!");
    if (!inputItem.keterangan.trim()) return alert("Isi keterangan detail belanja!");

    const itemBaru: ItemBelanja = {
      kategori: inputItem.kategori,
      keterangan: inputItem.keterangan,
      nominal: nominalMurni,
      peruntukan: inputItem.peruntukan
    };

    setDaftarBelanja([...daftarBelanja, itemBaru]);
    setInputItem({ ...inputItem, keterangan: '', nominal: '' }); // Reset input teks
  };

  const hapusItemBelanja = (index: number) => {
    setDaftarBelanja(daftarBelanja.filter((_, i) => i !== index));
  };

  const handleSimpanSemua = async () => {
    if (daftarBelanja.length === 0) return alert("Daftar belanja masih kosong!");
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tanggal, daftarBelanja }),
      });

      if (response.ok) {
        alert("✅ Seluruh alokasi dana belanja cabang berhasil dikunci!");
        setDaftarBelanja([]);
        router.push('/owner'); 
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
      {/* HEADER */}
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

      <div className="max-w-md mx-auto px-4 mt-6 space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tanggal Transaksi</label>
          <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" required />
        </div>

        {/* INPUT FORM DRAFT */}
        <form onSubmit={handleTambahKeDaftar} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500"></div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Kategori</label>
              <select value={inputItem.kategori} onChange={(e) => setInputItem({...inputItem, kategori: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer" required>
                {daftarKategori.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              {/* DROPDOWN BARU: ALOKASI PERUNTUKAN USAHA */}
              <label className="block text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1 mb-1">
                <Store size={10} /> Alokasi Cabang
              </label>
              <select value={inputItem.peruntukan} onChange={(e) => setInputItem({...inputItem, peruntukan: e.target.value})} className="w-full p-2.5 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs font-black text-indigo-950 outline-none cursor-pointer" required>
                <option value="Kedai">Kedai Utama</option>
                <option value="Gerobak">Cabang Gerobak</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Keterangan Detail Belanja</label>
            <input type="text" placeholder="Contoh: Cup Sealer Gerobak / Bahan Sirup" value={inputItem.keterangan} onChange={(e) => setInputItem({...inputItem, keterangan: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white" required />
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:bg-white transition-all">
              <div className="flex items-center gap-1.5 px-3 py-3.5 bg-zinc-100/80 border-r border-zinc-200 min-w-[130px]">
                <HelpCircle size={14} className="text-zinc-500" />
                <span className="text-[11px] font-bold text-zinc-600">Nominal Biaya</span>
              </div>
              <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
              <input type="text" inputMode="numeric" placeholder="0" value={inputItem.nominal} onChange={(e) => setInputItem({...inputItem, nominal: formatRupiah(e.target.value)})} className="w-full py-3 pr-4 bg-transparent text-sm font-black text-zinc-800 outline-none text-right" required />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 bg-zinc-100 text-zinc-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors border border-zinc-300">
            <Plus size={14} strokeWidth={2.5} /> Tambahkan ke Daftar
          </button>
        </form>

        {/* LIST DRAFT KERANJANG */}
        {daftarBelanja.length > 0 && (
          <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 text-white space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks size={12} /> Daftar Keranjang Belanja
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {daftarBelanja.map((item, idx) => (
                <div key={idx} className="bg-zinc-800/90 p-3 rounded-xl border border-zinc-700/60 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white capitalize">{item.keterangan}</h4>
                    <div className="flex gap-1.5 mt-1">
                      <span className="text-[9px] text-zinc-400 font-bold bg-zinc-700/50 px-1.5 py-0.5 rounded uppercase">{item.kategori}</span>
                      <span className="text-[9px] text-amber-400 font-black bg-amber-950/40 border border-amber-900/40 px-1.5 py-0.5 rounded uppercase">🎯 {item.peruntukan}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-200">Rp {item.nominal.toLocaleString('id-ID')}</span>
                    <button type="button" onClick={() => hapusItemBelanja(idx)} className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={handleSimpanAll} disabled={isSubmitting} className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
              {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              SIMPAN SEMUA {daftarBelanja.length} ITEM BELANJA OWNER
            </button>
          </div>
        )}
      </div>
    </div>
  );
}