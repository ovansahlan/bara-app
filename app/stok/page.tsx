'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, Box, ArrowDownCircle, ArrowUpCircle, RefreshCw, Layers } from 'lucide-react';

interface Produk {
  id: string;
  nama: string;
  kategori: string;
  satuan: string;
}

export default function ManajemenStokSaaS() {
  const [activeTab, setActiveTab] = useState<'in' | 'out'>('in');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const [dbProduk, setDbProduk] = useState<Produk[]>([]);

  const [meta, setMeta] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    penginput: '',
    idProduk: '',
    kuantiti: '',
    satuan: 'Pcs'
  });

  const [spesifikIn, setSpesifikIn] = useState({ hargaBeliSatuan: '' });
  const [spesifikOut, setSpesifikOut] = useState({ keterangan: 'Bahan Baku Bar', lokasiTujuan: 'Kedai Utama' });

  const daftarKru = ["Chika", "Nugye", "Diska", "Ibnu"];
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

  const handlePilihProduk = (e: ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    const item = dbProduk.find(p => p.id === targetId);
    if (item) {
      setMeta({ ...meta, idProduk: targetId, satuan: item.satuan });
    } else {
      setMeta({ ...meta, idProduk: '', satuan: 'Pcs' });
    }
  };

  const qtyMurni = parseFloat(meta.kuantiti) || 0;
  const hargaBeliMurni = activeTab === 'in' ? bersihAngka(spesifikIn.hargaBeliSatuan) : 0;
  const totalBelanjaMurni = qtyMurni * hargaBeliMurni;

  const handleSimpanStok = async (e: FormEvent) => {
    e.preventDefault();
    if (!meta.penginput) return alert("Pilih Nama Kru penginput!");
    if (!meta.idProduk) return alert("Pilih barang dari gudang!");

    const item = dbProduk.find(p => p.id === meta.idProduk);
    const namaFinalBarang = item ? item.nama : "Tidak Dikenal";

    setIsSubmitting(true);

    const payload = {
      type: activeTab,
      tanggal: meta.tanggal,
      idProduk: meta.idProduk,
      namaBarang: namaFinalBarang,
      kuantiti: qtyMurni,
      penginput: meta.penginput,
      ...(activeTab === 'in' 
        ? { hargaBeliSatuan: hargaBeliMurni, totalBelanja: totalBelanjaMurni }
        : { keterangan: spesifikOut.keterangan, lokasiTujuan: spesifikOut.lokasiTujuan }
      )
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
        setMeta({ ...meta, idProduk: '', kuantiti: '' });
        setSpesifikIn({ hargaBeliSatuan: '' });
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

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200/80 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold tracking-wide text-zinc-800 uppercase flex items-center gap-1.5">
            <Box size={16} className="text-indigo-500" /> Logistik Gudang
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-4">
        
        {/* TAB SWITCHER */}
        <div className="grid grid-cols-2 p-1.5 bg-zinc-200 rounded-2xl border border-zinc-300">
          <button type="button" onClick={() => { setActiveTab('in'); setMeta({...meta, idProduk: '', kuantiti: ''}); }} className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${activeTab === 'in' ? 'bg-white text-emerald-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>
            <ArrowDownCircle size={14} /> Stok Masuk
          </button>
          <button type="button" onClick={() => { setActiveTab('out'); setMeta({...meta, idProduk: '', kuantiti: ''}); }} className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${activeTab === 'out' ? 'bg-white text-rose-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>
            <ArrowUpCircle size={14} /> Stok Keluar
          </button>
        </div>

        {/* ENTRI FORM MUTASI */}
        <form onSubmit={handleSimpanStok} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          
          <div className="grid grid-cols-2 gap-3 pb-4 border-b border-zinc-100">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tanggal</label>
              <input type="date" value={meta.tanggal} onChange={(e) => setMeta({...meta, tanggal: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Penginput</label>
              <select value={meta.penginput} onChange={(e) => setMeta({...meta, penginput: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer" required>
                <option value="">-- Pilih Kru --</option>
                {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {/* MASTER DROP SELECTOR BARANG */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Pilih Barang (Dari DB_Produk)</label>
            <select value={meta.idProduk} onChange={handlePilihProduk} disabled={isLoadingData} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white cursor-pointer" required>
              <option value="">{isLoadingData ? 'Memuat DB_Produk...' : '-- Pilih Item Produk --'}</option>
              {dbProduk.map(p => (
                <option key={p.id} value={p.id}>[{p.id}] {p.nama}</option>
              ))}
            </select>
          </div>

          {/* INPUT QUANTITY DAN SATUAN */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Kuantiti {activeTab === 'in' ? 'Masuk' : 'Keluar'}</label>
              <input type="number" step="any" placeholder="0" value={meta.kuantiti} onChange={(e) => setMeta({...meta, kuantiti: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-black outline-none focus:bg-white" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Satuan</label>
              <input type="text" value={meta.satuan} className="w-full p-3 bg-zinc-100 border border-zinc-200 text-zinc-400 font-bold text-center text-xs rounded-xl outline-none" disabled />
            </div>
          </div>

          {/* AREA FORM KONDISIONAL BERDASARKAN TAB */}
          {activeTab === 'in' ? (
            /* STOCK IN: Butuh input harga modal beli */
            <div className="space-y-3 pt-2 border-t border-dashed border-zinc-200">
              <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-emerald-400 focus-within:bg-white transition-all">
                <div className="flex items-center gap-1.5 px-3 py-3.5 bg-zinc-100/80 border-r border-zinc-200 min-w-[140px]">
                  <Layers size={14} className="text-zinc-500" />
                  <span className="text-[11px] font-bold text-zinc-600">Harga Beli / Satuan</span>
                </div>
                <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
                <input type="text" inputMode="numeric" placeholder="0" value={spesifikIn.hargaBeliSatuan} onChange={(e) => setSpesifikIn({ hargaBeliSatuan: formatRupiah(e.target.value) })} className="w-full py-3 pr-4 bg-transparent text-sm font-black text-zinc-800 outline-none text-right" required />
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase text-emerald-700">Total Belanja</span>
                <span className="text-lg font-black text-emerald-700">Rp {totalBelanjaMurni.toLocaleString('id-ID')}</span>
              </div>
            </div>
          ) : (
            /* STOCK OUT: Hanya butuh Keterangan & Tujuan (Tanpa uang) */
            <div className="space-y-3 pt-2 border-t border-dashed border-zinc-200">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Keterangan / Alasan</label>
                <select value={spesifikOut.keterangan} onChange={(e) => setSpesifikOut({...spesifikOut, keterangan: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 outline-none cursor-pointer">
                  {daftarKeteranganOut.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Lokasi Tujuan Pemakaian</label>
                <select value={spesifikOut.lokasiTujuan} onChange={(e) => setSpesifikOut({...spesifikOut, lokasiTujuan: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 outline-none cursor-pointer">
                  {daftarLokasiTujuan.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting || isLoadingData} className={`w-full py-4 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md mt-4 ${
              isSubmitting || isLoadingData ? 'bg-zinc-400 cursor-not-allowed' : activeTab === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSubmitting ? 'Menyimpan...' : `SIMPAN DATA ${activeTab === 'in' ? 'STOK MASUK' : 'STOK KELUAR'}`}
          </button>
        </form>

      </div>
    </div>
  );
}