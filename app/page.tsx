'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Komponen navigasi Next.js

export default function DashboardBara() {
  const [waktu, setWaktu] = useState('');

  // Menampilkan Jam Real-time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setWaktu(
        now.toLocaleString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulasi Data...
  const dataKeuangan = {
    uangLaci: 850000,
    omsetTotal: 2450000,
    pettyCash: 125000,
    kasbonBulanIni: 450000,
  };
  const stokMenipis = [
    { id: 'B003', nama: 'Susu SKM', sisa: 2, satuan: 'Pouch', batas: 5 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {' '}
      {/* pb-24 agar tidak tertutup bottom nav */}
      {/* HEADER DASHBOARD */}
      <div className="bg-slate-900 text-white p-6 rounded-b-[2rem] shadow-lg sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-wider text-amber-400">
              KEDAI KOPI BARA
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Dashboard & Ringkasan Operasional
            </p>
          </div>
          <div className="bg-slate-800 p-2 rounded-xl text-center border border-slate-700">
            <span className="text-2xl block">🧑‍💻</span>
          </div>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
          <p className="text-sm font-semibold text-slate-200 text-center">
            🕒 {waktu || 'Memuat waktu...'}
          </p>
        </div>
      </div>
      <div className="p-4 space-y-6 max-w-md mx-auto mt-2">
        {/* SECTION: MENU CEPAT (QUICK ACTIONS) */}
        <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            🚀 Menu Utama
          </h2>
          <div className="grid grid-cols-4 gap-3">
            <Link
              href="/absen"
              className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 active:scale-95 transition-all"
            >
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full text-xl">
                📸
              </div>
              <span className="text-[10px] font-bold text-slate-700">
                Absen
              </span>
            </Link>

            <Link
              href="/penjualan"
              className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 active:scale-95 transition-all"
            >
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full text-xl">
                💰
              </div>
              <span className="text-[10px] font-bold text-slate-700">
                Omset
              </span>
            </Link>

            <Link
              href="/pengeluaran"
              className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 active:scale-95 transition-all"
            >
              <div className="bg-rose-100 text-rose-600 p-3 rounded-full text-xl">
                💸
              </div>
              <span className="text-[10px] font-bold text-slate-700">
                Belanja
              </span>
            </Link>

            <Link
              href="/stok"
              className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 active:scale-95 transition-all"
            >
              <div className="bg-purple-100 text-purple-600 p-3 rounded-full text-xl">
                📦
              </div>
              <span className="text-[10px] font-bold text-slate-700">Stok</span>
            </Link>
          </div>
        </section>

        {/* SECTION: KEUANGAN KASIR */}
        <section>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-md relative overflow-hidden">
              <p className="text-xs font-bold text-emerald-100 mb-1">
                Uang Tunai di Laci
              </p>
              <h3 className="text-xl font-black">
                Rp {dataKeuangan.uangLaci.toLocaleString('id-ID')}
              </h3>
            </div>
            <div className="bg-rose-500 p-4 rounded-2xl text-white shadow-md relative overflow-hidden">
              <p className="text-xs font-bold text-rose-100 mb-1">
                Total Petty Cash
              </p>
              <h3 className="text-xl font-black">
                Rp {dataKeuangan.pettyCash.toLocaleString('id-ID')}
              </h3>
            </div>
          </div>
        </section>

        {/* SECTION: MENU KARYAWAN & OWNER (LIST) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <Link
            href="/kasbon"
            className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 active:bg-slate-100"
          >
            <div className="flex items-center gap-3">
              <span className="bg-orange-100 text-orange-600 p-2 rounded-lg text-lg">
                💳
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Pengajuan Kasbon
                </p>
                <p className="text-[10px] text-slate-500">
                  Ajukan pinjaman / potong gaji bulan ini
                </p>
              </div>
            </div>
            <span className="text-slate-400">➡️</span>
          </Link>

          <Link
            href="/owner/belanja"
            className="flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100"
          >
            <div className="flex items-center gap-3">
              <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg text-lg">
                🔒
              </span>
              <div>
                <p className="text-sm font-bold text-indigo-900">
                  Belanja Khusus Owner
                </p>
                <p className="text-[10px] text-slate-500">
                  Input investasi & operasional besar
                </p>
              </div>
            </div>
            <span className="text-slate-400">➡️</span>
          </Link>
        </section>

        {/* SECTION: ALERT STOK */}
        <section>
          <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm p-3">
            <p className="text-xs font-bold text-red-600 mb-2">
              ⚠️ Peringatan Stok Menipis
            </p>
            {stokMenipis.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-sm bg-white p-2 rounded-lg mb-1"
              >
                <span className="font-bold">{item.nama}</span>
                <span className="text-red-600 font-bold">
                  {item.sisa} {item.satuan}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
      {/* ========================================== */}
      {/* BOTTOM NAVIGATION BAR (Selalu Lengket di Bawah) */}
      {/* ========================================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-md mx-auto flex justify-around items-center p-2">
          <Link
            href="/"
            className="flex flex-col items-center p-2 text-amber-600"
          >
            <span className="text-xl mb-1">🏠</span>
            <span className="text-[9px] font-bold">Home</span>
          </Link>

          <Link
            href="/penjualan"
            className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <span className="text-xl mb-1">🧾</span>
            <span className="text-[9px] font-bold">Kasir</span>
          </Link>

          {/* Tombol Tengah (Bisa dipakai untuk Absen Harian agar cepat) */}
          <Link
            href="/absen"
            className="relative -top-5 flex flex-col items-center"
          >
            <div className="bg-amber-500 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg border-4 border-slate-100 active:scale-95 transition-transform">
              <span className="text-2xl">📸</span>
            </div>
            <span className="text-[10px] font-bold text-amber-600 mt-1">
              Absen
            </span>
          </Link>

          <Link
            href="/stok"
            className="flex flex-col items-center p-2 text-slate-400 hover:text-purple-600 transition-colors"
          >
            <span className="text-xl mb-1">📦</span>
            <span className="text-[9px] font-bold">Stok</span>
          </Link>

          <Link
            href="/pengeluaran"
            className="flex flex-col items-center p-2 text-slate-400 hover:text-rose-600 transition-colors"
          >
            <span className="text-xl mb-1">💸</span>
            <span className="text-[9px] font-bold">Belanja</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
