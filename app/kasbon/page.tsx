'use client';

import React, { useState } from 'react';

export default function KasbonBara() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaKru: '',
    nominal: '',
    keterangan: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Daftar Kru (Sesuai database Anda)
  const daftarKru = [
    'Chika',
    'Ibnu',
    'Novi',
    'Diska',
    'Nugye',
    'Ruslan',
    'A Novan',
  ];

  // Saran alasan kasbon yang sering dipakai
  const saranKeterangan = [
    'Kebutuhan rumah',
    'Kebutuhan anak (Susu/Pempers)',
    'Bayar cicilan / tagihan',
    'Berobat / Sakit',
    'Transportasi / Bensin',
  ];

  const handleAjukan = (e) => {
    e.preventDefault();
    if (!formData.namaKru || !formData.nominal || !formData.keterangan) {
      alert('Harap lengkapi Nama, Nominal, dan Keterangan!');
      return;
    }

    // Validasi konfirmasi (karena ini menyangkut potong gaji)
    const konfirmasi = window.confirm(
      `Konfirmasi Pengajuan Kasbon:\n\nNama: ${
        formData.namaKru
      }\nNominal: Rp ${parseInt(formData.nominal).toLocaleString(
        'id-ID'
      )}\nAlasan: ${
        formData.keterangan
      }\n\nApakah data ini sudah benar dan disetujui?`
    );

    if (!konfirmasi) return;

    setIsSubmitting(true);

    // SIMULASI PENGIRIMAN DATA KE DATABASE KASBON
    setTimeout(() => {
      alert(
        `✅ Pengajuan Kasbon Berhasil Dicatat!\n\nData akan masuk ke: DB_Kasbon.csv\n*Catatan: Nominal ini akan otomatis memotong gaji bulan bersangkutan.`
      );

      setIsSubmitting(false);
      // Reset form setelah sukses
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        namaKru: '',
        nominal: '',
        keterangan: '',
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pb-10 items-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200 mt-6">
        {/* Header Tema Oranye */}
        <div className="bg-orange-600 text-white p-6 shadow-md text-center">
          <div className="flex justify-center mb-2">
            <span className="bg-orange-800 text-orange-100 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              💳 Potong Gaji
            </span>
          </div>
          <h1 className="text-xl font-black tracking-wider">KEDAI KOPI BARA</h1>
          <p className="text-sm mt-1 text-orange-200">
            Form Pengajuan Kasbon Kru
          </p>
        </div>

        <div className="p-6 bg-orange-50/30">
          <form onSubmit={handleAjukan} className="space-y-5">
            {/* Tanggal & Nama Kru */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-800 font-medium outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Nama Kru
                </label>
                <select
                  value={formData.namaKru}
                  onChange={(e) =>
                    setFormData({ ...formData, namaKru: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-800 font-medium outline-none focus:ring-2 focus:ring-orange-500"
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

            {/* Nominal Kasbon */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Nominal Pinjaman (Rp)
              </label>
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-orange-500">
                <span className="bg-orange-100 text-orange-800 font-bold px-4 py-3 rounded-lg text-sm">
                  Rp
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.nominal}
                  onChange={(e) =>
                    setFormData({ ...formData, nominal: e.target.value })
                  }
                  className="w-full p-2 text-gray-900 font-black text-xl outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            {/* Keterangan / Alasan */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Keterangan / Alasan
              </label>
              <input
                type="text"
                list="saran-alasan"
                placeholder="Contoh: Kebutuhan rumah..."
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-800 outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                required
              />
              <datalist id="saran-alasan">
                {saranKeterangan.map((item, idx) => (
                  <option key={idx} value={item} />
                ))}
              </datalist>
            </div>

            {/* Peringatan Potong Gaji */}
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex gap-3 items-start mt-2">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-xs text-red-800 font-medium leading-relaxed">
                Pengajuan kasbon ini akan dicatat ke dalam sistem dan akan{' '}
                <strong className="font-bold">
                  otomatis memotong total gaji
                </strong>{' '}
                pada bulan ini.
              </p>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
              }`}
            >
              {isSubmitting ? '🔄 Memproses...' : '📝 AJUKAN KASBON'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
