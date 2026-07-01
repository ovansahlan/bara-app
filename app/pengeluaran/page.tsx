'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, User, Tag, Calendar, ChevronLeft, 
  CheckCircle2, Banknote, Package, Plus, Trash2, ReceiptText, Calculator
} from 'lucide-react';

export default function PengeluaranSaaSMulti() {
  const [metaData, setMetaData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    penginput: '',
    kategori: 'Pengeluaran Bar',
  });

  // State berubah: nominal diganti menjadi hargaSatuan
  const [currentItem, setCurrentItem] = useState({
    namaItem: '',
    kuantiti: '',
    satuan: 'Pcs',
    hargaSatuan: '' 
  });

  const [daftarBelanja, setDaftarBelanja] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daftarKru = ["Chika", "Ibnu", "Novi", "Diska", "Nugye", "Ruslan", "A Novan"];
  const daftarKategori = ["Pengeluaran Bar", "Pengeluaran Dapur", "Pengeluaran Lain2"];
  const saranItem = ["Es Batu", "Galon Air", "Gas LPG 3kg", "Telur", "Minyak Goreng", "Plastik Kresek", "Tisu"];
  const daftarSatuan = ["Pcs", "Ball", "Kg", "Liter", "Galon", "Tabung", "Pack"];

  const handleHargaChange = (e) => {
    const angkaSaja = e.target.value.replace(/\D/g, '');
    const formatTitik = angkaSaja === '' ? '' : parseInt(angkaSaja, 10).toLocaleString('id-ID');
    setCurrentItem({ ...currentItem, hargaSatuan: formatTitik });
  };

  // Kalkulasi Subtotal secara Real-time di Form Input
  const qtyInput = parseInt(currentItem.kuantiti) || 0;
  const hargaSatuanInput = parseInt(currentItem.hargaSatuan.replace(/\./g, '')) || 0;
  const subtotalItemSaatIni = qtyInput * hargaSatuanInput;

  // ====================================================
  // LOGIKA CERDAS: KALIKAN OTOMATIS & AKUMULASI
  // ====================================================
  const handleTambahItem = (e) => {
    e.preventDefault();
    if (!currentItem.namaItem || !currentItem.kuantiti || !currentItem.hargaSatuan) {
      alert("Harap lengkapi nama barang, kuantiti, dan harga satuan!");
      return;
    }

    const indexBarangSama = daftarBelanja.findIndex(
      (item) => item.namaItem.toLowerCase().trim() === currentItem.namaItem.toLowerCase().trim()
    );

    if (indexBarangSama !== -1) {
      // JIKA BARANG SUDAH ADA: Tambahkan qty dan total harganya
      const listBaru = [...daftarBelanja];
      
      listBaru[indexBarangSama].kuantiti = listBaru[indexBarangSama].kuantiti + qtyInput;
      // Akumulasi total harga (Total Lama + Subtotal Baru)
      listBaru[indexBarangSama].nominalAsli = listBaru[indexBarangSama].nominalAsli + subtotalItemSaatIni;
      listBaru[indexBarangSama].nominalFormat = listBaru[indexBarangSama].nominalAsli.toLocaleString('id-ID');
      
      setDaftarBelanja(listBaru);
    } else {
      // JIKA BARANG BELUM ADA: Buat baris baru di keranjang
      const newItem = {
        namaItem: currentItem.namaItem,
        satuan: currentItem.satuan,
        kuantiti: qtyInput,
        hargaSatuanAsli: hargaSatuanInput,
        nominalAsli: subtotalItemSaatIni, // Hasil kali otomatis disimpan
        nominalFormat: subtotalItemSaatIni.toLocaleString('id-ID')
      };
      setDaftarBelanja([...daftarBelanja, newItem]);
    }
    
    // Reset form item
    setCurrentItem({ namaItem: '', kuantiti: '', satuan: 'Pcs', hargaSatuan: '' });
  };

  const handleHapusItem = (index) => {
    const listBaru = [...daftarBelanja];
    listBaru.splice(index, 1);
    setDaftarBelanja(listBaru);
  };

  // Grand Total Otomatis dari seluruh isi Keranjang
  const totalSeluruhnya = daftarBelanja.reduce((total, item) => total + item.nominalAsli, 0);

  const handleSimpanSemua = () => {
    if (!metaData.penginput) return alert("Pilih Nama Kru (Penginput) terlebih dahulu!");
    if (daftarBelanja.length === 0) return alert("Daftar belanja masih kosong!");

    setIsSubmitting(true);
    
    setTimeout(() => {
      alert(`✅ Berhasil Disimpan!\n\nTotal Keseluruhan: Rp ${totalSeluruhnya.toLocaleString('id-ID')}\nData siap dikirim ke Google Sheets.`);
      setIsSubmitting(false);
      setDaftarBelanja([]); 
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
        
        {/* DATA STRUK UTAMA */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 border-b border-zinc-100 pb-2 mb-2">
            <ReceiptText size={16} className="text-zinc-500"/> Informasi Struk
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tanggal</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-3 text-zinc-400" />
                <input type="date" value={metaData.tanggal} onChange={(e) => setMetaData({...metaData, tanggal: e.target.value})} className="w-full pl-9 p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Kru Bertugas</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-zinc-400" />
                <select value={metaData.penginput} onChange={(e) => setMetaData({...metaData, penginput: e.target.value})} className="w-full pl-9 p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none appearance-none" required>
                  <option value="">Pilih...</option>
                  {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Kategori Beban</label>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-3 text-zinc-400" />
              <select value={metaData.kategori} onChange={(e) => setMetaData({...metaData, kategori: e.target.value})} className="w-full pl-9 p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none appearance-none">
                {daftarKategori.map(k => <option key={k} value={k}>{k.replace('Pengeluaran ', '')}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* FORM TAMBAH BARANG */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tambah Item Baru</label>
          </div>

          <form onSubmit={handleTambahItem} className="space-y-4">
            <div>
              <input type="text" list="saran-barang" placeholder="Nama Barang (Cth: Galon Air)" value={currentItem.namaItem} onChange={(e) => setCurrentItem({...currentItem, namaItem: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none" required />
              <datalist id="saran-barang">{saranItem.map(i => <option key={i} value={i} />)}</datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Package size={14} className="absolute left-3 top-3.5 text-zinc-400" />
                <input type="number" placeholder="Qty (Cth: 5)" value={currentItem.kuantiti} onChange={(e) => setCurrentItem({...currentItem, kuantiti: e.target.value})} className="w-full pl-9 p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none" required />
              </div>
              <select value={currentItem.satuan} onChange={(e) => setCurrentItem({...currentItem, satuan: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none appearance-none">
                {daftarSatuan.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Input Harga Satuan */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Harga Satuan</label>
              <div className="flex bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-rose-500 transition-all shadow-xs">
                <div className="bg-zinc-100 border-r border-zinc-300 px-4 py-3 flex items-center text-zinc-500"><Banknote size={16} /></div>
                <div className="flex items-center pl-3"><span className="text-zinc-500 font-semibold text-sm">Rp</span></div>
                <input type="text" inputMode="numeric" placeholder="Contoh: 5.000" value={currentItem.hargaSatuan} onChange={handleHargaChange} className="w-full p-3 text-zinc-900 font-bold text-lg outline-none bg-transparent" required />
              </div>
            </div>

            {/* Auto Subtotal Display */}
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-rose-800">
                <Calculator size={16} />
                <span className="font-semibold">Subtotal:</span>
              </div>
              <span className="font-black text-rose-700">Rp {subtotalItemSaatIni.toLocaleString('id-ID')}</span>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold text-rose-600 bg-white border-2 border-rose-200 hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Plus size={18} strokeWidth={2.5}/> MASUKKAN KE DAFTAR
            </button>
          </form>
        </div>

        {/* DAFTAR KERANJANG BELANJA */}
        {daftarBelanja.length > 0 && (
          <div className="bg-zinc-900 p-5 rounded-2xl shadow-md border border-zinc-800 text-white animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-700 pb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rincian Nota ({daftarBelanja.length} Item)</span>
            </div>
            
            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
              {daftarBelanja.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white leading-none mb-1.5">{item.namaItem}</h4>
                    <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-900/50 px-2 py-0.5 rounded">
                      {item.kuantiti} {item.satuan} x Rp {item.hargaSatuanAsli.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="text-sm font-bold text-white">Rp {item.nominalFormat}</span>
                    <button onClick={() => handleHapusItem(idx)} className="p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* GRAND TOTAL OTOMATIS */}
            <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-zinc-700/50 mb-5">
              <span className="text-xs font-medium text-zinc-400">Total Keseluruhan</span>
              <span className="text-2xl font-black text-rose-400">Rp {totalSeluruhnya.toLocaleString('id-ID')}</span>
            </div>

            <button onClick={handleSimpanSemua} disabled={isSubmitting} className={`w-full py-4 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${isSubmitting ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95'}`}>
              {isSubmitting ? <CheckCircle2 size={18} className="animate-pulse" /> : <ShoppingBag size={18} />}
              {isSubmitting ? 'MENGIRIM DATA...' : `SIMPAN SEMUA PENGELUARAN`}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}