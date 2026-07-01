'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, RefreshCw, Landmark, HelpCircle } from 'lucide-react';

export default function InputKasbonSaaS() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaKru: '',
    nominal: '',
    keterangan: ''
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const daftarKru = ["Chika", "Nugye", "Diska", "Ibnu"];

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };

  const bersihAngka = (teks: string) => {
    return parseInt(teks.replace(/\./g, ''), 10) || 0;
  };

  const handleSimpanKasbon = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.namaKru) return alert("Pilih nama Kru yang mengajukan kasbon!");
    
    const nominalAsli = bersihAngka(formData.nominal);
    if (nominalAsli <= 0) return alert("Nominal kasbon tidak valid!");
    if (!formData.keterangan.trim()) return alert("Harap isi keterangan tujuan kasbon!");

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/kasbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: formData.tanggal,
          namaKru: formData.namaKru,
          nominalAsli: nominalAsli,
          keterangan: formData.keterangan
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        // Reset form inputan nominal dan keterangan setelah berhasil
        setFormData({ ...formData, nominal: '', keterangan: '' });
      } else {
        alert(`❌ Gagal menyimpan kasbon: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Terjadi gangguan jaringan ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      {/* Header Navigasi */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200/80 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold tracking-wide text-zinc-800 uppercase flex items-center gap-1.5">
            <Landmark size={16} className="text-amber-500" /> Log Kasbon Kru
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5">
        
        <form onSubmit={handleSimpanKasbon} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          
          {/* BARIS TANGGAL & NAMA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tanggal Log</label>
              <input 
                type="date" 
                value={formData.tanggal} 
                onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nama Anggota Staf</label>
              <select 
                value={formData.namaKru} 
                onChange={(e) => setFormData({...formData, namaKru: e.target.value})} 
                className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer" 
                required
              >
                <option value="">-- Pilih Kru --</option>
                {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
          
          {/* BARIS KETERANGAN BELANJA */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Alasan / Keterangan Pinjaman</label>
            <input 
              type="text" 
              placeholder="Contoh: Kebutuhan rumah tangga / Susu anak" 
              value={formData.keterangan} 
              onChange={(e) => setFormData({...formData, keterangan: e.target.value})} 
              className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white" 
              required 
            />
          </div>

          {/* INPUT NOMINAL KASBON RATA KANAN (RIGHT-ALIGNED) ANTI TUMPANG TINDIH */}
          <div className="pt-2 border-t border-zinc-100">
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:bg-white transition-all">
              <div className="flex items-center gap-1.5 px-3 py-3.5 bg-zinc-100/80 border-r border-zinc-200 min-w-[130px]">
                <HelpCircle size={14} className="text-zinc-500" />
                <span className="text-[11px] font-bold text-zinc-600">Nominal Kasbon</span>
              </div>
              <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
              <input 
                type="text" 
                inputMode="numeric" 
                placeholder="0" 
                value={formData.nominal} 
                onChange={(e) => setFormData({...formData, nominal: formatRupiah(e.target.value)})} 
                className="w-full py-3 pr-4 bg-transparent text-sm font-black text-zinc-800 outline-none text-right" 
                required 
              />
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full py-4 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
              isSubmitting ? 'bg-zinc-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSubmitting ? 'Mencatat Kasbon...' : 'SAHKAN PINJAMAN KASBON'}
          </button>
        </form>

      </div>
    </div>
  );
}