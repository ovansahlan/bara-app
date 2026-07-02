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
  
  // STATE BARU: Penampung nama kru dinamis
  const [daftarKru, setDaftarKru] = useState<any[]>([]);
  const [loadingKru, setLoadingKru] = useState<boolean>(true);

  // KODE DINAMIS: Ambil data kru Kedai yang aktif dari API
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

    // KITA SESUAIKAN DENGAN STRUKTUR API MULTIPLE INPUT
    // Ubah format data agar selaras dengan API Pengeluaran Kedai 
    const payloadDaftarBelanja = daftarBelanja.map(item => ({
      kategori: metaData.kategori,
      keterangan: `${item.namaItem} (${item.kuantiti} ${item.satuan})`,
      nominal: item.nominalAsli
    }));

    try {
      const response = await fetch('/api/pengeluaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: metaData.tanggal,
          namaKru: metaData.penginput, // Sesuaikan dengan key di backend API
          daftarPengeluaran: payloadDaftarBelanja // Gunakan payload keranjang
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Pencatatan berhasil dikunci!`);
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200/80 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold tracking-wide text-zinc-800 uppercase flex items-center gap-1.5">
            <Wallet size={16} className="text-rose-500" /> Log Pengeluaran Kas
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-5">
        
        {/* BLOK METADATA NOTA */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tanggal Nota</label>
              <input type="date" value={metaData.tanggal} onChange={(e) => setMetaData({...metaData, tanggal: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Kru Penginput</label>
              <select value={metaData.penginput} onChange={(e) => setMetaData({...metaData, penginput: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer" required>
                <option value="">{loadingKru ? 'Memuat kru...' : '-- Pilih Kru --'}</option>
                {daftarKru.map(k => <option key={k.id} value={k.nama}>{k.nama}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Alokasi Kategori Kas</label>
            <select value={metaData.kategori} onChange={(e) => setMetaData({...metaData, kategori: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer">
              {daftarKategori.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* INPUT MULTI-ITEM BELANJA PINTAR */}
        <form onSubmit={handleTambahItem} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tambah Item Belanjaan</span>
          
          <div className="space-y-3">
            {/* DROPDOWN MASTER BARANG */}
            <select 
              value={inputItem.idItem} 
              onChange={handlePilihItem} 
              className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold text-zinc-800 outline-none focus:bg-white cursor-pointer" 
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
                className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white border-l-4 border-l-rose-400" 
                required 
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input type="number" placeholder="Qty" step="any" value={inputItem.kuantiti} onChange={(e) => setInputItem({...inputItem, kuantiti: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white" required />
            <select value={inputItem.satuan} onChange={(e) => setInputItem({...inputItem, satuan: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 outline-none cursor-pointer">
              {daftarSatuan.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" inputMode="numeric" placeholder="Harga Satuan" value={inputItem.hargaSatuan} onChange={(e) => setInputItem({...inputItem, hargaSatuan: formatRupiah(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white" required />
          </div>

          <button type="submit" className="w-full py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-zinc-800 transition-colors">
            <Plus size={14} strokeWidth={2.5} /> Masukkan Ke Daftar Nota
          </button>
        </form>

        {/* DAFTAR KERANJANG NOTA */}
        {daftarBelanja.length > 0 && (
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-md text-white space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1"><ShoppingCart size={12} /> Daftar Item Nota</span>
              <span className="text-xs font-black text-rose-400">Rp {totalPengeluaranNota.toLocaleString('id-ID')}</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {daftarBelanja.map((item, idx) => (
                <div key={idx} className="bg-zinc-800/90 p-3 rounded-xl border border-zinc-700/60 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">{item.namaItem}</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                      {item.kuantiti} {item.satuan} × Rp {item.hargaSatuanDisplay}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-200">Rp {item.nominalDisplay}</span>
                    <button type="button" onClick={() => hapusItem(idx)} className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={handleSimpanSemua} disabled={isSubmitting} className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
              <CheckCircle2 size={14} /> {isSubmitting ? 'Membukukan ke Sheets...' : 'KUNCI & SIMPAN SEMUA PENGELUARAN'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}