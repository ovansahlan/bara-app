'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, MessageCircle, RefreshCw, Send, FileText } from 'lucide-react';

export default function LaporanWhatsApp() {
  const [loading, setLoading] = useState<boolean>(false);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<string>('Pagi');
  const [pesanWA, setPesanWA] = useState<string>('');

  const formatIDR = (val: number) => `Rp ${new Intl.NumberFormat('id-ID').format(val || 0)}`;

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/report?tanggal=${tanggal}`, { cache: 'no-store' });
      const data = await res.json();

      if (data.success) {
        const tglIndo = tanggal.split('-').reverse().join('/');
        let teks = `*REKAP OPERASIONAL KEDAI KOPI BARA*\n📅 Tanggal: ${tglIndo}\n⏰ Shift Laporan: ${shift.toUpperCase()}\n\n`;

        // BAGIAN 1: OMSET (Ganti istilah "Kotor" menjadi "Gross Omset")
        if (shift === 'Pagi') {
          teks += `*💰 RINCIAN OMSET SHIFT PAGI*\n`;
          teks += `- Tunai Masuk: ${formatIDR(data.omsetPagi.tunai)}\n`;
          teks += `- QRIS: ${formatIDR(data.omsetPagi.qris)}\n`;
          teks += `- EDC/TF: ${formatIDR(data.omsetPagi.edc)}\n`;
          teks += `- Grab: ${formatIDR(data.omsetPagi.grab)}\n`;
          teks += `*Total Shift Pagi: ${formatIDR(data.omsetPagi.total)}*\n\n`;
        } else if (shift === 'Closing') {
          teks += `*💰 RINCIAN OMSET SHIFT MALAM*\n`;
          teks += `- Tunai Masuk: ${formatIDR(data.omsetMalam.tunai)}\n`;
          teks += `- QRIS: ${formatIDR(data.omsetMalam.qris)}\n`;
          teks += `- EDC/TF: ${formatIDR(data.omsetMalam.edc)}\n`;
          teks += `- Grab: ${formatIDR(data.omsetMalam.grab)}\n`;
          teks += `*Total Shift Malam: ${formatIDR(data.omsetMalam.total)}*\n\n`;

          teks += `*📊 KUMULASI GROSS OMSET (PAGI + MALAM)*\n`;
          teks += `- Tunai Masuk: ${formatIDR(data.omsetHarian.tunai)}\n`;
          teks += `- QRIS: ${formatIDR(data.omsetHarian.qris)}\n`;
          teks += `- EDC/TF: ${formatIDR(data.omsetHarian.edc)}\n`;
          teks += `- Grab: ${formatIDR(data.omsetHarian.grab)}\n`;
          teks += `*TOTAL GROSS OMSET HARIAN: ${formatIDR(data.omsetHarian.total)}*\n\n`;
        } else if (shift === 'Gabungan') {
          teks += `*📊 TOTAL GROSS OMSET FULL SEHARI*\n`;
          teks += `- Tunai Masuk: ${formatIDR(data.omsetHarian.tunai)}\n`;
          teks += `- QRIS: ${formatIDR(data.omsetHarian.qris)}\n`;
          teks += `- EDC/TF: ${formatIDR(data.omsetHarian.edc)}\n`;
          teks += `- Grab: ${formatIDR(data.omsetHarian.grab)}\n`;
          teks += `*TOTAL GROSS OMSET HARIAN: ${formatIDR(data.omsetHarian.total)}*\n\n`;
        }

        // BAGIAN 2: PENGELUARAN LACI
        teks += `*💸 PENGELUARAN LACI HARI INI*\n`;
        if (data.pengeluaran.length > 0) {
          data.pengeluaran.forEach((p: any, i: number) => {
            teks += `${i + 1}. ${p.keterangan} - ${formatIDR(p.nominal)}\n`;
          });
          teks += `*Total Pengeluaran: ${formatIDR(data.totalPengeluaran)}*\n\n`;
        } else {
          teks += `- Tidak ada pengeluaran.\n\n`;
        }

        // BAGIAN 3: RINCIAN KASBON KRU HARI INI
        teks += `*📌 PINJAMAN KASBON HARI INI*\n`;
        if (data.kasbonHariIni.length > 0) {
          data.kasbonHariIni.forEach((k: any, i: number) => {
            teks += `${i + 1}. ${k.nama} (${k.keterangan}) - ${formatIDR(k.nominal)}\n`;
          });
          teks += `*Total Kasbon Hari Ini: ${formatIDR(data.totalKasbonHariIni)}*\n\n`;
        } else {
          teks += `- Tidak ada penarikan kasbon hari ini.\n\n`;
        }

        // BAGIAN 4: ESTIMASI SALDO FISIK LACI KASIR NET
        teks += `*💵 ESTIMASI SALDO UANG FISIK LACI*\n`;
        teks += `👉 *Total Kas Laci Aktif: ${formatIDR(data.saldoLaciKasir)}*\n`;
        teks += `_(Harus cocok dengan uang fisik saat serah terima / hitung laci)_\n\n`;

        // BAGIAN 5: STOK GUDANG ALERT (Hanya menampilkan jumlah item)
        teks += `*🚨 ALERT STOK GUDANG*\n`;
        if (data.stockAlerts.length > 0) {
          teks += `- Sisa *${data.stockAlerts.length} item*\n`;
        } else {
          teks += `- Seluruh stok terpantau aman.\n`;
        }

        setPesanWA(teks);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal merakit laporan.");
    } finally {
      setLoading(false);
    }
  };

  const kirimKeWA = () => {
    if (!pesanWA) return alert("Silakan Generate Laporan terlebih dahulu!");
    const encodedText = encodeURIComponent(pesanWA);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  useEffect(() => {
    generateReport();
  }, [tanggal, shift]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      <div className="bg-emerald-600 border-b border-emerald-700 sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-emerald-500/50 text-white rounded-full hover:bg-emerald-500 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black text-white uppercase flex items-center gap-1.5 tracking-wide">
            <MessageCircle size={16} /> Laporan Shift WhatsApp
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-4">
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1 tracking-widest">Pilih Tanggal</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:bg-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1 tracking-widest">Pilih Shift</label>
              <select value={shift} onChange={(e) => setShift(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 outline-none cursor-pointer">
                <option value="Pagi">Shift Pagi</option>
                <option value="Closing">Shift Closing (Malam)</option>
                <option value="Gabungan">Full Day (Gabungan)</option>
              </select>
            </div>
          </div>
          
          <button onClick={generateReport} disabled={loading} className="w-full py-3 bg-zinc-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Merakit Data...' : 'RE-GENERATE LAPORAN'}
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-1.5">
            <FileText size={14} className="text-zinc-500" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Preview Laporan (Bisa Diedit)</span>
          </div>
          <textarea 
            value={pesanWA}
            onChange={(e) => setPesanWA(e.target.value)}
            className="w-full h-96 p-4 text-xs font-medium font-mono text-zinc-700 bg-transparent outline-none resize-none"
            placeholder="Laporan akan muncul di sini..."
          />
        </div>

        <button onClick={kirimKeWA} className="w-full py-4 bg-emerald-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all">
          <Send size={18} /> KIRIM LAPORAN KE WHATSAPP
        </button>
      </div>
    </div>
  );
}