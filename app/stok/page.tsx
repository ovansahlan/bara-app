'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, Box, ArrowDownCircle, ArrowUpCircle, RefreshCw, Layers, Plus, Trash2, ListChecks } from 'lucide-react';

interface Produk {
  id: string;
  nama: string;
  kategori: string;
  satuan: string;
}

interface ItemStok {
  idProduk: string;
  namaBarang: string;
  satuan: string;
  kuantiti: number;
  hargaBeliSatuan: number;
  totalBelanja: number;
}

export default function ManajemenStokSaaS() {
  const [activeTab, setActiveTab] = useState<'in' | 'out'>('in');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const [dbProduk, setDbProduk] = useState<Produk[]>([]);
  const [daftarStok, setDaftarStok] = useState<ItemStok[]>([]); // Menyimpan daftar keranjang multi-input

  const [metaData, setMetaData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    penginput: '',
    keterangan: 'Bahan Baku Bar',
    lokasiTujuan: 'Kedai Utama'
  });

  const [inputItem, setInputItem] = useState({
    idProduk: '',
    kuantiti: '',
    hargaBeliSatuan: ''
  });

  const daftarKru = ["Chika", "Nugye", "Diska", "Ibnu","Novan"];
  const daftarLokasiTujuan = ["Kedai Utama", "Gerobak"]; 
  const daftarKeteranganOut = ["Bahan Baku Bar", "Bahan Baku Dapur", "Kemasan / Packaging", "Bahan Rusak / Kadaluwarsa", "Lainnya"];

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };

  const bersihAngka = (teks: string) => parseInt(teks.replace(/\./g, ''), 10) || 0;

  useEffect(() => {
    const fetchDBProduk = async () => {
      setIsLoadingData(true);
      try {
        const res = await fetch('/api/stok');
        const data = await res.json();
        if (res.ok) {
          setDbProduk(data.masterProduk || []);
        }
      } catch (error) {
        console.error("Gagal menarik DB_Produk", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchDBProduk();
  }, []);

  // Mereset keranjang ketika ganti tab
  const handleTabChange = (newTab: 'in' | 'out') => {
    setActiveTab(newTab);
    setDaftarStok([]);
    setInputItem({ idProduk: '', kuantiti: '', hargaBeliSatuan: '' });
  };

  // 1. Tambah Item ke Draft Keranjang
  const handleTambahItem = (e: FormEvent) => {
    e.preventDefault();
    if (!inputItem.idProduk) return alert("Pilih barang dari gudang terlebih dahulu!");
    if (!inputItem.kuantiti || parseFloat(inputItem.kuantiti) <= 0) return alert("Kuantiti harus diisi!");

    const produkPilihan = dbProduk.find(p => p.id === inputItem.idProduk);
    if (!produkPilihan) return;

    const qty = parseFloat(inputItem.kuantiti);
    const hargaSatuan = activeTab === 'in' ? bersihAngka(inputItem.hargaBeliSatuan) : 0;
    const total = qty * hargaSatuan;

    const itemBaru: ItemStok = {
      idProduk: produkPilihan.id,
      namaBarang: produkPilihan.nama,
      satuan: produkPilihan.satuan,
      kuantiti: qty,
      hargaBeliSatuan: hargaSatuan,
      totalBelanja: total
    };

    setDaftarStok([...daftarStok, itemBaru]);
    setInputItem({ idProduk: '', kuantiti: '', hargaBeliSatuan: '' });
  };

  // 2. Hapus Item dari Keranjang
  const hapusItemKeranjang = (index: number) => {
    setDaftarStok(daftarStok.filter((_, i) => i !== index));
  };

  // 3. Tembak Semua Data Keranjang ke API
  const handleSimpanSemua = async () => {
    if (!metaData.penginput) return alert("Pilih Nama Kru penanggungjawab terlebih dahulu!");
    if (daftarStok.length === 0) return alert("Keranjang stok masih kosong!");

    setIsSubmitting(true);

    const payload = {
      type: activeTab,
      tanggal: metaData.tanggal,
      penginput: metaData.penginput,
      keterangan: metaData.keterangan,
      lokasiTujuan: metaData.lokasiTujuan,
      daftarStok: daftarStok // Mengirim array
    };

    try {
      const response = await fetch('/api/stok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        setDaftarStok([]); 
      } else {
        alert(`❌ Gagal menyimpan: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Terjadi kendala jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalNilaiBelanjaKeranjang = daftarStok.reduce((sum, item) => sum + item.totalBelanja, 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200/80 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black tracking-wide text-zinc-800 uppercase flex items-center gap-1.5">
            <Box size={16} className="text-indigo-500" /> Logistik Gudang
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-4">
        
        {/* TAB SWITCHER */}
        <div className="grid grid-cols-2 p-1.5 bg-zinc-200 rounded-2xl border border-zinc-300">
          <button type="button" onClick={() => handleTabChange('in')} className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${activeTab === 'in' ? 'bg-white text-emerald-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>
            <ArrowDownCircle size={14} /> Stok Masuk
          </button>
          <button type="button" onClick={() => handleTabChange('out')} className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${activeTab === 'out' ? 'bg-white text-rose-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>
            <ArrowUpCircle size={14} /> Stok Keluar
          </button>
        </div>

        {/* 1. METADATA UMUM */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tanggal</label>
              <input type="date" value={metaData.tanggal} onChange={(e) => setMetaData({...metaData, tanggal: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Penginput</label>
              <select value={metaData.penginput} onChange={(e) => setMetaData({...metaData, penginput: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer" required>
                <option value="">-- Pilih Kru --</option>
                {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {activeTab === 'out' && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Alasan</label>
                <select value={metaData.keterangan} onChange={(e) => setMetaData({...metaData, keterangan: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 outline-none cursor-pointer">
                  {daftarKeteranganOut.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tujuan</label>
                <select value={metaData.lokasiTujuan} onChange={(e) => setMetaData({...metaData, lokasiTujuan: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 outline-none cursor-pointer">
                  {daftarLokasiTujuan.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 2. FORM TAMBAH ITEM KERANJANG */}
        <form onSubmit={handleTambahItem} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4 relative overflow-hidden">
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeTab === 'in' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Pilih Barang ke Keranjang</span>
          
          <select value={inputItem.idProduk} onChange={(e) => setInputItem({...inputItem, idProduk: e.target.value})} disabled={isLoadingData} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white cursor-pointer" required>
            <option value="">{isLoadingData ? 'Memuat Database...' : '-- Pilih Item Produk --'}</option>
            {dbProduk.map(p => (
              <option key={p.id} value={p.id}>[{p.id}] {p.nama}</option>
            ))}
          </select>

          <div className={`grid gap-2 ${activeTab === 'in' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">Qty:</span>
              <input type="number" step="any" placeholder="0" value={inputItem.kuantiti} onChange={(e) => setInputItem({...inputItem, kuantiti: e.target.value})} className="w-full p-3 pl-10 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-black outline-none focus:bg-white" required />
            </div>
            
            {activeTab === 'in' && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">Rp/Pcs</span>
                <input type="text" inputMode="numeric" placeholder="Harga" value={inputItem.hargaBeliSatuan} onChange={(e) => setInputItem({...inputItem, hargaBeliSatuan: formatRupiah(e.target.value)})} className="w-full p-3 pl-16 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-black outline-none focus:bg-white text-right" required />
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-colors">
            <Plus size={14} strokeWidth={2.5} /> Tambahkan Ke Draft List
          </button>
        </form>

        {/* 3. DAFTAR KERANJANG (MULTI-INPUT) */}
        {daftarStok.length > 0 && (
          <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 shadow-md text-white space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks size={12} /> Keranjang {activeTab === 'in' ? 'Masuk' : 'Keluar'}
              </span>
              {activeTab === 'in' && (
                <span className="text-sm font-black text-emerald-400">Total: Rp {totalNilaiBelanjaKeranjang.toLocaleString('id-ID')}</span>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {daftarStok.map((item, idx) => (
                <div key={idx} className="bg-zinc-800/90 p-3 rounded-xl border border-zinc-700/60 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">[{item.idProduk}] {item.namaBarang}</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                      Qty: <b className="text-zinc-200">{item.kuantiti} {item.satuan}</b>
                      {activeTab === 'in' && ` × @ Rp ${item.hargaBeliSatuan.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeTab === 'in' && <span className="font-bold text-emerald-300">Rp {item.totalBelanja.toLocaleString('id-ID')}</span>}
                    <button type="button" onClick={() => hapusItemKeranjang(idx)} className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={handleSimpanSemua} disabled={isSubmitting} className={`w-full py-4 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                isSubmitting ? 'bg-zinc-700 cursor-not-allowed' : activeTab === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <CheckCircle2 size={14} /> {isSubmitting ? 'Mengirim Data...' : `SIMPAN SEMUA ${daftarStok.length} ITEM SEKALIGUS`}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}