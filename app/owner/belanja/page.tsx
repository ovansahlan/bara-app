'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, RefreshCw, Wallet, HelpCircle, Plus, Trash2, ListChecks } from 'lucide-react';

interface ItemBelanja {
  kategori: string;
  keterangan: string;
  nominal: number;
}

export default function InputBelanjaOwner() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // State untuk menampung daftar keranjang (multi-input)
  const [daftarBelanja, setDaftarBelanja] = useState<ItemBelanja[]>([]);

  // State untuk form input individual
  const [inputItem, setInputItem] = useState({
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

  // 1. Tambah ke Draft
  const handleTambahKeDaftar = (e: FormEvent) => {
    e.preventDefault();
    const nominalMurni = bersihAngka(inputItem.nominal);
    if (nominalMurni <= 0) return alert("Masukkan nominal biaya belanja yang valid!");
    if (!inputItem.keterangan.trim()) return alert("Isi keterangan detail belanja!");

    const itemBaru: ItemBelanja = {
      kategori: inputItem.kategori,
      keterangan: inputItem.keterangan,
      nominal: nominalMurni
    };

    setDaftarBelanja([...daftarBelanja, itemBaru]);
    
    // Kosongkan form input setelah masuk keranjang, biarkan kategori tetap sama
    setInputItem({ ...inputItem, keterangan: '', nominal: '' });
  };

  // 2. Hapus dari Draft
  const hapusItemBelanja = (index: number) => {
    setDaftarBelanja(daftarBelanja.filter((_, i) => i !== index));
  };

  // 3. Simpan Semua ke Server
  const handleSimpanSemua = async () => {
    if (daftarBelanja.length === 0) return alert("Daftar belanja masih kosong!");
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: tanggal,
          daftarBelanja: daftarBelanja
        }),
      });

      if (response.ok) {
        alert("✅ Seluruh data belanja owner berhasil dikunci ke spreadsheet!");
        setDaftarBelanja([]);
        router.push('/owner'); 
      } else {
        alert("❌ Gagal menyimpan data belanja.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kendala jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalNilaiBelanja = daftarBelanja.reduce((sum, item) => sum + item.nominal, 0);

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
        
        {/* INPUT TANGGAL (METADATA UTAMA) */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tanggal Transaksi</label>
          <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" required />
        </div>

        {/* FORM INPUT DRAFT */}
        <form onSubmit={handleTambahKeDaftar} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500"></div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Catat Item Belanja Baru</span>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Kategori</label>
            <select value={inputItem.kategori} onChange={(e) => setInputItem({...inputItem, kategori: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer" required>
              {daftarKategori.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Keterangan Detail Belanja</label>
            <input type="text" placeholder="Contoh: Pembelian Neon Box / Biji Kopi" value={inputItem.keterangan} onChange={(e) => setInputItem({...inputItem, keterangan: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white" required />
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

        {/* AREA KERANJANG (TAMPIL JIKA ADA ISINYA) */}
        {daftarBelanja.length > 0 && (
          <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 shadow-md text-white space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks size={12} /> Daftar Belanja
              </span>
              <span className="text-sm font-black text-amber-400">Total: Rp {totalNilaiBelanja.toLocaleString('id-ID')}</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {daftarBelanja.map((item, idx) => (
                <div key={idx} className="bg-zinc-800/90 p-3 rounded-xl border border-zinc-700/60 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white capitalize">{item.keterangan}</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium bg-zinc-700/50 w-fit px-1.5 py-0.5 rounded">
                      {item.kategori}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-200">Rp {item.nominal.toLocaleString('id-ID')}</span>
                    <button type="button" onClick={() => hapusItemBelanja(idx)} className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={handleSimpanSemua} disabled={isSubmitting} className={`w-full py-4 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                isSubmitting ? 'bg-zinc-700 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <CheckCircle2 size={14} /> {isSubmitting ? 'Mengirim Data...' : `SIMPAN SEMUA ${daftarBelanja.length} ITEM BELANJA`}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}