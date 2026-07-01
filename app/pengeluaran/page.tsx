'use client';

import React, { useState } from 'react';

export default function PengeluaranHarianBara() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    penginput: '',
    kategori: 'Pengeluaran Bar',
    namaItem: '',
    kuantiti: '',
    satuan: 'Pcs',
    nominal: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Daftar Kru
  const daftarKru = [
    'Chika',
    'Ibnu',
    'Novi',
    'Diska',
    'Nugye',
    'Ruslan',
    'A Novan',
  ];

  // Kategori Pengeluaran
  const daftarKategori = [
    { id: 'Pengeluaran Bar', label: '🥤 Pengeluaran Bar' },
    { id: 'Pengeluaran Dapur', label: '🍳 Pengeluaran Dapur' },
    { id: 'Pengeluaran Lain2', label: '🛒 Lain-lain' },
  ];

  // Saran Dropdown Pintar berdasarkan kebiasaan belanja di CSV Anda
  const saranItem = [
    'Es Batu',
    'Galon Air',
    'Gas LPG 3kg',
    'Gas LPG 12kg',
    'Susu SKM',
    'Telur',
    'Minyak Goreng',
    'Bensin',
    'Kertas Struk',
    'Plastik Kresek',
    'Roti',
    'Sayuran',
  ];

  const daftarSatuan = [
    'Pcs',
    'Ball',
    'Kg',
    'Liter',
    'Galon',
    'Tabung',
    'Ikat',
    'Pack',
    'Dus',
  ];

  const handleLapor = (e) => {
    e.preventDefault();
    if (
      !formData.penginput ||
      !formData.namaItem ||
      !formData.kuantiti ||
      !formData.nominal
    ) {
      alert('Harap lengkapi semua data belanja!');
      return;
    }

    setIsSubmitting(true);

    // Menggabungkan keterangan untuk masuk ke CSV (Contoh: "Es Batu 2 Ball")
    const keteranganFormatCSV = `${formData.namaItem} ${formData.kuantiti} ${formData.satuan}`;

    setTimeout(() => {
      alert(
        `✅ Pengeluaran Dicatat!\n\nBarang: ${keteranganFormatCSV}\nTotal: Rp ${parseInt(
          formData.nominal
        ).toLocaleString('id-ID')}\nData siap masuk ke DB_Pengeluaran.csv`
      );

      setIsSubmitting(false);
      // Reset isian belanja (sisakan tanggal, kru, kategori untuk input struk selanjutnya)
      setFormData({ ...formData, namaItem: '', kuantiti: '', nominal: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pb-10">
      <div className="w-full max-w-md bg-white shadow-lg rounded-b-3xl">
        <div className="bg-rose-800 text-white p-5 rounded-b-3xl shadow-md text-center">
          <h1 className="text-xl font-bold tracking-wider">KEDAI KOPI BARA</h1>
          <p className="text-sm mt-1 text-rose-200">
            Input Pengeluaran Kas Harian
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleLapor} className="space-y-5">
            {/* Bagian 1: Informasi Dasar */}
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal: e.target.value })
                    }
                    className="w-full p-2.5 text-sm border rounded-xl bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    Nama Kru
                  </label>
                  <select
                    value={formData.penginput}
                    onChange={(e) =>
                      setFormData({ ...formData, penginput: e.target.value })
                    }
                    className="w-full p-2.5 text-sm border rounded-xl bg-white"
                    required
                  >
                    <option value="">-- Pilih --</option>
                    {daftarKru.map((kru, idx) => (
                      <option key={idx} value={kru}>
                        {kru}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  Kategori Pengeluaran
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kategori: e.target.value })
                  }
                  className="w-full p-2.5 text-sm border rounded-xl bg-white"
                >
                  {daftarKategori.map((kat, idx) => (
                    <option key={idx} value={kat.id}>
                      {kat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bagian 2: Rincian Belanja yang Baru (Terstruktur) */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-2">
                Detail Barang
              </h2>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Barang / Item
                </label>
                {/* Menggunakan Datalist agar bisa Dropdown sekaligus Ketik Manual */}
                <input
                  type="text"
                  list="saran-barang"
                  placeholder="Ketik atau pilih barang..."
                  value={formData.namaItem}
                  onChange={(e) =>
                    setFormData({ ...formData, namaItem: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
                <datalist id="saran-barang">
                  {saranItem.map((item, idx) => (
                    <option key={idx} value={item} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kuantiti (Jumlah)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 2"
                    value={formData.kuantiti}
                    onChange={(e) =>
                      setFormData({ ...formData, kuantiti: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Satuan Ukur
                  </label>
                  <select
                    value={formData.satuan}
                    onChange={(e) =>
                      setFormData({ ...formData, satuan: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {daftarSatuan.map((sat, idx) => (
                      <option key={idx} value={sat}>
                        {sat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Total Harga (Rp)
                </label>
                <div className="flex items-center gap-3">
                  <div className="bg-rose-100 p-3 rounded-xl text-xl">💸</div>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.nominal}
                    onChange={(e) =>
                      setFormData({ ...formData, nominal: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl bg-white text-rose-700 font-black text-lg outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-4 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 active:scale-95'
              }`}
            >
              {isSubmitting ? '🔄 Menyimpan...' : '📥 SIMPAN PENGELUARAN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
