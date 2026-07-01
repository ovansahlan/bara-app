'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, TrendingUp, Info, RefreshCw, Banknote, QrCode, CreditCard, Smartphone } from 'lucide-react';

interface RincianOmset {
  tunai: number;
  qris: number;
  edcTransfer: number;
  grabOnline: number;
  totalPenjualan: number;
}

export default function InputOmsetSaaS() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaKasir: '',
    shift: 'Shift 1 (Pagi)'
  });

  const [omset, setOmset] = useState({
    tunai: '',
    qris: '',
    edcTransfer: '',
    grabOnline: ''
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [omsetPagi, setOmsetPagi] = useState<RincianOmset | null>(null);
  const [isLoadingHelper, setIsLoadingHelper] = useState<boolean>(false);

  const daftarKru = ["Chika", "Nugye", "Diska", "Ibnu"];
  const daftarShift = ["Shift 1 (Pagi)", "Shift 2 (Malam/Tutup)", "Full Day (Gabungan)"];

  const formatRupiah = (angka: string) => {
    const nomor = angka.replace(/\D/g, '');
    return nomor === '' ? '' : parseInt(nomor, 10).toLocaleString('id-ID');
  };

  const bersihAngka = (teks: string) => {
    return parseInt(teks.replace(/\./g, ''), 10) || 0;
  };

  // HELPER SHIFT MALAM DENGAN RINCIAN LENGKAP
  useEffect(() => {
    const fetchOmsetPagi = async () => {
      if (formData.shift === 'Shift 2 (Malam/Tutup)') {
        setIsLoadingHelper(true);
        setOmsetPagi(null);
        try {
          const res = await fetch(`/api/penjualan?tanggal=${formData.tanggal}`);
          const data = await res.json();
          if (res.ok) {
            setOmsetPagi(data);
          }
        } catch (error) {
          console.error("Gagal menarik data rincian shift pagi", error);
        } finally {
          setIsLoadingHelper(false);
        }
      } else {
        setOmsetPagi(null); 
      }
    };

    fetchOmsetPagi();
  }, [formData.shift, formData.tanggal]);

  const totalOmsetRealtime = bersihAngka(omset.tunai) + bersihAngka(omset.qris) + bersihAngka(omset.edcTransfer) + bersihAngka(omset.grabOnline);

  const handleSimpanOmset = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.namaKasir) return alert("Pilih Nama Kasir terlebih dahulu!");
    if (totalOmsetRealtime <= 0) return alert("Total penjualan belum diisi atau tidak valid!");

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/penjualan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: formData.tanggal,
          namaKasir: formData.namaKasir,
          shift: formData.shift,
          tunai: bersihAngka(omset.tunai),
          qris: bersihAngka(omset.qris),
          edcTransfer: bersihAngka(omset.edcTransfer),
          grabOnline: bersihAngka(omset.grabOnline),
          totalPenjualan: totalOmsetRealtime
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        setOmset({ tunai: '', qris: '', edcTransfer: '', grabOnline: '' });
      } else {
        alert(`❌ Gagal menyimpan omset: ${data.error}`);
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
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200/80 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold tracking-wide text-zinc-800 uppercase flex items-center gap-1.5">
            <TrendingUp size={16} className="text-emerald-500" /> Setor Omset
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-5">
        
        <form onSubmit={handleSimpanOmset} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tanggal</label>
              <input type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Shift</label>
              <select value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer">
                {daftarShift.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nama Kasir</label>
            <select value={formData.namaKasir} onChange={(e) => setFormData({...formData, namaKasir: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer" required>
              <option value="">-- Pilih Kasir --</option>
              {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          {/* HELPER SHIFT MALAM DENGAN RINCIAN MULTI-KATEGORI */}
          {formData.shift === 'Shift 2 (Malam/Tutup)' && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                {isLoadingHelper ? (
                  <RefreshCw size={16} className="text-sky-500 animate-spin mt-0.5" />
                ) : (
                  <Info size={16} className="text-sky-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wide">Helper Hitung Malam</p>
                  <p className="text-xs text-sky-800 font-medium mt-0.5">
                    {isLoadingHelper ? "Sedang menyinkronkan data kas..." : "Berikut adalah rekapitulasi data dari Shift Pagi hari ini:"}
                  </p>
                </div>
              </div>

              {!isLoadingHelper && omsetPagi && omsetPagi.totalPenjualan > 0 && (
                <div className="pt-2.5 border-t border-sky-200/70 space-y-2">
                  {/* Grid Rincian Tipe Bayar */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-sky-800 font-medium bg-white/50 p-2.5 rounded-lg border border-sky-100">
                    <div className="flex justify-between"><span>💵 Tunai:</span> <b>{omsetPagi.tunai.toLocaleString('id-ID')}</b></div>
                    <div className="flex justify-between"><span>📱 QRIS:</span> <b>{omsetPagi.qris.toLocaleString('id-ID')}</b></div>
                    <div className="flex justify-between"><span>💳 EDC/Trans:</span> <b>{omsetPagi.edcTransfer.toLocaleString('id-ID')}</b></div>
                    <div className="flex justify-between"><span>🛵 Online:</span> <b>{omsetPagi.grabOnline.toLocaleString('id-ID')}</b></div>
                  </div>
                  {/* Total Akumulasi Pagi */}
                  <div className="text-xs font-bold text-sky-950 flex justify-between px-1">
                    <span>TOTAL PENJUALAN PAGI:</span>
                    <span className="bg-sky-200 text-sky-950 px-2 py-0.5 rounded-md">Rp {omsetPagi.totalPenjualan.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              {!isLoadingHelper && (!omsetPagi || omsetPagi.totalPenjualan === 0) && (
                <p className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 p-2 rounded-lg text-center">
                  ⚠️ Belum ada catatan setoran data dari Shift Pagi hari ini.
                </p>
              )}
            </div>
          )}

          {/* INPUT NOMINAL KATEGORI */}
          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Rincian Nominal Omset</label>
            
            {/* Input Tunai */}
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-emerald-400 focus-within:bg-white transition-all">
              <div className="flex items-center gap-2 px-3 py-3.5 bg-zinc-100/80 border-r border-zinc-200 min-w-[120px]">
                <Banknote size={16} className="text-zinc-500" />
                <span className="text-xs font-bold text-zinc-600">Tunai</span>
              </div>
              <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
              <input 
                type="text" inputMode="numeric" placeholder="0"
                value={omset.tunai} 
                onChange={(e) => setOmset({...omset, tunai: formatRupiah(e.target.value)})} 
                className="w-full py-3 pr-4 bg-transparent text-sm font-black text-zinc-800 outline-none text-right" 
              />
            </div>

            {/* Input QRIS */}
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-emerald-400 focus-within:bg-white transition-all">
              <div className="flex items-center gap-2 px-3 py-3.5 bg-zinc-100/80 border-r border-zinc-200 min-w-[120px]">
                <QrCode size={16} className="text-zinc-500" />
                <span className="text-xs font-bold text-zinc-600">QRIS</span>
              </div>
              <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
              <input 
                type="text" inputMode="numeric" placeholder="0"
                value={omset.qris} 
                onChange={(e) => setOmset({...omset, qris: formatRupiah(e.target.value)})} 
                className="w-full py-3 pr-4 bg-transparent text-sm font-black text-zinc-800 outline-none text-right" 
              />
            </div>

            {/* Input EDC/Transfer */}
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-emerald-400 focus-within:bg-white transition-all">
              <div className="flex items-center gap-2 px-3 py-3.5 bg-zinc-100/80 border-r border-zinc-200 min-w-[120px]">
                <CreditCard size={16} className="text-zinc-500" />
                <span className="text-xs font-bold text-zinc-600">EDC/Trans</span>
              </div>
              <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
              <input 
                type="text" inputMode="numeric" placeholder="0"
                value={omset.edcTransfer} 
                onChange={(e) => setOmset({...omset, edcTransfer: formatRupiah(e.target.value)})} 
                className="w-full py-3 pr-4 bg-transparent text-sm font-black text-zinc-800 outline-none text-right" 
              />
            </div>

            {/* Input Grab/Online */}
            <div className="flex items-center bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:border-emerald-400 focus-within:bg-white transition-all">
              <div className="flex items-center gap-2 px-3 py-3.5 bg-zinc-100/80 border-r border-zinc-200 min-w-[120px]">
                <Smartphone size={16} className="text-zinc-500" />
                <span className="text-xs font-bold text-zinc-600">Grab/Online</span>
              </div>
              <div className="pl-3 pr-1 text-zinc-400 font-bold text-xs">Rp</div>
              <input 
                type="text" inputMode="numeric" placeholder="0"
                value={omset.grabOnline} 
                onChange={(e) => setOmset({...omset, grabOnline: formatRupiah(e.target.value)})} 
                className="w-full py-3 pr-4 bg-transparent text-sm font-black text-zinc-800 outline-none text-right" 
              />
            </div>
          </div>

          {/* TOTAL OMSET OTOMATIS */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Total Penjualan</span>
            <span className="text-lg font-black text-emerald-700">Rp {totalOmsetRealtime.toLocaleString('id-ID')}</span>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md">
            {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSubmitting ? 'Mengunci Data...' : 'SIMPAN TOTAL PENJUALAN'}
          </button>
        </form>

      </div>
    </div>
  );
}