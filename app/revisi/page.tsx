'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Trash2, History, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RevisiData() {
  const [data, setData] = useState<any>({ penjualan: [], pengeluaran: [], kasbon: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  const tanggalHariIni = new Date().toISOString().split('T')[0];
  const formatIDR = (val: string | number) => `Rp ${new Intl.NumberFormat('id-ID').format(Number(val) || 0)}`;

  const loadDataRevisi = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/revisi?tanggal=${tanggalHariIni}`, { cache: 'no-store' });
      const result = await res.json();
      if (result.success) setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataRevisi();
  }, []);

  const handleVoidData = async (kategori: string, rowNumber: number) => {
    const konfirmasi = confirm(`Yakin ingin membatalkan/menghapus data ${kategori} ini? (Anda harus input ulang datanya nanti)`);
    if (!konfirmasi) return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/revisi', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kategori, rowNumber })
      });
      if (res.ok) {
        alert('✅ Data berhasil dihapus! Silakan input ulang data yang benar.');
        loadDataRevisi(); // Refresh data setelah dihapus
      }
    } catch (e) {
      alert('❌ Gagal menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-black text-zinc-800 uppercase flex items-center gap-1.5">
            <History size={16} className="text-rose-500" /> Log & Revisi
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-5">
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
            Halaman ini menampilkan riwayat input hari ini. Jika ada <b>typo/kesalahan</b>, klik tombol Hapus pada data yang salah, lalu lakukan input ulang dari halaman awal.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-xs font-bold text-zinc-400 py-10 animate-pulse">Memuat log transaksi hari ini...</p>
        ) : (
          <>
            {/* TABEL PENJUALAN */}
            <div className="space-y-2">
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Penjualan (Omset)</h2>
              {data.penjualan.length === 0 && <p className="text-[10px] text-zinc-400 italic pl-1">Belum ada input omset hari ini.</p>}
              {data.penjualan.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm flex justify-between items-center group">
                  <div>
                    <span className="text-xs font-bold text-zinc-800 block">{item.rowData[2]}</span>
                    <span className="text-[10px] font-semibold text-emerald-600">Total: {formatIDR(item.rowData[7]?.replace(/\D/g, ''))}</span>
                  </div>
                  <button onClick={() => handleVoidData('Penjualan', item.rowNumber)} disabled={isDeleting} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* TABEL PENGELUARAN */}
            <div className="space-y-2 pt-2">
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Pengeluaran Laci</h2>
              {data.pengeluaran.length === 0 && <p className="text-[10px] text-zinc-400 italic pl-1">Belum ada input pengeluaran hari ini.</p>}
              {data.pengeluaran.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-zinc-800 block">{item.rowData[3] || item.rowData[2]}</span>
                    <span className="text-[10px] font-semibold text-rose-600">Nominal: {formatIDR(item.rowData[7]?.replace(/\D/g, ''))}</span>
                  </div>
                  <button onClick={() => handleVoidData('Pengeluaran', item.rowNumber)} disabled={isDeleting} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* TABEL KASBON */}
            <div className="space-y-2 pt-2">
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Kasbon Kru</h2>
              {data.kasbon.length === 0 && <p className="text-[10px] text-zinc-400 italic pl-1">Belum ada input kasbon hari ini.</p>}
              {data.kasbon.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-zinc-800 block">{item.rowData[1]} ({item.rowData[3]})</span>
                    <span className="text-[10px] font-semibold text-amber-600">Nominal: {formatIDR(item.rowData[2]?.replace(/\D/g, ''))}</span>
                  </div>
                  <button onClick={() => handleVoidData('Kasbon', item.rowNumber)} disabled={isDeleting} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}