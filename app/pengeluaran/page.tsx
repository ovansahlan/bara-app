'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, CheckCircle2, ShoppingCart, Wallet } from 'lucide-react';

interface BelanjaItem {
  namaItem: string;
  kuantiti: number;
  satuan: string;
  hargaSatuanAsli: number;
  nominalAsli: number;
  hargaSatuanDisplay: string;
  nominalDisplay: string;
}

interface MasterBelanja {
  id: string;
  nama: string;
  satuanDefault: string;
}

export default function PengeluaranKasSaaS() {
  const [metaData, setMetaData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    penginput: '',
    kategori: 'Bar' 
  });

  const [inputItem, setInputItem] = useState({
    idItem: '',
    namaManual: '', 
    kuantiti: '',
    satuan: '',
    hargaSatuan: ''
  });

  const [daftarBelanja, setDaftarBelanja] = useState<BelanjaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [daftarKru, setDaftarKru] = useState<any[]>([]);
  const [loadingKru, setLoadingKru] = useState<boolean>(true);

  useEffect(() => {
    const fetchKru = async () => {
      try {
        const res = await fetch('/api/kru?cabang=kedai', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) setDaftarKru(data.kru);
      } catch (e) {
        console.error("Gagal memuat data kru kedai", e);
      } finally {
        setLoadingKru(false);
      }
    };
    fetchKru();
  }, []);
  
  const daftarKategori = ["Bar", "Dapur", "Lain-lain"];
  const daftarSatuan = ["Pcs", "Pack", "Kg", "Liter", "Galon", "Ikat", "Dus", "Bal", "Ball", "Tabung", "Slop"];

  const masterBarangBelanja: MasterBelanja[] = [
    { id: "B-001", nama: "Es Batu Kristal", satuanDefault: "Ball" },
    { id: "B-002", nama: "Air Mineral (Galon)", satuanDefault: "Galon" },
    { id: "B-003", nama: "Gas Elpiji 3kg", satuanDefault: "Tabung" },
    { id: "B-004", nama: "Tisu Wajah / Napkin", satuanDefault: "Pack" },
    { id: "B-005", nama: "Sabun Cuci Piring (Sunlight)", satuanDefault: "Pouch" },
    { id: "B-006", nama: "Spons Cuci Piring", satuanDefault: "Pcs" },
    { id: "B-007", nama: "Kantong Plastik / Kresek", satuanDefault: "Pack" },
    { id: "B-008", nama: "Gelas Plastik Takeaway", satuanDefault: "Slop" },
    { id: "B-009", nama: "Sedotan (Straw)", satuanDefault: "Pack" },
    { id: "B-010", nama: "Susu Evaporasi (Dadakan)", satuanDefault: "Kaleng" },
    { id: "B-011", nama: "Biji Kopi Tambahan (Dadakan)", satuanDefault: "Kg" },
    { id: "B-999", nama: "Lainnya (Tulis Manual)...", satuanDefault: "Pcs" }, 
  ];

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };

  const bersihAngka = (teks: string) => {
    return parseInt(teks.replace(/\./g, ''), 10) || 0;
  };

  const handlePilihItem = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const itemDitemukan = masterBarangBelanja.find(b => b.id === selectedId);
    
    setInputItem({
      ...inputItem,
      idItem: selectedId,
      namaManual: '', 
      satuan: itemDitemukan ? itemDitemukan.satuanDefault : 'Pcs'
    });
  };

  const handleTambahItem = (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputItem.idItem) return alert("Pilih barang yang dibeli terlebih dahulu!");
    
    let namaAkhir = "";
    if (inputItem.idItem === "B-999") {
      if (!inputItem.namaManual) return alert("Harap ketik nama barang manual yang Anda beli!");
      namaAkhir = inputItem.namaManual;
    } else {
      const itemDitemukan = masterBarangBelanja.find(b => b.id === inputItem.idItem);
      namaAkhir = itemDitemukan ? itemDitemukan.nama : "Barang Tidak Diketahui";
    }

    if (!inputItem.kuantiti || !inputItem.hargaSatuan) {
      alert("Harap lengkapi kuantiti dan total harga satuannya!");
      return;
    }

    const qty = parseFloat(inputItem.kuantiti);
    const hargaAsli = bersihAngka(inputItem.hargaSatuan);
    const totalMurni = qty * hargaAsli;

    const itemBaru: BelanjaItem = {
      namaItem: namaAkhir,
      kuantiti: qty,
      satuan: inputItem.satuan,
      hargaSatuanAsli: hargaAsli,
      nominalAsli: totalMurni,
      hargaSatuanDisplay: hargaAsli.toLocaleString('id-ID'),
      nominalDisplay: totalMurni.toLocaleString('id-ID')
    };

    setDaftarBelanja([...daftarBelanja, itemBaru]);
    setInputItem({ idItem: '', namaManual: '', kuantiti: '', satuan: 'Pcs', hargaSatuan: '' });
  };

  const hapusItem = (index: number) => {
    setDaftarBelanja(daftarBelanja.filter((_, i) => i !== index));
  };

  const handleSimpanSemua = async () => {
    if (!metaData.penginput) return alert("Pilih Nama Kru penginput terlebih dahulu!");
    if (daftarBelanja.length === 0) return alert("Keranjang belanja masih kosong!");

    setIsSubmitting(true);

    try {
      // FIX BUG: Ubah nama kunci payload agar selaras 100% dengan kebutuhan API
      const response = await fetch('/api/pengeluaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: metaData.tanggal,
          penginput: metaData.penginput,  // Wajib bernama 'penginput'
          kategori: metaData.kategori,    // Wajib ada 'kategori'
          daftarBelanja: daftarBelanja    // Wajib bernama 'daftarBelanja' & Array Utuh
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Pencatatan berhasil dikunci ke sistem!`);
        setDaftarBelanja([]); 
      } else {
        alert(`❌ Gagal menyimpan: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Terjadi kegagalan komunikasi jaringan dengan server kas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPengeluaranNota = daftarBelanja.reduce((sum, item) => sum + item.nominalAsli, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-blue-100 selection:text-blue-900 font-sans">
      
      {/* HEADER ELEGAN */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2.5 bg-slate-100 text-slate-500 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <Wallet size={16} className="text-blue-600" /> Log Belanja Kru
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-5">
        
        {/* BLOK METADATA NOTA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Nota</label>
              <input type="date" value={metaData.tanggal} onChange={(e) => setMetaData({...metaData, tanggal: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Kru Penginput</label>
              <select value={metaData.penginput} onChange={(e) => setMetaData({...metaData, penginput: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all" required>
                <option value="">{loadingKru ? 'Memuat kru...' : '-- Pilih Kru --'}</option>
                {daftarKru.map(k => <option key={k.id} value={k.nama}>{k.nama}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Alokasi Kategori Kas</label>
            <select value={metaData.kategori} onChange={(e) => setMetaData({...metaData, kategori: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all">
              {daftarKategori.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* INPUT MULTI-ITEM BELANJA PINTAR */}
        <form onSubmit={handleTambahItem} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Plus size={14} className="text-blue-500" /> Tambah Item Belanjaan
          </span>
          
          <div className="space-y-3">
            {/* DROPDOWN MASTER BARANG */}
            <select 
              value={inputItem.idItem} 
              onChange={handlePilihItem} 
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-400 focus:bg-white cursor-pointer transition-all" 
              required
            >
              <option value="">-- Pilih Barang yang Dibeli --</option>
              {masterBarangBelanja.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
            </select>

            {/* MUNCUL OTOMATIS JIKA PILIH "LAINNYA" */}
            {inputItem.idItem === "B-999" && (
              <input 
                type="text" 
                placeholder="Ketik nama barang manual..." 
                value={inputItem.namaManual} 
                onChange={(e) => setInputItem({...inputItem, namaManual: e.target.value})} 
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white border-l-4 border-l-blue-400 transition-all" 
                required 
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input type="number" placeholder="Qty" step="any" value={inputItem.kuantiti} onChange={(e) => setInputItem({...inputItem, kuantiti: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-400 focus:bg-white transition-all" required />
            <select value={inputItem.satuan} onChange={(e) => setInputItem({...inputItem, satuan: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-blue-400 transition-all">
              {daftarSatuan.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" inputMode="numeric" placeholder="Harga Satuan" value={inputItem.hargaSatuan} onChange={(e) => setInputItem({...inputItem, hargaSatuan: formatRupiah(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-400 focus:bg-white transition-all" required />
          </div>

          <button type="submit" className="w-full py-3.5 bg-slate-100 text-blue-600 border border-blue-200 text-xs font-black tracking-wide uppercase rounded-xl flex items-center justify-center gap-1.5 hover:bg-blue-50 transition-colors active:scale-95">
            <Plus size={16} strokeWidth={3} /> Masukkan Ke Daftar
          </button>
        </form>

        {/* DAFTAR KERANJANG NOTA */}
        {daftarBelanja.length > 0 && (
          <div className="bg-slate-900 p-5 rounded-2xl shadow-xl text-white space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><ShoppingCart size={14} /> Ringkasan Nota</span>
              <span className="text-sm font-black text-blue-400">Rp {totalPengeluaranNota.toLocaleString('id-ID')}</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {daftarBelanja.map((item, idx) => (
                <div key={idx} className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">{item.namaItem}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      {item.kuantiti} {item.satuan} × Rp {item.hargaSatuanDisplay}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-200">Rp {item.nominalDisplay}</span>
                    <button type="button" onClick={() => hapusItem(idx)} className="p-2 text-slate-500 hover:text-rose-400 bg-slate-900/50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={handleSimpanSemua} disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-black tracking-widest uppercase text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
              <CheckCircle2 size={16} /> {isSubmitting ? 'Menyinkronkan Data...' : 'Kunci & Simpan Nota'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}