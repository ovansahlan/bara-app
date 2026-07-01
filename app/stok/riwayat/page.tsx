'use client';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { 
  Package, History, ChevronLeft, Search, Filter, 
  ArrowDownLeft, ArrowUpRight, ClipboardCheck, 
  TrendingUp, BarChart3, Layers 
} from 'lucide-react';

// Kontrak data untuk struktur Aset Stok Bahan
interface StockAsset {
  id: string;
  nama: string;
  kategori: string;
  stokSistem: number;
  satuan: string;
  hargaBeliSatuan: number;
  stokMinimum: number;
}

// Kontrak data untuk Log Riwayat Masuk Keluar Barang
interface MutationLog {
  idLog: string;
  tanggal: string;
  waktu: string;
  itemId: string;
  namaItem: string;
  tipe: 'IN' | 'OUT' | 'OPNAME';
  qty: number;
  satuan: string;
  petugas: string;
  keterangan: string;
}

export default function RiwayatDanAsetStokSaaS() {
  const [activeTab, setActiveTab] = useState<'aset' | 'history'>('aset');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Master Data Aset Real-time (Sesuai dengan list master produk kamu sebelumnya)
  const dataAsetStok: StockAsset[] = [
    { id: "B001", nama: "Susu Evaporasi", kategori: "Bahan Baku Bar", stokSistem: 54, satuan: "Kaleng", hargaBeliSatuan: 15000, stokMinimum: 12 },
    { id: "B002", nama: "Susu UHT", kategori: "Bahan Baku Bar", stokSistem: 84, satuan: "Liter", hargaBeliSatuan: 18500, stokMinimum: 20 },
    { id: "B003", nama: "Susu SKM", kategori: "Bahan Baku Bar", stokSistem: 2, satuan: "Pouch", hargaBeliSatuan: 12000, stokMinimum: 10 },
    { id: "B004", nama: "Creamer", kategori: "Powder & Perasa", stokSistem: 1, satuan: "Kg", hargaBeliSatuan: 45000, stokMinimum: 5 },
  ];

  // Mock Jurnal Riwayat Mutasi Masuk/Keluar Barang dari database
  const dataRiwayatMutasi: MutationLog[] = [
    { idLog: "LOG-902", tanggal: "2026-06-30", waktu: "09:15", itemId: "B001", namaItem: "Susu Evaporasi", tipe: "IN", qty: 24, satuan: "Kaleng", petugas: "Ibnu", keterangan: "Restock Bulanan Supplier Salman" },
    { idLog: "LOG-901", tanggal: "2026-06-30", waktu: "11:30", itemId: "B002", namaItem: "Susu UHT", tipe: "OUT", qty: 6, satuan: "Liter", petugas: "Chika", keterangan: "Pengisian Kulkas Bar Shift Pagi" },
    { idLog: "LOG-900", tanggal: "2026-06-29", waktu: "22:00", itemId: "B003", namaItem: "Susu SKM", tipe: "OPNAME", qty: 2, satuan: "Pouch", petugas: "Ruslan", keterangan: "Opname Fisik Akhir Shift Toko - Sesuai" },
    { idLog: "LOG-899", tanggal: "2026-06-29", waktu: "15:00", itemId: "B004", namaItem: "Creamer", tipe: "OUT", qty: 2, satuan: "Kg", petugas: "Novi", keterangan: "Mutasi Oper ke Stok Gerobak Bajay" },
  ];

  // Handler input pencarian bebas dari error 'implicit any'
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handler selektor filter mutasi bebas dari error 'implicit any'
  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

  // 1. Logika Filter Pencarian untuk Tab Aset Bahan
  const filteredAset = dataAsetStok.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Logika Filter Pencarian & Tipe Jurnal untuk Tab Riwayat
  const filteredHistory = dataRiwayatMutasi.filter(log => {
    const matchSearch = log.namaItem.toLowerCase().includes(searchTerm.toLowerCase()) || log.idLog.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'ALL' ? true : log.tipe === filterType;
    return matchSearch && matchType;
  });

  // Kalkulasi total valuasi kapital stok gudang saat ini (Stok Sistem x Harga Beli)
  const totalValuasiAsetGudang = dataAsetStok.reduce((sum, item) => sum + (item.stokSistem * item.hargaBeliSatuan), 0);
  const totalJumlahItem = dataAsetStok.reduce((sum, item) => sum + item.stokSistem, 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24 font-sans font-medium">
      
      {/* SaaS Navigation Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/stok" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold tracking-wide uppercase text-zinc-800 flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-600" /> Ledger & Analisis Stok
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-5">
        
        {/* RINGKASAN VALUASI KAPITAL GUDANG */}
        <div className="bg-zinc-900 text-white p-5 rounded-2xl shadow-sm border border-zinc-800 grid grid-cols-2 gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Layers size={60} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Nilai Aset Bahan</span>
            <h2 className="text-xl font-black text-emerald-400 mt-1">Rp {totalValuasiAsetGudang.toLocaleString('id-ID')}</h2>
          </div>
          <div className="border-l border-zinc-800 pl-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Volume Fisik</span>
            <h2 className="text-xl font-black text-white mt-1">{totalJumlahItem} Unit</h2>
          </div>
        </div>

        {/* TAB SWITCHER (DOUBLE CAPSULE STYLE) */}
        <div className="bg-zinc-200/60 p-1 rounded-xl grid grid-cols-2 gap-1 border border-zinc-200">
          <button 
            onClick={() => { setActiveTab('aset'); setSearchTerm(''); }}
            className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'aset' ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Package size={14} /> Aset Stok Aktif
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setSearchTerm(''); }}
            className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <History size={14} /> Jurnal Mutasi
          </button>
        </div>

        {/* UTILITY SEARCH AND FILTER BAR */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-3.5 text-zinc-400" />
            <input 
              type="text" 
              placeholder={activeTab === 'aset' ? "Cari nama bahan baku..." : "Cari nama item / ID log..."}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 p-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xs"
            />
          </div>

          {activeTab === 'history' && (
            <div className="relative">
              <Filter size={14} className="absolute left-2.5 top-3.5 text-zinc-500 pointer-events-none" />
              <select 
                value={filterType}
                onChange={handleFilterChange}
                className="pl-8 pr-3 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer shadow-2xs text-zinc-700"
              >
                <option value="ALL">Semua</option>
                <option value="IN">Masuk</option>
                <option value="OUT">Keluar</option>
                <option value="OPNAME">Opname</option>
              </select>
            </div>
          )}
        </div>

        {/* VIEW TAB 1: DAFTAR ASET STOK AKTIF */}
        {activeTab === 'aset' && (
          <div className="space-y-3">
            {filteredAset.length === 0 ? (
              <p className="text-center text-xs text-zinc-400 py-6">Barang logistik tidak ditemukan.</p>
            ) : (
              filteredAset.map((item) => {
                const isMenipis = item.stokSistem <= item.stokMinimum;
                return (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs flex justify-between items-center relative overflow-hidden">
                    {isMenipis && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded border border-zinc-200">
                          {item.id}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-800">{item.nama}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1.5 font-medium">
                        Asset Val: <span className="text-zinc-600 font-bold">Rp {(item.stokSistem * item.hargaBeliSatuan).toLocaleString('id-ID')}</span>
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className={`text-sm font-black block ${isMenipis ? 'text-rose-600' : 'text-zinc-900'}`}>
                        {item.stokSistem} {item.satuan}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-block mt-1 ${
                        isMenipis ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {isMenipis ? 'Stok Kritis' : `Min: ${item.stokMinimum}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* VIEW TAB 2: JURNAL LOG TIMELINE RIWAYAT BARANG */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <p className="text-center text-xs text-zinc-400 py-6">Belum ada rekaman mutasi untuk kategori ini.</p>
            ) : (
              filteredHistory.map((log) => (
                <div key={log.idLog} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-3">
                  
                  {/* Row Atas: Status Badge & ID */}
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded-md ${
                        log.tipe === 'IN' ? 'bg-emerald-50 text-emerald-600' : log.tipe === 'OUT' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {log.tipe === 'IN' ? <ArrowDownLeft size={14} /> : log.tipe === 'OUT' ? <ArrowUpRight size={14} /> : <ClipboardCheck size={14} />}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        log.tipe === 'IN' ? 'text-emerald-600' : log.tipe === 'OUT' ? 'text-rose-600' : 'text-blue-600'
                      }`}>
                        {log.tipe === 'IN' ? 'Barang Masuk' : log.tipe === 'OUT' ? 'Barang Keluar' : 'Audit Opname'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold">{log.idLog}</span>
                  </div>

                  {/* Row Tengah: Rincian Kuantitas Barang */}
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <h4 className="font-bold text-zinc-800">{log.namaItem}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                        Oleh: <span className="text-zinc-600 font-bold">{log.petugas}</span> • {log.tanggal.split('-')[2]}/{log.tanggal.split('-')[1]} • {log.waktu}
                      </p>
                    </div>
                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                      log.tipe === 'IN' ? 'bg-emerald-950 text-emerald-400 font-extrabold' : log.tipe === 'OUT' ? 'bg-rose-950 text-rose-400 font-extrabold' : 'bg-blue-950 text-blue-400 font-extrabold'
                    }`}>
                      {log.tipe === 'IN' ? '+' : log.tipe === 'OUT' ? '-' : '±'} {log.qty} {log.satuan}
                    </span>
                  </div>

                  {/* Row Bawah: Keterangan / Alasan Logistik */}
                  <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/60 text-[10px] text-zinc-500 leading-relaxed font-medium">
                    <span className="font-bold text-zinc-400 block mb-0.5">Keterangan:</span>
                    {log.keterangan}
                  </div>

                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}