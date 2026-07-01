'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { 
  CreditCard, User, Calendar, ChevronLeft, 
  CheckCircle2, Banknote, FileText, AlertCircle 
} from 'lucide-react';

export default function KasbonSaaSTypeScript() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaKru: '', 
    nominal: '', 
    keterangan: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const daftarKru = ["Chika", "Ibnu", "Novi", "Diska", "Nugye", "Ruslan", "A Novan"];
  const saranKeterangan = ["Kebutuhan rumah", "Kebutuhan anak (Susu/Pempers)", "Bayar cicilan / tagihan", "Berobat / Sakit", "Transportasi / Bensin"];

  // FIX: Parameter 'e' sekarang diberikan tipe ChangeEvent yang spesifik untuk HTMLInputElement
  const handleNominalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const angkaSaja = e.target.value.replace(/\D/g, '');
    const formatTitik = angkaSaja === '' ? '' : parseInt(angkaSaja, 10).toLocaleString('id-ID');
    setFormData({ ...formData, nominal: formatTitik });
  };

  // FIX: Parameter 'e' diberikan tipe FormEvent untuk menangani submit form
  const handleAjukan = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.namaKru || !formData.nominal || !formData.keterangan) return alert("Lengkapi data!");
    
    const nominalAsli = parseInt(formData.nominal.replace(/\./g, ''), 10);
    if (!window.confirm(`Konfirmasi Kasbon Kru: ${formData.namaKru} sebesar Rp ${nominalAsli.toLocaleString('id-ID')}?`)) return;

    setIsSubmitting(true);
    setTimeout(() => {
      alert("Kasbon karyawan berhasil dikunci.");
      setIsSubmitting(false);
      setFormData({ tanggal: new Date().toISOString().split('T')[0], namaKru: '', nominal: '', keterangan: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      {/* Header SaaS Profile */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold tracking-wide flex items-center gap-2 text-zinc-800">
            <CreditCard size={16} className="text-amber-600" /> Manajemen Kasbon
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <form onSubmit={handleAjukan} className="space-y-5">
          
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            {/* Grid Tanggal & Nama */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tanggal</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-3 text-zinc-400" />
                  <input 
                    type="date" 
                    value={formData.tanggal} 
                    onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                    className="w-full pl-9 p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nama Kru</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-zinc-400" />
                  <select 
                    value={formData.namaKru} 
                    onChange={(e) => setFormData({...formData, namaKru: e.target.value})} 
                    className="w-full pl-9 p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none appearance-none focus:bg-white" 
                    required
                  >
                    <option value="">Pilih Kru...</option>
                    {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Input Alasan */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Alasan Pengajuan</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3.5 text-zinc-400" />
                <input 
                  type="text" 
                  list="saran-alasan" 
                  placeholder="Cth: Kebutuhan mendesak rumah..." 
                  value={formData.keterangan} 
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})} 
                  className="w-full pl-9 p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:bg-white" 
                  required 
                />
                <datalist id="saran-alasan">
                  {saranKeterangan.map(i => <option key={i} value={i} />)}
                </datalist>
              </div>
            </div>

            {/* Input Nominal Otomatis Titik */}
            <div className="pt-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nominal Pinjaman</label>
              <div className="flex bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 shadow-sm transition-all">
                <div className="bg-zinc-100 border-r border-zinc-300 px-4 py-3 flex items-center text-zinc-500">
                  <Banknote size={18} />
                </div>
                <div className="flex items-center pl-3">
                  <span className="text-zinc-500 font-semibold text-sm">Rp</span>
                </div>
                <input 
                  type="text" 
                  inputMode="numeric" 
                  placeholder="0" 
                  value={formData.nominal} 
                  onChange={handleNominalChange} 
                  className="w-full p-3 text-zinc-900 font-bold text-lg bg-transparent outline-none" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* SaaS Alert Warning Box */}
          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Sistem akan mencatat pengeluaran ini dan <strong className="font-bold text-amber-900">memotong total gaji bersih (take-home pay)</strong> karyawan secara otomatis pada akhir periode bulan berjalan.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 flex items-center justify-center"
          >
            {isSubmitting ? 'MEMPROSES TRANSAKSI...' : 'KUNCI & AJUKAN POTONG GAJI'}
          </button>
          
        </form>
      </div>
    </div>
  );
}