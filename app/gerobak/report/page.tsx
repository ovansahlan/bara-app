'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, MessageCircle, RefreshCw, Send, FileText, Store } from 'lucide-react';

export default function ReportGerobak() {
  const [loading, setLoading] = useState<boolean>(false);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [namaKru, setNamaKru] = useState<string>('');
  const [pesanWA, setPesanWA] = useState<string>('');

  const daftarKru = ["Ruslan", "Elan"];
  const formatIDR = (val: number) => `Rp ${new Intl.NumberFormat('id-ID').format(val || 0)}`;

  const generateReport = async () => {
    if (!namaKru) return setPesanWA('Silakan pilih Nama Kru terlebih dahulu.');
    
    setLoading(true);
    try {
      const res = await fetch(`/api/gerobak/report?tanggal=${tanggal}&kru=${namaKru.toLowerCase()}`, { cache: 'no-store' });
      const data = await res.json();

      if (data.success) {
        const tglIndo = tanggal.split('-').reverse().join('/');
        let teks = `*REKAP SHIFT GEROBAK BARA*\n📅 Tanggal: ${tglIndo}\n🧑‍🍳 Kru Bertugas: ${namaKru}\n\n`;

        // 1. OMSET
        teks += `*💰 DETAIL PEMASUKAN*\n`;
        teks += `- Tunai Masuk: ${formatIDR(data.omset.tunai)}\n`;
        teks += `- QRIS: ${formatIDR(data.omset.qris)}\n`;
        teks += `- EDC/TF: ${formatIDR(data.omset.edc)}\n`;
        teks += `- Grab: ${formatIDR(data.omset.grab)}\n`;
        teks += `*Total Gross Omset: ${formatIDR(data.omset.total)}*\n\n`;

        // 2. PENGELUARAN
        teks += `*💸 PENGELUARAN LACI*\n`;
        if (data.pengeluaran.length > 0) {
          data.pengeluaran.forEach((p: any, i: number) => {
            teks += `${i + 1}. ${p.keterangan} - ${formatIDR(p.nominal)}\n`;
          });
          teks += `*Total Belanja: ${formatIDR(data.totalPengeluaran)}*\n\n`;
        } else {
          teks += `- Tidak ada pengeluaran.\n\n`;
        }

        // 3. KASBON (Jika ada)
        if (data.totalKasbon > 0) {
          teks += `*📌 KASBON KRU*\n`;
          teks += `- Penarikan Kasbon: ${formatIDR(data.totalKasbon)}\n\n`;
        }

        // 4. SISA UANG TUNAI
        teks += `*💵 SETORAN FISIK LACI KASIR*\n`;
        teks += `👉 *Wajib Setor Tunai: ${formatIDR(data.sisaUangTunai)}*\n`;
        teks += `_(Rumus: Tunai Masuk - Total Belanja - Kasbon)_\n`;

        setPesanWA(teks);
      }
    } catch (e) {
      alert("Gagal merakit laporan.");
    } finally {
      setLoading(false);
    }
  };

  const kirimKeWA = () => {
    if (!pesanWA || !namaKru) return alert("Silakan Generate Laporan terlebih dahulu!");
    const encodedText = encodeURIComponent(pesanWA);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  useEffect(() => {
    if (namaKru) generateReport();
  }, [tanggal, namaKru]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24 font-sans">
      <div className="bg-amber-500 border-b border-amber-600 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/gerobak" className="p-2.5 bg-amber-400/50 text-amber-950 rounded-full hover:bg-amber-400 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black text-amber-950 uppercase flex items-center gap-1.5 tracking-wider">
            <MessageCircle size={16} /> Laporan WA Gerobak
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-6 space-y-5">
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5 tracking-widest">Tanggal</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-amber-500 uppercase mb-1.5 tracking-widest">Kru Bertugas</label>
              <select value={namaKru} onChange={(e) => setNamaKru(e.target.value)} className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 outline-none cursor-pointer">
                <option value="">-- Pilih Kru --</option>
                {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
          
          <button onClick={generateReport} disabled={loading || !namaKru} className="w-full py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Merakit Data...' : 'RE-GENERATE LAPORAN'}
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-1.5">
            <FileText size={14} className="text-zinc-500" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Preview Laporan Gerobak</span>
          </div>
          <textarea 
            value={pesanWA}
            onChange={(e) => setPesanWA(e.target.value)}
            className="w-full h-80 p-5 text-xs font-medium font-mono text-zinc-700 bg-transparent outline-none resize-none leading-relaxed"
            placeholder="Pilih nama kru untuk memunculkan laporan..."
          />
        </div>

        <button onClick={kirimKeWA} disabled={!pesanWA} className="w-full py-4 bg-emerald-500 text-white font-black text-sm tracking-wide rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50">
          <Send size={18} /> KIRIM KE WHATSAPP
        </button>
      </div>
    </div>
  );
}