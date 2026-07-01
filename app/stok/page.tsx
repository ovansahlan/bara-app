'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, ChevronLeft, Plus, Trash2, CheckCircle2, ArrowDownLeft, ArrowUpRight, ClipboardCheck } from 'lucide-react';

export default function LogistikSaaSMulti() {
  const [activeMode, setActiveMode] = useState('menu'); // 'menu', 'IN', 'OUT', 'OPNAME'
  const [kru, setKru] = useState('');
  const [cartStok, setCartStok] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Temp State
  const [itemIn, setItemIn] = useState({ id: 'B001', qty: '', harga: '' });
  const [itemOut, setItemOut] = useState({ id: 'B001', qty: '', tujuan: 'Kedai Utama', ket: '' });
  const [itemOpname, setItemOpname] = useState({ id: 'B001', fisik: '', ket: '' });

  const daftarKru = ["Chika", "Ibnu", "Novi", "Diska", "Nugye", "Ruslan", "A Novan"];
  const listMasterProduk = [
    { id: "B001", nama: "Susu Evaporasi", satuan: "Kaleng", sistem: 54 },
    { id: "B002", nama: "Susu UHT", satuan: "Liter", sistem: 84 },
    { id: "B003", nama: "Susu SKM", satuan: "Pouch", sistem: 6 },
    { id: "B004", nama: "Creamer", satuan: "Kg", sistem: 4 },
  ];

  const currentProdukIn = listMasterProduk.find(p => p.id === itemIn.id);
  const totalHargaInTemp = (parseInt(itemIn.qty) || 0) * (parseInt((itemIn.harga || '').replace(/\./g, '')) || 0);

  const handleTambahCart = (e) => {
    e.preventDefault();
    if (!kru) return alert("Pilih Petugas Gudang!");

    if (activeMode === 'IN') {
      if (!itemIn.qty || !itemIn.harga) return alert("Lengkapi data barang masuk!");
      const p = listMasterProduk.find(pr => pr.id === itemIn.id);
      setCartStok([...cartStok, {
        id: itemIn.id, nama: p.nama, tipe: 'IN',
        qty: parseInt(itemIn.qty), satuan: p.satuan,
        infoExtra: `Rp ${itemIn.harga}/satuan`, totalNilai: totalHargaInTemp
      }]);
      setItemIn({ id: 'B001', qty: '', harga: '' });
    } 
    else if (activeMode === 'OUT') {
      if (!itemOut.qty) return alert("Masukkan kuantiti keluar!");
      const p = listMasterProduk.find(pr => pr.id === itemOut.id);
      setCartStok([...cartStok, {
        id: itemOut.id, nama: p.nama, tipe: 'OUT',
        qty: parseInt(itemOut.qty), satuan: p.satuan,
        infoExtra: `Tujuan: ${itemOut.tujuan} ${itemOut.ket ? `(${itemOut.ket})` : ''}`, totalNilai: 0
      }]);
      setItemOut({ id: 'B001', qty: '', tujuan: 'Kedai Utama', ket: '' });
    }
    else if (activeMode === 'OPNAME') {
      if (!itemOpname.fisik) return alert("Masukkan jumlah fisik asli kulkas/gudang!");
      const p = listMasterProduk.find(pr => pr.id === itemOpname.id);
      const selisih = parseInt(itemOpname.fisik) - p.sistem;
      setCartStok([...cartStok, {
        id: itemOpname.id, nama: p.nama, tipe: 'OPNAME',
        qty: parseInt(itemOpname.fisik), satuan: p.satuan,
        infoExtra: `Sistem: ${p.sistem} | Selisih: ${selisih > 0 ? `+${selisih}` : selisih}`, totalNilai: 0
      }]);
      setItemOpname({ id: 'B001', fisik: '', ket: '' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24 font-sans">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => activeMode === 'menu' ? window.location.href = '/' : (setActiveMode('menu'), setCartStok([]))} className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200"><ChevronLeft size={20} /></button>
          <h1 className="text-sm font-bold tracking-wide uppercase">
            {activeMode === 'menu' ? 'Logistik Hub' : `Batch Stack: ${activeMode}`}
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-5">
        
        {/* OPERATIONAL HUB SELECTOR */}
        {activeMode === 'menu' && (
          <div className="space-y-3 pt-6">
            <button onClick={() => setActiveMode('IN')} className="w-full p-4 bg-white border border-zinc-200 rounded-2xl shadow-2xs flex items-center gap-4 hover:border-zinc-400 text-left transition-all group">
              <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl"><ArrowDownLeft size={20} /></div>
              <div><h3 className="text-sm font-bold text-zinc-800">Stock-In (Barang Masuk / Belanja)</h3><p className="text-[10px] text-zinc-400 mt-0.5">Catat restock susu, cup kemasan, sirup bulanan</p></div>
            </button>
            <button onClick={() => setActiveMode('OUT')} className="w-full p-4 bg-white border border-zinc-200 rounded-2xl shadow-2xs flex items-center gap-4 hover:border-zinc-400 text-left transition-all group">
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl"><ArrowUpRight size={20} /></div>
              <div><h3 className="text-sm font-bold text-zinc-800">Stock-Out (Mutasi / Pemakaian Bar)</h3><p className="text-[10px] text-zinc-400 mt-0.5">Catat bahan keluar untuk operasional atau oper gerobak</p></div>
            </button>
            <button onClick={() => setActiveMode('OPNAME')} className="w-full p-4 bg-white border border-zinc-200 rounded-2xl shadow-2xs flex items-center gap-4 hover:border-zinc-400 text-left transition-all group">
              <div className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl"><ClipboardCheck size={20} /></div>
              <div><h3 className="text-sm font-bold text-zinc-800">Stock Opname Fisik Berkala</h3><p className="text-[10px] text-zinc-400 mt-0.5">Audit stock fisik asli gudang untuk hitung selisih</p></div>
            </button>
          </div>
        )}

        {/* INPUT MUTASI FORM CONTAINER */}
        {activeMode !== 'menu' && (
          <>
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Petugas:</span>
              <select value={kru} onChange={(e) => setKru(e.target.value)} className="text-xs font-bold bg-transparent outline-none text-zinc-800 cursor-pointer" required>
                <option value="">-- Pilih Nama Anda --</option>
                {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <form onSubmit={handleTambahCart} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
              {/* Item Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Pilih Item Logistik</label>
                <select 
                  value={activeMode === 'IN' ? itemIn.id : activeMode === 'OUT' ? itemOut.id : itemOpname.id}
                  onChange={(e) => {
                    if(activeMode === 'IN') setItemIn({...itemIn, id: e.target.value});
                    if(activeMode === 'OUT') setItemOut({...itemOut, id: e.target.value});
                    if(activeMode === 'OPNAME') setItemOpname({...itemOpname, id: e.target.value});
                  }}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-semibold"
                >
                  {listMasterProduk.map(p => <option key={p.id} value={p.id}>{p.id} - {p.nama} ({p.satuan})</option>)}
                </select>
              </div>

              {/* DYNAMIC FIELD PER MODE */}
              {activeMode === 'IN' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Kuantiti Masuk</label>
                      <input type="number" placeholder="0" value={itemIn.qty} onChange={(e) => setItemIn({...itemIn, qty: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold outline-none" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Harga Beli Satuan</label>
                      <input type="text" inputMode="numeric" placeholder="Rp" value={itemIn.harga} onChange={(e) => setItemIn({...itemIn, harga: formatInputRupiah(e.target.value)})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold outline-none" required />
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl text-xs flex justify-between font-bold text-emerald-800">
                    <span>Subtotal Mutasi:</span><span>Rp {totalHargaInTemp.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              {activeMode === 'OUT' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Kuantiti Keluar</label>
                      <input type="number" placeholder="0" value={itemOut.qty} onChange={(e) => setItemOut({...itemOut, qty: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold outline-none" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Alokasi Tujuan</label>
                      <select value={itemOut.tujuan} onChange={(e) => setItemOut({...itemOut, tujuan: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold outline-none">
                        <option value="Kedai Utama">Kedai Utama</option>
                        <option value="Gerobak">Gerobak Bajay</option>
                      </select>
                    </div>
                  </div>
                  <input type="text" placeholder="Keterangan (Cth: Restock Bar Pagi)..." value={itemOut.ket} onChange={(e) => setItemOut({...itemOut, ket: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs outline-none focus:bg-white" />
                </div>
              )}

              {activeMode === 'OPNAME' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Jumlah Fisik Riil</label>
                    <input type="number" placeholder="Dihitung Asli..." value={itemOpname.fisik} onChange={(e) => setItemOpname({...itemOpname, fisik: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Catatan Kondisi</label>
                    <input type="text" placeholder="Cth: Bocor / Aman" value={itemOpname.ket} onChange={(e) => setItemOpname({...itemOpname, ket: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs outline-none focus:bg-white" />
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800">
                + MASUKKAN BATCH LIST
              </button>
            </form>
          </>
        )}

        {/* BATCH CART LOGISTIK (DARK CONTAINER) */}
        {cartStok.length > 0 && (
          <div className="bg-zinc-900 p-5 rounded-2xl shadow-sm text-white space-y-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-800 pb-2">Daftar Batch Mutasi Logistik ({cartStok.length} Items)</span>
            
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {cartStok.map((item, idx) => (
                <div key={idx} className="bg-zinc-800 p-2.5 rounded-xl border border-zinc-700 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white">{item.nama}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{item.qty} {item.satuan} • <span className="text-zinc-500">{item.infoExtra}</span></p>
                  </div>
                  <button onClick={() => setCartStok(cartStok.filter((_, i) => i !== idx))} className="p-1 text-zinc-500 hover:text-rose-400"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>

            <button onClick={() => {
              setIsSubmitting(true);
              setTimeout(() => { alert("Seluruh pergerakan logistik berhasil dicatat ke file basis data gudang!"); setIsSubmitting(false); setCartStok([]); setActiveMode('menu'); }, 1500);
            }} disabled={isSubmitting} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1">
              <CheckCircle2 size={14} /> COMMIT & UPDATE DATA STOK
            </button>
          </div>
        )}

      </div>
    </div>
  );
}