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

  const handleTambahCart = (e: FormEvent) => {
    e.preventDefault();
    if (!kru) return alert("Pilih Petugas Gudang!");

    const currentMaster = listMasterProduk.find(p => p.id === (activeMode === 'IN' ? itemIn.id : activeMode === 'OUT' ? itemOut.id : itemOpname.id));
    if (!currentMaster) return;

    if (activeMode === 'IN') {
      if (!itemIn.qty || !itemIn.harga) return alert("Lengkapi data barang masuk!");
      
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
      if (!itemOut.qty) return alert("Masukkan kuantiti keluar!");
      setCartStok([...cartStok, {
        id: itemOut.id, nama: currentMaster.nama, tipe: 'OUT',
        qty: parseInt(itemOut.qty), satuan: currentMaster.satuan,
        infoExtra: `Tujuan: ${itemOut.tujuan} ${itemOut.ket ? `(${itemOut.ket})` : ''}`, totalNilai: 0
      }]);
      setItemOut({ id: 'B001', qty: '', tujuan: 'Kedai Utama', ket: '' });
    }
    else if (activeMode === 'OPNAME') {
      if (!itemOpname.fisik) return alert("Masukkan fisik asli gudang!");
      
      const selisih = parseInt(itemOpname.fisik) - currentMaster.sistem;
      setCartStok([...cartStok, {
        id: itemOpname.id, nama: currentMaster.nama, tipe: 'OPNAME',
        qty: parseInt(itemOpname.fisik), satuan: currentMaster.satuan,
        infoExtra: `Sistem: ${currentMaster.sistem} | Selisih: ${selisih > 0 ? `+${selisih}` : selisih} ${itemOpname.ket ? `[${itemOpname.ket}]` : ''}`, totalNilai: 0
      }]);
      setItemOpname({ id: 'B001', fisik: '', ket: '' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      {/* Header Statis SaaS */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => activeMode === 'menu' ? window.location.href = '/' : (setActiveMode('menu'), setCartStok([]))} 
            className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-sm font-bold tracking-wide uppercase text-zinc-800">
            {activeMode === 'menu' ? 'Gudang & Logistik' : `Mutasi: ${activeMode}`}
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-5">
        
        {/* MENU UTAMA SELEKTOR MUTASI */}
        {activeMode === 'menu' && (
          <div className="space-y-3 pt-4">
            <button onClick={() => setActiveMode('IN')} className="w-full p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm flex items-center gap-4 text-left transition-all hover:border-zinc-300 active:scale-98">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100"><ArrowDownLeft size={20} /></div>
              <div>
                <h3 className="text-sm font-bold text-zinc-800">Stock-In (Barang Masuk)</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Penambahan pasokan atau pembelanjaan logistik baru</p>
              </div>
            </button>
            <button onClick={() => setActiveMode('OUT')} className="w-full p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm flex items-center gap-4 text-left transition-all hover:border-zinc-300 active:scale-98">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100"><ArrowUpRight size={20} /></div>
              <div>
                <h3 className="text-sm font-bold text-zinc-800">Stock-Out (Barang Keluar)</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Pemakaian bahan baku di bar atau oper logistik ke gerobak</p>
              </div>
            </button>
            <button onClick={() => setActiveMode('OPNAME')} className="w-full p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm flex items-center gap-4 text-left transition-all hover:border-zinc-300 active:scale-98">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100"><ClipboardCheck size={20} /></div>
              <div>
                <h3 className="text-sm font-bold text-zinc-800">Stock Opname Harian</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Audit kesesuaian fisik asli di kulkas dengan sistem</p>
              </div>
            </button>
          </div>
        )}

        {/* UTILITY BAR INFORMASI PETUGAS */}
        {activeMode !== 'menu' && (
          <>
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Petugas Gudang:</span>
              <select 
                value={kru} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setKru(e.target.value)} 
                className="text-xs font-bold bg-transparent outline-none text-zinc-800 cursor-pointer" 
                required
              >
                <option value="">-- Pilih Nama Anda --</option>
                {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            {/* FORM MULTI-INPUT MUTASI BARANG */}
            <form onSubmit={handleTambahCart} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4 relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeMode === 'IN' ? 'bg-emerald-500' : activeMode === 'OUT' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Nama Item Logistik</label>
                <select 
                  value={activeMode === 'IN' ? itemIn.id : activeMode === 'OUT' ? itemOut.id : itemOpname.id} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    if(activeMode === 'IN') setItemIn({...itemIn, id: e.target.value});
                    if(activeMode === 'OUT') setItemOut({...itemOut, id: e.target.value});
                    if(activeMode === 'OPNAME') setItemOpname({...itemOpname, id: e.target.value});
                  }} 
                  className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold text-zinc-800 outline-none focus:bg-white"
                >
                  {listMasterProduk.map(p => <option key={p.id} value={p.id}>{p.id} - {p.nama} ({p.satuan})</option>)}
                </select>
              </div>

              {/* INPUT SPESIFIK BERDASARKAN MODE OPERASIONAL */}
              {activeMode === 'IN' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Kuantiti Masuk" value={itemIn.qty} onChange={(e: ChangeEvent<HTMLInputElement>) => setItemIn({...itemIn, qty: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-semibold outline-none focus:bg-white" required />
                    <input type="text" inputMode="numeric" placeholder="Harga Beli Satuan" value={itemIn.harga} onChange={(e: ChangeEvent<HTMLInputElement>) => setItemIn({...itemIn, harga: formatInputRupiah(e.target.value)})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-semibold outline-none focus:bg-white" required />
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs flex justify-between font-bold text-zinc-600">
                    <span>Subtotal Nilai Mutasi:</span>
                    <span className="text-emerald-600">Rp {totalHargaInTemp.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              {activeMode === 'OUT' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Kuantiti Keluar" value={itemOut.qty} onChange={(e: ChangeEvent<HTMLInputElement>) => setItemOut({...itemOut, qty: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-semibold outline-none focus:bg-white" required />
                    <select value={itemOut.tujuan} onChange={(e: ChangeEvent<HTMLSelectElement>) => setItemOut({...itemOut, tujuan: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold outline-none">
                      <option value="Kedai Utama">Kedai Utama</option>
                      <option value="Gerobak">Gerobak Bajay</option>
                    </select>
                  </div>
                  <input type="text" placeholder="Catatan Tambahan (Cth: Bar Bocor / Rusak)..." value={itemOut.ket} onChange={(e: ChangeEvent<HTMLInputElement>) => setItemOut({...itemOut, ket: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs outline-none focus:bg-white" />
                </div>
              )}

              {activeMode === 'OPNAME' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Fisik Riil Dihitung" value={itemOpname.fisik} onChange={(e: ChangeEvent<HTMLInputElement>) => setItemOpname({...itemOpname, fisik: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-semibold outline-none focus:bg-white" required />
                    <input type="text" placeholder="Keterangan Kondisi..." value={itemOpname.ket} onChange={(e: ChangeEvent<HTMLInputElement>) => setItemOpname({...itemOpname, ket: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs outline-none focus:bg-white" />
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-3 bg-zinc-950 text-white text-xs font-bold rounded-xl transition-all active:scale-98 shadow-sm flex items-center justify-center gap-1">
                <Plus size={14} strokeWidth={2.5} /> MASUKKAN KE BATCH LIST
              </button>
            </form>
          </>
        )}

        {/* KERANJANG MUTASI RINGKASAN BATCH (SAAS DARK CONTAINER) */}
        {cartStok.length > 0 && (
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-lg text-white space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-800 pb-2">Batch Antrean Mutasi ({cartStok.length} Items)</span>
            
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {cartStok.map((item, idx) => (
                <div key={idx} className="bg-zinc-800/90 p-3 rounded-xl border border-zinc-700/60 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      {item.nama} 
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        item.tipe === 'IN' ? 'bg-emerald-900 text-emerald-300' : item.tipe === 'OUT' ? 'bg-rose-900 text-rose-300' : 'bg-blue-900 text-blue-300'
                      }`}>{item.tipe}</span>
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium">{item.qty} {item.satuan} • <span className="text-zinc-500 font-normal">{item.infoExtra}</span></p>
                  </div>
                  <button onClick={() => setCartStok(cartStok.filter((_, i) => i !== idx))} className="p-2 bg-zinc-700/30 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => { 
                setIsSubmitting(true); 
                setTimeout(() => { 
                  alert("Seluruh mutasi logistik berhasil divalidasi ke basis data stok!"); 
                  setIsSubmitting(false); setCartStok([]); setActiveMode('menu'); 
                }, 1500); 
              }} 
              disabled={isSubmitting} 
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CheckCircle2 size={16} /> COMMIT & UPDATE DATA STOK
            </button>
          </div>
        )}

      </div>
    </div>
  );
}