'use client';

import React, { useState } from 'react';

export default function BelanjaOwnerBara() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategoriInternal: 'Operational',
    keteranganLengkap: '',
    nominal: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kategori Internal sesuai persis dengan DB_Belanja_Owner.csv Anda
  const daftarKategoriInternal = [
    { id: 'Operational', label: '⚡ Operational (Listrik, Wi-Fi, Sewa, dll)' },
    { id: 'Bar', label: '☕ Bar (Kopi Massal, Sirup Import, dll)' },
    { id: 'Dapur', label: '🍳 Dapur (Supplier Utama, Gas Besar, dll)' },
    { id: 'Gerobak', label: '🛒 Gerobak (Modal Bahan Bakar / Supply Gerobak)' },
  ];

  // Saran otomatis berdasarkan riwayat data Owner Anda di Excel
  const saranKeterangan = [
    'Listrik Kafe',
    'Internet & Wi-Fi',
    'Belanja Supplier Salman',
    'Kopi Arabica & Robusta (A2, R2)',
    'Syrup Hazelnut / Vanilla',
    'Belanja Pabrik Mie',
    'Restock Es Batu Gerobak',
  ];

  const handleSubmitOwner = (e) => {
    e.preventDefault();
    if (!formData.keteranganLengkap || !formData.nominal) {
      alert('Harap lengkapi Keterangan Lengkap dan Nominal!');
      return;
    }

    setIsSubmitting(true);

    // SIMULASI PENGIRIMAN DATA KE DATABASE OWNER
    setTimeout(() => {
      alert(
        `🔒 [AKSES OWNER APPROVED]\n\nData Belanja Owner Berhasil Dicatat!\nKategori: ${
          formData.kategoriInternal
        }\nNominal: Rp ${parseInt(formData.nominal).toLocaleString(
          'id-ID'
        )}\nData masuk ke: DB_Belanja_Owner.csv`
      );

      setIsSubmitting(false);
      // Reset form belanja
      setFormData({ ...formData, keteranganLengkap: '', nominal: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center pb-10 items-center px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
        {/* Header (Tema Ungu/Gelap Khas Dashboard Owner) */}
        <div className="bg-indigo-950 text-white p-6 shadow-md text-center relative">
          <div className="absolute top-4 left-4 bg-indigo-800 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md tracking-wider">
            Owner Only
          </div>
          <h1 className="text-xl font-black tracking-wider mt-2">
            KEDAI KOPI BARA
          </h1>
          <p className="text-xs mt-1 text-indigo-300">
            Input Pembelanjaan & Investasi Owner
          </p>
        </div>

        <div className="p-6 bg-slate-50">
          <form onSubmit={handleSubmitOwner} className="space-y-5">
            {/* Input Tanggal */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            {/* Pilihan Kategori Internal */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Kategori Internal
              </label>
              <select
                value={formData.kategoriInternal}
                onChange={(e) =>
                  setFormData({ ...formData, kategoriInternal: e.target.value })
                }
                className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              >
                {daftarKategoriInternal.map((kat, idx) => (
                  <option key={idx} value={kat.id}>
                    {kat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Keterangan Lengkap (Menggunakan Datalist Pintar) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Keterangan Lengkap
              </label>
              <input
                type="text"
                list="saran-owner"
                placeholder="Contoh: Bayar Listrik / Salman Dapur..."
                value={formData.keteranganLengkap}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    keteranganLengkap: e.target.value,
                  })
                }
                className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
                required
              />
              <datalist id="saran-owner">
                {saranKeterangan.map((item, idx) => (
                  <option key={idx} value={item} />
                ))}
              </datalist>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                *Ketik langsung atau pilih dari riwayat pengeluaran umum owner.
              </p>
            </div>

            {/* Nominal Belanja */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Nominal Pengeluaran (Rp)
              </label>
              <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1 shadow-xs focus-within:ring-2 focus-within:ring-indigo-600">
                <span className="bg-indigo-50 text-indigo-900 font-black px-3 py-2 rounded-lg text-sm">
                  Rp
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.nominal}
                  onChange={(e) =>
                    setFormData({ ...formData, nominal: e.target.value })
                  }
                  className="w-full p-2 text-indigo-950 font-black text-xl outline-none"
                  required
                />
              </div>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-6 py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-900 hover:bg-indigo-950 active:scale-95'
              }`}
            >
              {isSubmitting ? '🔄 Mengunci Data...' : '🔒 LOCK & SIMPAN DATA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
