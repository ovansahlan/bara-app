'use client';

import React, { useState, useEffect } from 'react';

export default function ManajemenStokBara() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'in', 'out', 'opname'
  const [searchQuery, setSearchQuery] = useState('');

  // Data Master Produk (Sesuai dengan Master Product.csv & CurrentStock.csv Anda)
  const [listProduk, setListProduk] = useState([
    { id: 'B001', nama: 'Susu Evaporasi', satuan: 'Kaleng', stokSistem: 54 },
    { id: 'B002', nama: 'Susu UHT', satuan: 'Liter', stokSistem: 84 },
    { id: 'B003', nama: 'Susu SKM', satuan: 'Pouch', stokSistem: 6 },
    { id: 'B004', nama: 'Creamer', satuan: 'Kg', stokSistem: 4 },
    { id: 'B005', nama: 'Vanilla Powder', satuan: 'Kg', stokSistem: 7 },
    { id: 'B009', nama: 'Butterscotch Syrup', satuan: 'Liter', stokSistem: 5 },
    { id: 'B012', nama: 'Minyak Goreng', satuan: 'Pouch', stokSistem: 12 },
    { id: 'B013', nama: 'Cup Ice 12oz', satuan: 'Pcs', stokSistem: 1000 },
  ]);

  const daftarKru = [
    'Chika',
    'Ibnu',
    'Novi',
    'Diska',
    'Nugye',
    'Ruslan',
    'A Novan',
  ];

  // State Form Stock-In
  const [formIn, setFormIn] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    idProduk: '',
    kuantiti: '',
    hargaSatuan: '',
    penginput: '',
  });
  // State Form Stock-Out
  const [formOut, setFormOut] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    idProduk: '',
    kuantiti: '',
    keterangan: '',
    lokasi: 'Kedai Utama',
    penginput: '',
  });
  // State Form Opname (Menampung input fisik per ID Produk)
  const [formOpname, setFormOpname] = useState({});

  // Hitung otomatis total belanja di Stock-In
  const totalBelanjaIn = (formIn.kuantiti || 0) * (formIn.hargaSatuan || 0);

  // Filter produk berdasarkan kolom pencarian
  const filteredProduk = listProduk.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitIn = (e) => {
    e.preventDefault();
    alert(
      `✅ Data Stock-In Berhasil!\nProduk: ${
        formIn.idProduk
      }\nTotal Belanja: Rp ${totalBelanjaIn.toLocaleString(
        'id-ID'
      )}\nData siap masuk ke Stock-In.csv`
    );
    setActiveTab('menu');
  };

  const handleSubmitOut = (e) => {
    e.preventDefault();
    alert(
      `✅ Data Stock-Out Berhasil!\nProduk: ${formOut.idProduk}\nTujuan: ${formOut.lokasi}\nData siap masuk ke Stock-Out.csv`
    );
    setActiveTab('menu');
  };

  const handleSubmitOpname = () => {
    alert(
      `✅ Hasil Opname Berhasil Disimpan!\nSelisih akan otomatis dihitung dan dimasukkan ke Opname.csv`
    );
    setActiveTab('menu');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-10">
      <div className="w-full max-w-md bg-white shadow-lg min-h-screen flex flex-col">
        {/* Header Aplikasi */}
        <div className="bg-amber-900 text-white p-5 rounded-b-3xl shadow-md sticky top-0 z-10">
          <div className="flex items-center justify-between">
            {activeTab !== 'menu' && (
              <button
                onClick={() => setActiveTab('menu')}
                className="text-amber-200 hover:text-white font-semibold text-sm flex items-center gap-1"
              >
                ⬅️ Kembali
              </button>
            )}
            <h1 className="text-xl font-bold tracking-wide text-center flex-1">
              {activeTab === 'menu' && 'LOGISTIK BARA'}
              {activeTab === 'in' && '📥 BARANG MASUK'}
              {activeTab === 'out' && '📤 BARANG KELUAR'}
              {activeTab === 'opname' && '📋 STOK OPNAME'}
            </h1>
          </div>
          <p className="text-center text-xs text-amber-200 mt-1">
            Kedai Kopi Bara & Gerobak
          </p>
        </div>

        {/* ISI KONTEN BERDASARKAN TAB YANG AKTIF */}
        <div className="p-5 flex-1 flex flex-col">
          {/* ================= LAYAR UTAMA (MENU SELECTION) ================= */}
          {activeTab === 'menu' && (
            <div className="space-y-4 my-auto">
              <p className="text-gray-600 text-center font-medium mb-6">
                Pilih aktivitas logistik harian:
              </p>

              <button
                onClick={() => setActiveTab('in')}
                className="w-full p-5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center gap-4 text-left transition-all shadow-sm group"
              >
                <span className="text-3xl bg-emerald-500 text-white p-3 rounded-xl group-hover:scale-105 transition-transform">
                  📥
                </span>
                <div>
                  <h3 className="font-bold text-emerald-900 text-lg">
                    Stock-In (Barang Masuk)
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Catat belanjaan bahan baku / kemasan baru
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('out')}
                className="w-full p-5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl flex items-center gap-4 text-left transition-all shadow-sm group"
              >
                <span className="text-3xl bg-rose-500 text-white p-3 rounded-xl group-hover:scale-105 transition-transform">
                  📤
                </span>
                <div>
                  <h3 className="font-bold text-rose-900 text-lg">
                    Stock-Out (Barang Keluar)
                  </h3>
                  <p className="text-xs text-rose-700">
                    Catat pemakaian bar atau distribusi ke gerobak
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('opname')}
                className="w-full p-5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl flex items-center gap-4 text-left transition-all shadow-sm group"
              >
                <span className="text-3xl bg-blue-500 text-white p-3 rounded-xl group-hover:scale-105 transition-transform">
                  📋
                </span>
                <div>
                  <h3 className="font-bold text-blue-900 text-lg">
                    Stok Opname Fisik
                  </h3>
                  <p className="text-xs text-blue-700">
                    Hitung fisik berkala untuk cek selisih sistem
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* ================= LAYAR STOCK-IN (BARANG MASUK) ================= */}
          {activeTab === 'in' && (
            <form onSubmit={handleSubmitIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Tanggal Belanja
                </label>
                <input
                  type="date"
                  value={formIn.tanggal}
                  onChange={(e) =>
                    setFormIn({ ...formIn, tanggal: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl bg-gray-50 text-gray-700 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Penginput (Kru)
                </label>
                <select
                  value={formIn.penginput}
                  onChange={(e) =>
                    setFormIn({ ...formIn, penginput: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl bg-white text-gray-700"
                  required
                >
                  <option value="">-- Pilih Nama --</option>
                  {daftarKru.map((k, i) => (
                    <option key={i} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Pilih Item Barang
                </label>
                <select
                  value={formIn.idProduk}
                  onChange={(e) =>
                    setFormIn({ ...formIn, idProduk: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl bg-white text-gray-700"
                  required
                >
                  <option value="">-- Pilih Item --</option>
                  {listProduk.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.nama} ({p.satuan})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Kuantiti Masuk
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formIn.kuantiti}
                    onChange={(e) =>
                      setFormIn({
                        ...formIn,
                        kuantiti: parseInt(e.target.value) || '',
                      })
                    }
                    className="w-full p-3 border rounded-xl bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Harga Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Rp 0"
                    value={formIn.hargaSatuan}
                    onChange={(e) =>
                      setFormIn({
                        ...formIn,
                        hargaSatuan: parseInt(e.target.value) || '',
                      })
                    }
                    className="w-full p-3 border rounded-xl bg-white text-gray-700"
                    required
                  />
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 mt-4">
                <span className="text-xs text-emerald-700 font-semibold block mb-1">
                  Estimasi Total Belanja
                </span>
                <span className="text-2xl font-black text-emerald-800">
                  Rp {totalBelanjaIn.toLocaleString('id-ID')}
                </span>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md mt-6"
              >
                💾 SIMPAN BARANG MASUK
              </button>
            </form>
          )}

          {/* ================= LAYAR STOCK-OUT (BARANG KELUAR) ================= */}
          {activeTab === 'out' && (
            <form onSubmit={handleSubmitOut} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Tanggal Keluar
                </label>
                <input
                  type="date"
                  value={formOut.tanggal}
                  onChange={(e) =>
                    setFormOut({ ...formOut, tanggal: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl bg-gray-50 text-gray-700 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Penanggung Jawab (Kru)
                </label>
                <select
                  value={formOut.penginput}
                  onChange={(e) =>
                    setFormOut({ ...formOut, penginput: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl bg-white text-gray-700"
                  required
                >
                  <option value="">-- Pilih Nama --</option>
                  {daftarKru.map((k, i) => (
                    <option key={i} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Pilih Item Barang
                </label>
                <select
                  value={formOut.idProduk}
                  onChange={(e) =>
                    setFormOut({ ...formOut, idProduk: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl bg-white text-gray-700"
                  required
                >
                  <option value="">-- Pilih Item --</option>
                  {listProduk.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.nama} ({p.satuan})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Kuantiti Keluar
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formOut.kuantiti}
                    onChange={(e) =>
                      setFormOut({
                        ...formOut,
                        kuantiti: parseInt(e.target.value) || '',
                      })
                    }
                    className="w-full p-3 border rounded-xl bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Lokasi Tujuan
                  </label>
                  <select
                    value={formOut.lokasi}
                    onChange={(e) =>
                      setFormOut({ ...formOut, lokasi: e.target.value })
                    }
                    className="w-full p-3 border rounded-xl bg-white text-gray-700"
                    required
                  >
                    <option value="Kedai Utama">☕ Kedai Utama</option>
                    <option value="Gerobak">🛒 Gerobak</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Keterangan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Buat Restock Bar / Masuk Gerobak"
                  value={formOut.keterangan}
                  onChange={(e) =>
                    setFormOut({ ...formOut, keterangan: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl bg-white text-gray-700"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md mt-6"
              >
                💾 SIMPAN BARANG KELUAR
              </button>
            </form>
          )}

          {/* ================= LAYAR STOK OPNAME FISIK ================= */}
          {activeTab === 'opname' && (
            <div className="flex flex-col flex-1">
              {/* Kolom Cari Barang & Pilih Penginput */}
              <div className="space-y-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <select
                  onChange={(e) =>
                    alert(`Penginput diset ke: ${e.target.value}`)
                  }
                  className="w-full p-2 border rounded-lg bg-white text-sm text-gray-700 shadow-sm"
                >
                  <option value="">-- Pilih Petugas Opname --</option>
                  {daftarKru.map((k, i) => (
                    <option key={i} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="🔍 Cari nama atau ID produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white text-sm text-gray-700 shadow-sm outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Daftar Barang Logistik */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[40vh] pr-1">
                {filteredProduk.map((p) => {
                  const fisik = formOpname[p.id] ?? '';
                  const selisih = fisik !== '' ? fisik - p.stokSistem : 0;

                  return (
                    <div
                      key={p.id}
                      className="p-3 border border-gray-200 rounded-xl shadow-xs bg-white space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                            {p.id}
                          </span>
                          <h4 className="font-bold text-gray-800 text-sm mt-0.5">
                            {p.nama}
                          </h4>
                        </div>
                        <span className="text-xs font-semibold text-gray-500">
                          Sistem:{' '}
                          <strong className="text-gray-800">
                            {p.stokSistem}
                          </strong>{' '}
                          {p.satuan}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 items-center border-t border-dashed border-gray-100">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 font-medium">
                            Fisik:
                          </span>
                          <input
                            type="number"
                            placeholder="Jumlah"
                            value={fisik}
                            onChange={(e) => {
                              const val =
                                e.target.value === ''
                                  ? ''
                                  : parseInt(e.target.value);
                              setFormOpname({ ...formOpname, [p.id]: val });
                            }}
                            className="w-20 p-1 border rounded text-center text-sm font-bold bg-amber-50 text-amber-900 border-amber-200 focus:outline-amber-600"
                          />
                        </div>
                        <div className="text-right text-xs">
                          {fisik !== '' && (
                            <span
                              className={`font-bold px-2 py-1 rounded-md ${
                                selisih === 0
                                  ? 'text-green-700 bg-green-50'
                                  : 'text-red-700 bg-red-50'
                              }`}
                            >
                              Selisih: {selisih > 0 ? `+${selisih}` : selisih}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSubmitOpname}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md mt-auto"
              >
                💾 SIMPAN SEMUA HASIL OPNAME
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
