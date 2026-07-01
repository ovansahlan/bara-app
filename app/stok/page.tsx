'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { Package, ChevronLeft, Plus, Trash2, CheckCircle2, ArrowDownLeft, ArrowUpRight, ClipboardCheck } from 'lucide-react';

interface Produk {
  id: string;
  nama: string;
  satuan: string;
  sistem: number;
}

interface CartItem {
  id: string;
  nama: string;
  tipe: 'IN' | 'OUT' | 'OPNAME';
  qty: number;
  satuan: string;
  infoExtra: string;
  totalNilai: number;
}

export default function LogistikSaaSTypeScript() {
  const [activeMode, setActiveMode] = useState<'menu' | 'IN' | 'OUT' | 'OPNAME'>('menu');
  const [kru, setKru] = useState<string>('');
  const [cartStok, setCartStok] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [itemIn, setItemIn] = useState({ id: 'B001', qty: '', harga: '' });
  const [itemOut, setItemOut] = useState({ id: 'B001', qty: '', tujuan: 'Kedai Utama', ket: '' });
  const [itemOpname, setItemOpname] = useState({ id: 'B001', fisik: '', ket: '' });

  const daftarKru = ["Chika", "Ibnu", "Novi", "Diska", "Nugye", "Ruslan", "A Novan"];
  const listMasterProduk: Produk[] = [
    { id: "B001", nama: "Susu Evaporasi", satuan: "Kaleng", sistem: 54 },
    { id: "B002", nama: "Susu UHT", satuan: "Liter", sistem: 84 },
    { id: "B003", nama: "Susu SKM", satuan: "Pouch", sistem: 6 },
    { id: "B004", nama: "Creamer", satuan: "Kg", sistem: 4 },
  ];

  const formatInputRupiah = (val: string) => {
    const angkaSaja = val.replace(/\D/g, '');
    return angkaSaja === '' ? '' : parseInt(angkaSaja, 10).toLocaleString('id-ID');
  };

  const totalHargaInTemp = (parseInt(itemIn.qty) || 0) * (parseInt((itemIn.harga || '').replace(/\./g, '')) || 0);

  // FIX: Parameter 'e' sekarang secara eksplisit menggunakan tipe data FormEvent dari React
  const handleTambahCart = (e: FormEvent) => {
    e.preventDefault();
    if (!kru) return alert("Pilih Petugas Gudang!");

    const currentMaster = listMasterProduk.find(p => p.id === (activeMode === 'IN' ? itemIn.id : activeMode === 'OUT' ? itemOut.id : itemOpname.id));
    if (!currentMaster) return;

    if (activeMode === 'IN') {
      if (!itemIn.qty || !itemIn.harga) return alert("Lengkapi data!");
      
      const idxSama = cartStok.findIndex(c => c.id === itemIn.id && c.tipe === 'IN');
      if (idxSama !== -1) {
        const upCart = [...cartStok];
        upCart[idxSama].qty += parseInt(itemIn.qty);
        upCart[idxSama].totalNilai += totalHargaInTemp;
        setCartStok(upCart);
      } else {
        setCartStok([...cartStok, {
          id: itemIn.id, nama: currentMaster.nama, tipe: 'IN',
          qty: parseInt(itemIn.qty), satuan: currentMaster.satuan,
          infoExtra: `Rp ${itemIn.harga}/satuan`, totalNilai: totalHargaInTemp
        }]);
      }
      setItemIn({ id: 'B001', qty: '', harga: '' });
    } 
    else if (activeMode === 'OUT') {
      if (!itemOut.qty) return alert("Masukkan qty!");
      setCartStok([...cartStok, {
        id: itemOut.id, nama: currentMaster.nama, tipe: 'OUT',
        qty: parseInt(itemOut.qty), satuan: currentMaster.satuan,
        infoExtra: `${itemOut.tujuan} ${itemOut.ket ? `(${itemOut.ket})` : ''}`, totalNilai: 0
      }]);
      setItemOut({ id: 'B001', qty: '', tujuan: 'Kedai Utama', ket: '' });
    }
    else if (activeMode === 'OPNAME') {
      if (!itemOpname.physic || !itemOpname.fisik) {
        if (!itemOpname.fisik) return alert("Masukkan fisik asli!");
      }
      const selisih = parseInt(itemOpname.fisik) - currentMaster.sistem;
      setCartStok([...cartStok, {
        id: itemOpname.id, nama: currentMaster.nama, tipe: 'OPNAME',
        qty: parseInt(itemOpname.fisik), satuan: currentMaster.satuan,
        infoExtra: `Sistem: ${currentMaster.sistem} | Selisih: ${selisih > 0 ? `+${selisih}` : selisih}`, totalNilai: 0
      }]);
      setItemOpname({ id: 'B001', fisik: '', ket: '' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => activeMode === 'menu' ? window.location.href = '/' : setActiveMode('menu')} className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200"><ChevronLeft size={20} /></button>
          <h1 className="text-sm font-bold tracking-wide uppercase">Gudang & Logistik</h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-5">
        {activeMode === 'menu' && (
          <div className="space-y-3 pt-4">
            <button onClick={() => setActiveMode('IN')} className="w-full p-4 bg-white border border-zinc-200 rounded-2xl flex items-center gap-4 text-left transition-all hover:border-zinc-300">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ArrowDownLeft size={20} /></div>
              <div><h3 className="text-sm font-bold">Stock-In (Barang Masuk)</h3><p className="text-[10px] text-zinc-400 mt-0.5">Penambahan pasokan atau pembelanjaan logistik</p></div>
            </button>
            <button onClick={() => setActiveMode('OUT')} className="w-full p-4 bg-white border border-zinc-200 rounded-2xl flex items-center gap-4 text-left transition-all hover:border-zinc-300">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><ArrowUpRight size={20} /></div>
              <div><h3 className="text-sm font-bold">Stock-Out (Barang Keluar)</h3><p className="text-[10px] text-zinc-400 mt-0.5">Pemakaian bahan baku di bar atau mutasi ke gerobak</p></div>
            </button>
            <button onClick={() => setActiveMode('OPNAME')} className="w-full p-4 bg-white border border-zinc-200 rounded-2xl flex items-center gap-4 text-left transition-all hover:border-zinc-300">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ClipboardCheck size={20} /></div>
              <div><h3 className="text-sm font-bold">Stock Opname Harian</h3><p className="text-[10px] text-zinc-400 mt-0.5">Audit stock riil fisik untuk menghitung nilai selisih</p></div>
            </button>
          </div>
        )}

        {activeMode !== 'menu' && (
          <>
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Petugas:</span>
              <select value={kru} onChange={(e: ChangeEvent<HTMLSelectElement>) => setKru(e.target.value)} className="text-xs font-bold bg-transparent outline-none text-zinc-800" required>
                <option value="">-- Pilih Nama Anda --</option>
                {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <form onSubmit={handleTambahCart} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Pilih Item Logistik</label>
                <select value={activeMode === 'IN' ? itemIn.id : activeMode === 'OUT' ? itemOut.id : itemOpname.id} onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  if(activeMode === 'IN') setItemIn({...itemIn, id: e.target.value});
                  if(activeMode === 'OUT') setItemOut({...itemOut, id: e.target.value});
                  if(activeMode === 'OPNAME') setItemOpname({...itemOpname, id: e.target.value});
                }} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-semibold outline-none">
                  {listMasterProduk.map(p => <option key={p.id} value={p.id}>{p.id} - {p.nama} ({p.satuan})</option>)}
                </select>
              </div>

              {activeMode === 'IN' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Qty" value={itemIn.qty} onChange={(e: ChangeEvent<HTMLInputElement>) => setItemIn({...itemIn, qty: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold outline-none" required />
                    <input type="text" inputMode="numeric" placeholder="Harga Beli Satuan" value={itemIn.harga} onChange={(e: ChangeEvent<HTMLInputElement>) => setItemIn({...itemIn, harga: formatInputRupiah(e.target.value)})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold outline-none" required />
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs flex justify-between font-bold">
                    <span>Subtotal:</span><span>Rp {totalHargaInTemp.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              {activeMode === 'OUT' && (
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Qty Keluar" value={itemOut.qty} onChange={(e: ChangeEvent<HTMLInputElement>) => setItemOut({...itemOut, qty: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold outline-none" required />
                  <select value={itemOut.tujuan} onChange={(e: ChangeEvent<HTMLSelectElement>) => setItemOut({...itemOut, tujuan: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold outline-none">
                    <option value="Kedai Utama">Kedai Utama</option>
                    <option value="Gerobak">Gerobak Bajay</option>
                  </select>
                </div>
              )}

              {activeMode === 'OPNAME' && (
                <input type="number" placeholder="Jumlah Fisik Riil" value={itemOpname.fisik} onChange={(e: ChangeEvent<HTMLInputElement>) => setItemOpname({...itemOpname, fisik: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold outline-none" required />
              )}

              <button type="submit" className="w-full py-2.5 bg-zinc-950 text-white text-xs font-bold rounded-xl transition-all active:scale-98 shadow-sm">+ MASUKKAN BATCH LIST</button>
            </form>
          </>
        )}

        {cartStok.length > 0 && (
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 text-white space-y-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-800 pb-2">Batch Mutasi Logistik ({cartStok.length} Items)</span>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cartStok.map((item, idx) => (
                <div key={idx} className="bg-zinc-800 p-2.5 rounded-xl border border-zinc-700 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{item.nama} <span className="text-[9px] bg-zinc-700 px-1 py-0.5 rounded ml-1 font-semibold">{item.tipe}</span></h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{item.qty} {item.satuan} • <span className="text-zinc-500">{item.infoExtra}</span></p>
                  </div>
                  <button onClick={() => setCartStok(cartStok.filter((_, i) => i !== idx))} className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => { setIsSubmitting(true); setTimeout(() => { alert("Sukses memperbarui berkas logistik."); setIsSubmitting(false); setCartStok([]); setActiveMode('menu'); }, 1500); }} disabled={isSubmitting} className="w-full py-3.5 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95">
              <CheckCircle2 size={14} /> COMMIT & UPDATE DATA STOK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}