'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, FileDown, ShieldCheck, DownloadCloud } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function SlipGajiKru() {
  const router = useRouter();
  const [profilKru, setProfilKru] = useState<any>(null);
  const [slipData, setSlipData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const slipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sesi = localStorage.getItem('kru_session');
    if (!sesi) {
      router.push('/kru/login');
    } else {
      const dataSesi = JSON.parse(sesi);
      setProfilKru(dataSesi);
      fetchSlipData(dataSesi.nama, dataSesi.cabang);
    }
  }, []);

  const fetchSlipData = async (nama: string, cabang: string) => {
    try {
      const res = await fetch(`/api/kru/slip?nama=${nama}&cabang=${cabang}`);
      const data = await res.json();
      if (data.success) setSlipData(data.data);
    } catch (e) {
      console.error("Gagal menarik data slip", e);
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (val: number) => `Rp ${new Intl.NumberFormat('id-ID').format(val || 0)}`;

  // Fungsi mengubah tampilan HTML menjadi File PDF
  const handleDownloadPDF = async () => {
    const element = slipRef.current;
    if (!element) return;

    // Sembunyikan tombol saat dirender agar tidak ikut ke-print
    const btn = document.getElementById('btn-download');
    if (btn) btn.style.display = 'none';

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Slip_Gaji_${profilKru.nama}_${slipData.periode}.pdf`);
    } catch (error) {
      alert("Gagal men-download PDF.");
    } finally {
      if (btn) btn.style.display = 'flex'; // Munculkan lagi
    }
  };

  if (!profilKru) return null;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-900 font-sans p-4 flex flex-col items-center pt-8">
      
      {/* HEADER NAVIGASI */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link href="/kru/dashboard" className="p-2.5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-1.5">
          <FileDown size={16} className="text-indigo-400" /> Slip Gaji Digital
        </h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* KERTAS SLIP GAJI (Target Render PDF) */}
      <div className="w-full max-w-md bg-white p-6 rounded-t-xl shadow-2xl relative" ref={slipRef}>
        
        {/* KOP SURAT */}
        <div className="text-center border-b-2 border-zinc-900 pb-5 mb-5 space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900">KEDAI KOPI BARA</h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dokumen Rahasia & Pribadi</p>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs font-bold text-zinc-400 animate-pulse">Menyiapkan Dokumen...</div>
        ) : slipData ? (
          <div className="space-y-6">
            
            {/* INFO KARYAWAN */}
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs font-medium space-y-2">
              <div className="flex justify-between"><span className="text-zinc-500">Nama Lengkap</span><span className="font-black text-zinc-900 uppercase">{slipData.nama}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Cabang Penempatan</span><span className="font-black text-zinc-900 uppercase">{slipData.cabang}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Periode Gaji</span><span className="font-bold text-indigo-600">{slipData.periode}</span></div>
            </div>

            {/* RINCIAN PENDAPATAN */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 border-b border-emerald-100 pb-1">Penerimaan (Pendapatan)</h3>
              <div className="space-y-2 text-xs font-medium">
                <div className="flex justify-between"><span>Gaji Pokok Bulanan</span><span>{formatIDR(slipData.gajiPokok)}</span></div>
                <div className="flex justify-between"><span>Bonus Target Omset</span><span>{formatIDR(slipData.bonusOmset)}</span></div>
                <div className="flex justify-between"><span>Tunjangan Objektif Owner</span><span>{formatIDR(slipData.tunjanganObjektif)}</span></div>
              </div>
              <div className="flex justify-between text-xs font-black text-emerald-700 mt-2 pt-2 border-t border-dashed border-zinc-300">
                <span>TOTAL PENDAPATAN KOTOR</span><span>{formatIDR(slipData.totalPendapatan)}</span>
              </div>
            </div>

            {/* RINCIAN POTONGAN */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-2 border-b border-rose-100 pb-1">Pemotongan</h3>
              <div className="space-y-2 text-xs font-medium">
                <div className="flex justify-between"><span>Cicilan / Kasbon Berjalan</span><span className="text-rose-600">-{formatIDR(slipData.cicilan)}</span></div>
              </div>
            </div>

            {/* TAKE HOME PAY */}
            <div className="bg-zinc-900 text-white p-5 rounded-xl text-center space-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10"><ShieldCheck size={60} /></div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest relative z-10">Take Home Pay (Bersih)</p>
              <p className="text-2xl font-black text-emerald-400 relative z-10">{formatIDR(slipData.takeHomePay)}</p>
            </div>
            
            <p className="text-[9px] text-center text-zinc-400 font-medium italic pt-4">
              Slip gaji ini dihasilkan secara otomatis oleh sistem HRIS Kopi Bara dan sah tanpa tanda tangan.
            </p>
          </div>
        ) : (
          <div className="text-center text-xs text-rose-500 py-10">Data tidak ditemukan.</div>
        )}
      </div>

      {/* TOMBOL DOWNLOAD (Nempel di bawah kertas) */}
      <div className="w-full max-w-md mt-2">
        <button 
          id="btn-download"
          onClick={handleDownloadPDF} 
          disabled={loading || !slipData}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-b-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-colors"
        >
          <DownloadCloud size={16} strokeWidth={2.5} /> UNDUH SEBAGAI PDF
        </button>
      </div>

    </div>
  );
}