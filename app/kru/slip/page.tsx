'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, FileDown, ShieldCheck, DownloadCloud, MessageSquare } from 'lucide-react';
import { toPng } from 'html-to-image';
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
      return;
    }

    const dataSesi = JSON.parse(sesi);
    setProfilKru(dataSesi);

    const fetchSlipData = async (nama: string, cabang: string) => {
      try {
        // TWEAK: Triple Fetch! Tarik data Gaji, Kasbon, dan Cicilan sekaligus
        const [resSlip, resKasbon, resCicilan] = await Promise.all([
          fetch(`/api/kru/slip?nama=${nama}&cabang=${cabang}`, { cache: 'no-store' }),
          fetch(`/api/kru/kasbon?nama=${nama}&t=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/kru/cicilan?nama=${nama}&t=${Date.now()}`, { cache: 'no-store' })
        ]);

        const dataSlip = await resSlip.json();
        const dataKasbon = await resKasbon.json();
        const dataCicilan = await resCicilan.json();

        if (dataSlip.success) {
          let finalSlip = { ...dataSlip.data };
          let listPotonganKustom: any[] = [];
          let totalSemuaPotongan = 0;

          // A. Masukkan Data Kasbon Berjalan
          if (dataKasbon.success && dataKasbon.data.totalKasbon > 0) {
            listPotonganKustom.push({
              label: 'Kasbon Berjalan (Bulan Ini)',
              nominal: dataKasbon.data.totalKasbon
            });
            totalSemuaPotongan += dataKasbon.data.totalKasbon;
          }

          // B. Masukkan Data Cicilan Tetap Aktif
          if (dataCicilan.success && dataCicilan.data.list.length > 0) {
            dataCicilan.data.list.forEach((item: any) => {
              listPotonganKustom.push({
                label: `${item.deskripsi} (${item.tenor})`,
                nominal: item.nominal
              });
              totalSemuaPotongan += item.nominal;
            });
          }

          // Simpan rincian potongan ke dalam objek Slip
          finalSlip.arrayPotongan = listPotonganKustom;
          finalSlip.totalPotonganPasti = totalSemuaPotongan;
          
          // Re-kalkulasi Gaji Bersih (Take Home Pay)
          finalSlip.takeHomePay = finalSlip.totalPendapatan - totalSemuaPotongan;

          setSlipData(finalSlip);
        }
      } catch (e) {
        console.error("Gagal menarik data slip terpadu", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSlipData(dataSesi.nama, dataSesi.cabang);
  }, [router]);

  const formatIDR = (val: number) => `Rp ${new Intl.NumberFormat('id-ID').format(val || 0)}`;

  const handleDownloadPDF = async () => {
    const element = slipRef.current;
    if (!element) return;

    // Sembunyikan tombol saat difoto (Ganti ID jadi 'btn-download-hrd' khusus di file Owner!)
    const btn = document.getElementById('btn-download'); 
    if (btn) btn.style.display = 'none';

    // Kunci ukuran tampilan agar tidak ambruk saat direkam
    const originalStyle = element.getAttribute('style');
    element.style.width = '500px';
    element.style.margin = '0 auto';

    try {
      // SENJATA BARU: html-to-image (Membaca Tailwind & SVG dengan sempurna)
      const imgData = await toPng(element, { 
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2 // Resolusi HD
      });
      
      // Ukuran asli elemen HTML
      const elWidth = element.offsetWidth;
      const elHeight = element.offsetHeight;
      
      // Rasio ukuran kertas PDF (Lebar 100mm)
      const pdfWidth = 100; 
      const pdfHeight = (elHeight * pdfWidth) / elWidth; 

      const pdf = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'mm', 
        format: [pdfWidth, pdfHeight] 
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Slip_Gaji_${slipData.nama}_${slipData.periode}.pdf`);
      
    } catch (error) {
      console.error(error);
      alert("Gagal men-download PDF.");
    } finally {
      // Munculkan tombolnya lagi & kembalikan style seperti semula
      if (btn) btn.style.display = 'flex';
      if (originalStyle) {
        element.setAttribute('style', originalStyle);
      } else {
        element.removeAttribute('style');
      }
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
        
        <div className="text-center border-b-2 border-zinc-900 pb-4 mb-5 flex flex-col items-center justify-center">
          <div className="w-full h-24 relative flex items-center justify-center mb-2">
            <img 
              src="/logo.png" 
              alt="Logo Kopi Bara" 
              crossOrigin="anonymous"
              className="max-w-[240px] max-h-full object-contain"
            />
          </div>
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Dokumen Rahasia &amp; Pribadi</p>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs font-bold text-zinc-400 animate-pulse">Menghitung kalkulasi pemotongan...</div>
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
                <div className="flex justify-between"><span>Gaji Pokok Bulanan</span><span>{formatIDR(slipData.gajiPokop || slipData.gajiPokok)}</span></div>
                <div className="flex justify-between"><span>Bonus Target Omset</span><span>{formatIDR(slipData.bonusOmset)}</span></div>
                <div className="flex justify-between"><span>Tunjangan Kinerja / Insentif</span><span>{formatIDR(slipData.tunjanganObjektif)}</span></div>
                <div className="flex justify-between"><span>Upah Lembur (Overtime)</span><span className="text-amber-600 font-bold">+{formatIDR(slipData.uangOvertime)}</span></div>
              </div>
              <div className="flex justify-between text-xs font-black text-emerald-700 mt-2 pt-2 border-t border-dashed border-zinc-300">
                <span>TOTAL PENDAPATAN KOTOR</span><span>{formatIDR(slipData.totalPendapatan)}</span>
              </div>
            </div>

            {/* RINCIAN POTONGAN (DINAMIS) */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-2 border-b border-rose-100 pb-1">Pemotongan</h3>
              <div className="space-y-2 text-xs font-medium">
                {slipData.arrayPotongan && slipData.arrayPotongan.length > 0 ? (
                  slipData.arrayPotongan.map((potong: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span className="capitalize">{potong.label}</span>
                      <span className="text-rose-600 font-bold">-{formatIDR(potong.nominal)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-zinc-400 italic text-[11px]">
                    <span>Tidak Ada Potongan Bulan Ini</span><span>Rp 0</span>
                  </div>
                )}
              </div>
              {slipData.totalPotonganPasti > 0 && (
                <div className="flex justify-between text-xs font-bold text-rose-700 mt-2 pt-2 border-t border-dashed border-zinc-200">
                  <span>TOTAL POTONGAN GAJI</span><span>-{formatIDR(slipData.totalPotonganPasti)}</span>
                </div>
              )}
            </div>

            {/* TAKE HOME PAY */}
            <div className="bg-zinc-900 text-white p-5 rounded-xl text-center space-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10"><ShieldCheck size={60} /></div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest relative z-10">Take Home Pay (Bersih)</p>
              <p className="text-2xl font-black text-emerald-400 relative z-10">{formatIDR(slipData.takeHomePay)}</p>
            </div>

            {/* KOTAK EVALUASI / CATATAN OWNER */}
            {slipData.catatanOwner && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-1 relative overflow-hidden">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[10px] uppercase tracking-wider">
                  <MessageSquare size={12} />
                  <span>Catatan &amp; Evaluasi Owner</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium italic">
                  &ldquo;{slipData.catatanOwner}&rdquo;
                </p>
              </div>
            )}
            
            <p className="text-[9px] text-center text-zinc-400 font-medium italic pt-2">
              Slip gaji ini dihasilkan secara otomatis oleh sistem HRIS Kopi Bara dan sah tanpa tanda tangan.
            </p>
          </div>
        ) : (
          <div className="text-center text-xs text-rose-500 py-10">Data tidak ditemukan.</div>
        )}
      </div>

      {/* TOMBOL DOWNLOAD */}
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