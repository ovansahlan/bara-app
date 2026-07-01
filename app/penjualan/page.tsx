'use client';

import React, { useState, useEffect } from 'react';

export default function LaporanPenjualanBara() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    lokasi: 'Kedai Utama',
    kasir: '',
    shift: '',
    tunai: '',
    qris: '',
    edc: '',
    grab: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Daftar Kru & Shift (Sesuai database)
  const daftarKru = [
    'Chika',
    'Ibnu',
    'Novi',
    'Diska',
    'Nugye',
    'Ruslan',
    'A Novan',
  ];
  const daftarShift = [
    'Shift 1 (Pagi)',
    'Shift 2 (Malam/Tutup)',
    'Full Day (Gabungan)',
  ];

  // Kalkulasi Total Omset secara Real-time
  const totalOmset =
    (parseInt(formData.tunai) || 0) +
    (parseInt(formData.qris) || 0) +
    (parseInt(formData.edc) || 0) +
    (parseInt(formData.grab) || 0);

  // Fungsi Submit
  const handleLapor = (e) => {
    e.preventDefault();
    if (!formData.kasir || !formData.shift) {
      alert('Harap lengkapi Nama Kasir dan Shift!');
      return;
    }

    setIsSubmitting(true);

    // SIMULASI PENGIRIMAN DATA KE DATABASE
    setTimeout(() => {
      const targetDB =
        formData.lokasi === 'Kedai Utama'
          ? 'DB_Penjualan.csv'
          : 'DB_Penjualan_Gerobak.csv';
      alert(
        `✅ Laporan Berhasil Disimpan!\n\nTotal Omset: Rp ${totalOmset.toLocaleString(
          'id-ID'
        )}\nData masuk ke: ${targetDB}`
      );

      setIsSubmitting(false);
      // Reset hanya uangnya, biarkan tanggal/lokasi/kasir tetap jika ingin input lagi
      setFormData({ ...formData, tunai: '', qris: '', edc: '', grab: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pb-10">
      <div className="w-full max-w-md bg-white shadow-lg rounded-b-3xl">
        {/* Header */}
        <div className="bg-amber-800 text-white p-5 rounded-b-3xl shadow-md text-center">
          <h1 className="text-xl font-bold tracking-wider">KEDAI KOPI BARA</h1>
          <p className="text-sm mt-1 text-amber-200">
            Laporan Penjualan Harian (Kasir)
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleLapor} className="space-y-5">
            {/* Bagian 1: Informasi Dasar */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-2">
                Informasi Shift
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Lokasi Outlet
                  </label>
                  <select
                    value={formData.lokasi}
                    onChange={(e) =>
                      setFormData({ ...formData, lokasi: e.target.value })
                    }
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Kedai Utama">☕ Kedai Utama</option>
                    <option value="Gerobak">🛒 Gerobak Bajay</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Kasir
                  </label>
                  <select
                    value={formData.kasir}
                    onChange={(e) =>
                      setFormData({ ...formData, kasir: e.target.value })
                    }
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Pilih --</option>
                    {daftarKru.map((kru, idx) => (
                      <option key={idx} value={kru}>
                        {kru}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Shift Kerja
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) =>
                      setFormData({ ...formData, shift: e.target.value })
                    }
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Pilih --</option>
                    {daftarShift.map((shift, idx) => (
                      <option key={idx} value={shift}>
                        {shift}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Bagian 2: Input Pendapatan */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-2">
                Rincian Pendapatan (Rp)
              </h2>

              {/* Uang Tunai */}
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-3 rounded-xl text-xl">💵</div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Uang Tunai (Cash)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.tunai}
                    onChange={(e) =>
                      setFormData({ ...formData, tunai: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-xl bg-white text-gray-800 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* QRIS */}
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl text-xl">📱</div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    QRIS
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.qris}
                    onChange={(e) =>
                      setFormData({ ...formData, qris: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-xl bg-white text-gray-800 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* EDC / Transfer */}
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-xl text-xl">💳</div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    EDC / Transfer Bank
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.edc}
                    onChange={(e) =>
                      setFormData({ ...formData, edc: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-xl bg-white text-gray-800 font-bold outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Grab / Online */}
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-xl text-xl">🛵</div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Grab / Online
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.grab}
                    onChange={(e) =>
                      setFormData({ ...formData, grab: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-xl bg-white text-gray-800 font-bold outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Total Otomatis */}
            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl text-center shadow-inner">
              <span className="text-sm text-amber-800 font-bold block mb-1">
                TOTAL OMSET SHIFT INI
              </span>
              <span className="text-3xl font-black text-amber-900">
                Rp {totalOmset.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-4 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:scale-95'
              }`}
            >
              {isSubmitting ? '🔄 Menyimpan Data...' : '💾 SIMPAN LAPORAN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
