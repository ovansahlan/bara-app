'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Calendar, Tag, ChevronLeft, 
  CheckCircle2, Banknote, Lock, FileText 
} from 'lucide-react';

export default function BelanjaOwnerSaaSTypeScript() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategoriInternal: 'Operational',
    keteranganLengkap: '', 
    nominal: ''
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const daftarKategoriInternal = ["Operational", "Bar", "Dapur", "Gerobak"];
  const saranKeterangan = ["Listrik Kafe", "Internet & Wi-Fi", "Belanja Supplier Salman", "Kopi Arabica & Robusta (A2, R2)", "Syrup Hazelnut / Vanilla", "Belanja Pabrik Mie"];

  // FIX: Menambahkan tipe data ChangeEvent<HTMLInputElement> pada parameter e
  const handleNominalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const angkaSaja = e.target.value.replace(/\D/g, '');
    const formatTitik = angkaSaja === '' ? '' : parseInt(angkaSaja, 10).toLocaleString('id-ID');
    setFormData({ ...formData, nominal: formatTitik });
  };

  // FIX: Menambahkan tipe data FormEvent pada parameter e untuk proses submit form
  const handleSubmitOwner = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.keteranganLengkap || !formData.nominal) return alert("Lengkapi data!");
    
    setIsSubmitting(true);
    setTimeout(() => {
      alert("🔒 Data Akses Owner Berhasil Disimpan ke DB_Belanja_Owner.csv");
      setIsSubmitting(false);
      setFormData({ ...formData, keteranganLengkap: '', nominal: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 font-sans font-medium selection:bg-indigo-500">
      
      {/* Header Dark Mode Premium */}
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-800 text-zinc-400 rounded-full hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-400" />
            <h1 className="text-sm font-bold tracking-wide text-zinc-100">Owner Access</h1>
          </div>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Buku Belanja Owner</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Khusus pelaporan restock suplai eksternal & utilitas utama.</p>
          </div>
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/10">
            <Lock size={18} />
          </div>
        </div>

        <form onSubmit={handleSubmitOwner} className="space-y-5">
          
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
            
            {/* Grid Input Tanggal & Kategori */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tanggal</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-3 text-zinc-500" />
                  <input 
                    type="date" 
                    value={formData.tanggal} 
                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                    className="w-full pl-9 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Kategori</label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-3 text-zinc-500" />
                  <select 
                    value={formData.kategoriInternal} 
                    onChange={(e) => setFormData({...formData, kategoriInternal: e.target.value})} 
                    className="w-full pl-9 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    {daftarKategoriInternal.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Input Deskripsi / Supplier */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Rincian Belanja / Supplier</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3.5 text-zinc-500" />
                <input 
                  type="text" 
                  list="saran-owner" 
                  placeholder="Cth: Belanja Supplier Salman..." 
                  value={formData.keteranganLengkap} 
                  onChange={(e) => setFormData({...formData, keteranganLengkap: e.target.value})} 
                  className="w-full pl-9 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  required 
                />
                <datalist id="saran-owner">
                  {saranKeterangan.map(i => <option key={i} value={i} />)}
                </datalist>
              </div>
            </div>

            {/* Input Nominal Khusus Angka + Otomatis Titik */}
            <div className="pt-2">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Nominal Pengeluaran Owner</label>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                <div className="bg-zinc-900 border-r border-zinc-800 px-4 py-3 flex items-center text-zinc-500">
                  <Banknote size={18} />
                </div>
                <div className="flex items-center pl-3">
                  <span className="text-zinc-600 font-semibold text-lg">Rp</span>
                </div>
                <input 
                  type="text" 
                  inputMode="numeric" 
                  placeholder="0" 
                  value={formData.nominal} 
                  onChange={handleNominalChange} 
                  className="w-full p-3 text-white font-black text-xl bg-transparent outline-none" 
                  required 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full py-4 rounded-xl text-xs font-bold text-white shadow-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              isSubmitting ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-zinc-700' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 border border-indigo-500'
            }`}
          >
            {isSubmitting ? <CheckCircle2 size={16} className="animate-pulse" /> : <ShieldCheck size={16} />}
            {isSubmitting ? 'MENYIMPAN DATA...' : 'SECURE COMMIT DATA'}
          </button>
          
        </form>
      </div>
    </div>
  );
}