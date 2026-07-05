'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, Save, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function FormBelanjaOwner() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'Dapur',
    keterangan: '',
    nominal: '',
    peruntukan: 'Kedai'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/owner/belanja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: formData.tanggal,
          kategori: formData.kategori,
          keterangan: formData.keterangan,
          nominal: formData.nominal.replace(/\D/g, ''), // Bersihkan format Rupiah
          peruntukan: formData.peruntukan
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/owner');
        }, 1500);
      } else {
        setErrorMsg(result.error || 'Terjadi kesalahan.');
      }
    } catch (error) {
      setErrorMsg('Gagal menyambung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format Rupiah saat mengetik
  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val) {
      val = parseInt(val, 10).toLocaleString('id-ID');
    }
    setFormData({ ...formData, nominal: val });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/owner" className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">Belanja Owner</h1>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Otoritas Pusat</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shadow-sm">
          <Wallet size={18} />
        </div>
      </div>

      <div className="max-w-md mx-auto p-5 mt-4">
        {isSuccess ? (
          <div className="bg-emerald-500 text-white p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl shadow-emerald-500/20 animate-in fade-in zoom-in-95 duration-500">
            <CheckCircle2 size={64} className="mb-4" />
            <h2 className="text-2xl font-black mb-1">Berhasil!</h2>
            <p className="text-sm font-medium text-emerald-100">Data belanja owner telah disimpan.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 space-y-5">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tanggal</label>
              <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-semibold outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Peruntukan Cabang</label>
              <select name="peruntukan" value={formData.peruntukan} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-semibold outline-none focus:border-blue-500 transition-colors appearance-none">
                <option value="Kedai">Kedai Pusat</option>
                <option value="Gerobak">Gerobak Cabang</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kategori Internal</label>
              <select name="kategori" value={formData.kategori} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-semibold outline-none focus:border-blue-500 transition-colors appearance-none">
                <option value="Dapur">Dapur / Bahan Makanan</option>
                <option value="Bar">Bar / Bahan Minuman</option>
                <option value="Operational">Operasional Kedai</option>
                <option value="Gerobak">Operasional Gerobak</option>
                <option value="Lain-lain">Lain-lain / Aset</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Keterangan Item</label>
              <input type="text" name="keterangan" placeholder="Contoh: Beli Roti, Bayar Listrik..." value={formData.keterangan} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-sm font-semibold outline-none focus:border-blue-500 transition-colors placeholder:text-slate-300" />
            </div>

            <div className="space-y-1.5 pb-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nominal Rp</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
                <input type="text" name="nominal" placeholder="0" value={formData.nominal} onChange={handleNominalChange} required className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-12 rounded-2xl text-lg font-black text-blue-600 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-300" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isLoading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
            </button>
            
          </form>
        )}
      </div>

    </div>
  );
}