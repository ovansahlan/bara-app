'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, User, Tag, Calendar, ChevronLeft, 
  CheckCircle2, Banknote, Package, Plus, Trash2, ReceiptText, Calculator
} from 'lucide-react';

// Struktur input item aktif saat ini
interface ItemForm {
  namaItem: string;
  kuantiti: string;
  satuan: string;
  hargaSatuan: string;
}

// Struktur data item yang siap mengantre di dalam keranjang
interface BelanjaRecord {
  namaItem: string;
  satuan: string;
  kuantiti: number;
  hargaSatuanAsli: number;
  nominalAsli: number;
  nominalFormat: string;
}

export default function PengeluaranSaaSMulti() {
  const [metaData, setMetaData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    penginput: '',
    kategori: 'Pengeluaran Bar',
  });

  const [currentItem, setCurrentItem] = useState<ItemForm>({
    namaItem: '', kuantiti: '', satuan: 'Pcs', hargaSatuan: '' 
  });

  const [daftarBelanja, setDaftarBelanja] = useState<BelanjaRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const daftarKru = ["Chika", "Ibnu", "Novi", "Diska", "Nugye", "Ruslan", "A Novan"];
  const daftarKategori = ["Pengeluaran Bar", "Pengeluaran Dapur", "Pengeluaran Lain2"];
  const saranItem = ["Es Batu", "Galon Air", "Gas LPG 3kg", "Telur", "Minyak Goreng", "Plastik Kresek", "Tisu"];
  const daftarSatuan = ["Pcs", "Ball", "Kg", "Liter", "Galon", "Tabung", "Pack"];

  const handleHargaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const angkaSaja = e.target.value.replace(/\D/g, '');
    const formatTitik = angkaSaja === '' ? '' : parseInt(angkaSaja, 10).toLocaleString('id-ID');
    setCurrentItem({ ...currentItem, hargaSatuan: formatTitik });
  };

  const qtyInput = parseInt(currentItem.kuantiti) || 0;
  const hargaSatuanInput = parseInt(currentItem.hargaSatuan.replace(/\./g, '')) || 0;
  const subtotalItemSaatIni = qtyInput * hargaSatuanInput;

  const handleTambahItem = (e: FormEvent) => {
    e.preventDefault();
    if (!currentItem.namaItem || !currentItem.kuantiti || !currentItem.hargaSatuan) {
      alert("Harap lengkapi data barang!");
      return;
    }

    const indexBarangSama = daftarBelanja.findIndex(
      (item) => item.namaItem.toLowerCase().trim() === currentItem.namaItem.toLowerCase().trim()
    );

    if (indexBarangSama !== -1) {
      const listBaru = [...daftarBelanja];
      listBaru[indexBarangSama].kuantiti += qtyInput;
      listBaru[indexBarangSama].nominalAsli += subtotalItemSaatIni;
      listBaru[indexBarangSama].nominalFormat = listBaru[indexBarangSama].nominalAsli.toLocaleString('id-ID');
      setDaftarBelanja(listBaru);
    } else {
      setDaftarBelanja([...daftarBelanja, {
        namaItem: currentItem.namaItem,
        satuan: currentItem.satuan,
        kuantiti: qtyInput,
        hargaSatuanAsli: hargaSatuanInput,
        nominalAsli: subtotalItemSaatIni,
        nominalFormat: subtotalItemSaatIni.toLocaleString('id-ID')
      }]);
    }
    
    setCurrentItem({ namaItem: '', kuantiti: '', satuan: 'Pcs', hargaSatuan: '' });
  };

  const totalSeluruhnya = daftarBelanja.reduce((total, item) => total + item.nominalAsli, 0);

  const handleSimpanSemua = () => {
    if (!metaData.penginput) return alert("Pilih Nama Kru terlebih dahulu!");
    if (daftarBelanja.length === 0) return alert("Daftar belanja masih kosong!");

    setIsSubmitting(true);
    setTimeout(() => {
      alert(`✅ Berhasil Disimpan!\nTotal: Rp ${totalSeluruhnya.toLocaleString('id-ID')}`);
      setIsSubmitting(false); setDaftarBelanja([]); 
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold tracking-wide flex items-center gap-2 text-zinc-800">
            <ShoppingBag size={16} className="text-rose-600" /> Multi-Input Petty Cash
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-5">
        
        {/* INFORMASI STRUK */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 border-b border-zinc-100 pb-2 mb-2">
            <ReceiptText size={16} className="text-zinc-500"/> Informasi Struk
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={metaData.tanggal} onChange={(e) => setMetaData({...metaData, tanggal: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm outline-none" required />
            <select value={metaData.penginput} onChange={(e) => setMetaData({...metaData, penginput: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm outline-none" required>
              <option value="">Pilih Kru...</option>
              {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <select value={metaData.kategori} onChange={(e) => setMetaData({...metaData, kategori: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm outline-none">
            {daftarKategori.map(k => <option key={k} value={k}>{k.replace('Pengeluaran ', '')}</option>)}
          </select>
        </div>

        {/* INPUT ITEMS FORM MUTASI */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
          
          <form onSubmit={handleTambahItem} className="space-y-4">
            <input type="text" list="saran-barang" placeholder="Nama Barang (Cth: Galon Air)" value={currentItem.namaItem} onChange={(e) => setCurrentItem({...currentItem, namaItem: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm outline-none" required />
            <datalist id="saran-barang">{saranItem.map(i => <option key={i} value={i} />)}</datalist>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Package size={14} className="absolute left-3 top-3.5 text-zinc-400" />
                <input type="number" placeholder="Qty (Cth: 5)" value={currentItem.kuantiti} onChange={(e) => setCurrentItem({...currentItem, kuantiti: e.target.value})} className="w-full pl-9 p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm outline-none" required />
              </div>
              <select value={currentItem.satuan} onChange={(e) => setCurrentItem({...currentItem, satuan: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm outline-none">
                {daftarSatuan.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-rose-500 transition-all shadow-sm">
              <div className="bg-zinc-100 border-r border-zinc-300 px-4 py-3 text-zinc-500"><Banknote size={16} /></div>
              <div className="flex items-center pl-3"><span className="text-zinc-500 font-semibold text-sm">Rp</span></div>
              <input type="text" inputMode="numeric" placeholder="Harga Satuan..." value={currentItem.hargaSatuan} onChange={handleHargaChange} className="w-full p-3 text-zinc-900 font-bold text-lg bg-transparent outline-none" required />
            </div>

            <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 flex justify-between items-center text-sm">
              <span className="font-semibold text-rose-800 flex items-center gap-2"><Calculator size={16} />Subtotal:</span>
              <span className="font-black text-rose-700">Rp {subtotalItemSaatIni.toLocaleString('id-ID')}</span>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold text-rose-600 bg-white border-2 border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
              <Plus size={18} /> MASUKKAN KE DAFTAR
            </button>
          </form>
        </div>

        {/* BATCH DARK VIEW CART */}
        {daftarBelanja.length > 0 && (
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-md text-white space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-700 pb-2">Rincian Nota ({daftarBelanja.length} Item)</span>
            
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {daftarBelanja.map((item, idx) => (
                <div key={idx} className="bg-zinc-800 p-3 rounded-xl flex justify-between items-center text-xs">
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{item.namaItem}</h4>
                    <p className="text-[10px] text-indigo-300 mt-1">{item.kuantiti} {item.satuan} x Rp {item.hargaSatuanAsli.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="font-bold text-white">Rp {item.nominalFormat}</span>
                    <button onClick={() => setDaftarBelanja(daftarBelanja.filter((_, i) => i !== idx))} className="p-1.5 text-zinc-400 hover:text-rose-400"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-zinc-700 flex justify-between items-center text-xs">
              <span className="text-xs font-medium text-zinc-400">Total Keseluruhan</span>
              <span className="text-2xl font-black text-rose-400">Rp {totalSeluruhnya.toLocaleString('id-ID')}</span>
            </div>

            <button onClick={handleSimpanSemua} disabled={isSubmitting} className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
              <CheckCircle2 size={18} /> SIMPAN SEMUA PENGELUARAN
            </button>
          </div>
        )}

      </div>
    </div>
  );
}