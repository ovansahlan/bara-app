'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, DownloadCloud, ShieldCheck, MessageSquare, Users } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function HRDSlipCenter() {
  const [daftarKru, setDaftarKru] = useState<any[]>([]);
  const [loadingKru, setLoadingKru] = useState<boolean>(true);
  const [kruTerpilih, setKruTerpilih] = useState<string>('');
  
  const [slipData, setSlipData] = useState<any>(null);
  const [loadingSlip, setLoadingSlip] = useState<boolean>(false);
  const slipRef = useRef<HTMLDivElement>(null);

  // 1. Ambil semua daftar kru untuk dropdown HRD
  useEffect(() => {
    const fetchSemuaKru = async () => {
      try {
        const res = await fetch('/api/kru', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) setDaftarKru(data.kru);
      } catch (e) {
        console.error("Gagal memuat data kru", e);
      } finally {
        setLoadingKru(false);
      }
    };
    fetchSemuaKru();
  }, []);

  // 2. Ambil data Gaji, Kasbon, dan Cicilan Tetap secara bersamaan (Triple Fetch)
  const handlePilihKru = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nama = e.target.value;
    setKruTerpilih(nama);
    if (!nama) {
      setSlipData(null);
      return;
    }

    const kruObj = daftarKru.find(k => k.nama === nama);
    if (!kruObj) return;

    setLoadingSlip(true);
    try {
      const [resSlip, resKasbon, resCicilan] = await Promise.all([
        fetch(`/api/kru/slip?nama=${kruObj.nama}&cabang=${kruObj.cabang}`, { cache: 'no-store' }),
        fetch(`/api/kru/kasbon?nama=${kruObj.nama}&t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/kru/cicilan?nama=${kruObj.nama}&t=${Date.now()}`, { cache: 'no-store' })
      ]);

      const dataSlip = await resSlip.json();
      const dataKasbon = await resKasbon.json();
      const dataCicilan = await resCicilan.json();

      if (dataSlip.success) {
        let finalSlip = { ...dataSlip.data };
        let listPotonganKustom: any[] = [];
        let totalSemuaPotongan = 0;

        // A. Ambil Data Kasbon Berjalan (Jika ada tunggakan)
        if (dataKasbon.success && dataKasbon.data.totalKasbon > 0) {
          listPotonganKustom.push({
            label: 'Kasbon Berjalan (Bulan Ini)',
            nominal: dataKasbon.data.totalKasbon
          });
          totalSemuaPotongan += dataKasbon.data.totalKasbon;
        }

        // B. Ambil Data Cicilan-Cicilan Tetap yang Aktif
        if (dataCicilan.success && dataCicilan.data.list.length > 0) {
          dataCicilan.data.list.forEach((item: any) => {
            listPotonganKustom.push({
              label: `${item.deskripsi} (${item.tenor})`,
              nominal: item.nominal
            });
            totalSemuaPotongan += item.nominal;
          });
        }

        // Masukkan array potongan kustom ke dalam objek slip data
        finalSlip.arrayPotongan = listPotonganKustom;
        finalSlip.totalPotonganPasti = totalSemuaPotongan;
        
        // RE-KALKULASI TAKE HOME PAY: Pendapatan Kotor dikurangi Total Semua Potongan Asli
        finalSlip.takeHomePay = finalSlip.totalPendapatan - totalSemuaPotongan;

        setSlipData(finalSlip);
      }
    } catch (err) {
      console.error("Gagal melakukan sinkronisasi data slip terpadu", err);
    } finally {
      setLoadingSlip(false);
    }
  };

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
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 font-sans p-4 flex flex-col items-center pt-8">
      
      {/* HEADER NAVIGASI */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link href="/owner" className="p-2.5 bg-slate-800 text-slate-400 rounded-full hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
          <Users size={16} className="text-indigo-400" /> HRD Slip Portal
        </h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* Dropdown Pemilih Karyawan */}
      <div className="w-full max-w-md bg-slate-800 p-4 rounded-2xl border border-slate-700/60 shadow-xl mb-5">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Slip Gaji Karyawan</label>
        <select 
          value={kruTerpilih} 
          onChange={handlePilihKru}
          className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-indigo-500 transition-all cursor-pointer"
        >
          <option value="">{loadingKru ? 'Memuat data tim...' : '-- Pilih Anggota Tim --'}</option>
          {daftarKru.map(k => (
            <option key={k.id} value={k.nama}>{k.nama.toUpperCase()} ({k.cabang})</option>
          ))}
        </select>
      </div>

      {/* Lembar Slip Gaji */}
      <div className="w-full max-w-md bg-white text-zinc-900 p-6 rounded-t-xl shadow-2xl relative min-h-[100px]">
        {loadingSlip ? (
          <div className="h-48 flex items-center justify-center text-xs font-bold text-zinc-400 animate-pulse">Menghitung akumulasi pemotongan...</div>
        ) : slipData ? (
          <div ref={slipRef} className="bg-white p-2">
            
            <div className="text-center border-b-2 border-zinc-900 pb-4 mb-5 flex flex-col items-center justify-center">
              <div className="w-full h-24 relative flex items-center justify-center mb-2">
                <img src="/logo.png" alt="Logo Kopi Bara" crossOrigin="anonymous" className="max-w-[240px] max-h-full object-contain" />
              </div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Dokumen Rahasia &amp; Pribadi (Salinan HRD)</p>
            </div>

            <div className="space-y-6">
              {/* INFO KARYAWAN */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs font-medium space-y-2">
                <div className="flex justify-between"><span className="text-zinc-500">Nama Lengkap</span><span className="font-black text-zinc-900 uppercase">{slipData.nama}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Cabang Penempatan</span><span className="font-black text-zinc-900 uppercase">{slipData.cabang}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Periode Gaji</span><span className="font-bold text-indigo-600">{slipData.periode}</span></div>
              </div>

              {/* RECEIPT PENDAPATAN */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 border-b border-emerald-100 pb-1">Penerimaan (Pendapatan)</h3>
                <div className="space-y-2 text-xs font-medium">
                  <div className="flex justify-between"><span>Gaji Pokok Bulanan</span><span>{formatIDR(slipData.gajiPokok)}</span></div>
                  <div className="flex justify-between"><span>Bonus Target Omset</span><span>{formatIDR(slipData.bonusOmset)}</span></div>
                  <div className="flex justify-between"><span>Tunjangan Kinerja / Insentif</span><span>{formatIDR(slipData.tunjanganObjektif)}</span></div>
                  <div className="flex justify-between"><span>Upah Lembur (Overtime)</span><span className="text-amber-600 font-bold">+{formatIDR(slipData.uangOvertime)}</span></div>
                </div>
                <div className="flex justify-between text-xs font-black text-emerald-700 mt-2 pt-2 border-t border-dashed border-zinc-300">
                  <span>TOTAL PENDAPATAN KOTOR</span><span>{formatIDR(slipData.totalPendapatan)}</span>
                </div>
              </div>

              {/* RECEIPT POTONGAN MULTI-ITEM (KASBON + CICILAN TETAP) */}
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

              {/* KOTAK EVALUASI */}
              {slipData.catatanOwner && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-1 relative overflow-hidden">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[10px] uppercase tracking-wider">
                    <MessageSquare size={12} />
                    <span>Catatan &amp; Evaluasi Owner</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-medium italic">&ldquo;{slipData.catatanOwner}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-zinc-400 py-12 font-medium">Silakan pilih nama karyawan di atas untuk memunculkan pratinjau lembar slip gaji.</div>
        )}
      </div>

      {/* TOMBOL DOWNLOAD */}
      {slipData && !loadingSlip && (
        <div className="w-full max-w-md mt-2">
          <button 
            id="btn-download-hrd"
            onClick={handleDownloadPDF} 
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-b-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <DownloadCloud size={16} strokeWidth={2.5} /> DOWNLOAD SLIP GAJI KRU
          </button>
        </div>
      )}

    </div>
  );
}