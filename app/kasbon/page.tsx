'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, User, Calendar, ChevronLeft, 
  CheckCircle2, Banknote, FileText, AlertCircle 
} from 'lucide-react';

export default function KasbonSaaS() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaKru: '',
    nominal: '',
    keterangan: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const daftarKru = ["Chika", "Ibnu", "Novi", "Diska", "Nugye", "Ruslan", "A Novan"];
  const saranKeterangan = ["Kebutuhan rumah", "Kebutuhan anak (Susu/Pempers)", "Bayar cicilan / tagihan", "Berobat / Sakit", "Transportasi / Bensin"];

  const handleNominalChange = (e) => {
    const angkaSaja = e.target.value.replace(/\D/g, '');
    const formatTitik = angkaSaja === '' ? '' : parseInt(angkaSaja, 10).toLocaleString('id-ID');
    setFormData({ ...formData, nominal: formatTitik });
  };

  const handleAjukan = (e) => {
    e.preventDefault();
    if (!formData.namaKru || !formData.nominal || !formData.keterangan) return alert("Lengkapi semua data!");
    
    const nominalAsli = parseInt(formData.nominal.replace(/\./g, ''), 10);
    const konfirmasi = window.confirm(`Konfirmasi Pengajuan Kasbon:\n\nNama: ${formData.namaKru}\nNominal: Rp ${nominalAsli.toLocaleString('id-ID')}\nAlasan: ${formData.keterangan}\n\nLanjutkan pemotongan gaji?`);
    if (!konfirmasi) return;

    setIsSubmitting(true);
    setTimeout(() => {
      alert("✅ Pengajuan Kasbon Berhasil Dicatat ke DB_Kasbon.csv");
      setIsSubmitting(false);
      setFormData({ tanggal: new Date().toISOString().split('T')[0], namaKru: '', nominal: '', keterangan: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      
      {/* Header SaaS Modal */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold tracking-wide flex items-center gap-2 text-zinc-800">
            <CreditCard size={16} className="text-amber-600" /> Pengajuan Kasbon
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <form onSubmit={handleAjukan} className="space-y-5">
          
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tanggal</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-3 text-zinc-400" />
                  <input type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="w-full pl-9 p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nama Kru</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-zinc-400" />
                  <select value={formData.namaKru} onChange={(e) => setFormData({...formData, namaKru: e.target.value})} className="w-full pl-9 p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none appearance-none" required>
                    <option value="">Pilih...</option>
                    {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Alasan / Keterangan</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3.5 text-zinc-400" />
                <input type="text" list="saran-alasan" placeholder="Cth: Kebutuhan anak..." value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} className="w-full pl-9 p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none" required />
                <datalist id="saran-alasan">{saranKeterangan.map(i => <option key={i} value={i} />)}</datalist>
              </div>
            </div>

            {/* Input Nominal Cerdas */}
            <div className="pt-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nominal Pinjaman</label>
              <div className="flex bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 shadow-sm transition-all">
                <div className="bg-zinc-100 border-r border-zinc-300 px-4 py-3 flex items-center text-zinc-500"><Banknote size={18} /></div>
                <div className="flex items-center pl-3"><span className="text-zinc-500 font-semibold text-lg">Rp</span></div>
                <input type="text" inputMode="numeric" placeholder="0" value={formData.nominal} onChange={handleNominalChange} className="w-full p-3 text-zinc-900 font-black text-xl outline-none bg-transparent" required />
              </div>
            </div>
          </div>

          {/* Alert Box SaaS Style */}
          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Pengajuan ini akan dicatat ke sistem dan <strong className="font-bold text-amber-900">otomatis memotong gaji</strong> Anda pada periode penggajian bulan ini.
            </p>
          </div>

          <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all ${isSubmitting ? 'bg-zinc-400 text-white cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95'}`}>
            {isSubmitting ? <CheckCircle2 size={18} className="animate-pulse" /> : <CreditCard size={18} />}
            {isSubmitting ? 'MEMPROSES...' : 'AJUKAN KASBON'}
          </button>
        </form>
      </div>
    </div>
  );
}