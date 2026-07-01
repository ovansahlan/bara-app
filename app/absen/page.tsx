'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function AbsensiBara() {
  const [waktu, setWaktu] = useState('');
  const [formData, setFormData] = useState({
    nama: '',
    shift: '',
    status: 'Masuk',
  });

  // State untuk Kamera
  const [stream, setStream] = useState(null);
  const [fotoBase64, setFotoBase64] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Daftar Kru & Shift (Sesuai database Anda)
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
          second: '2-digit',
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fungsi Menyalakan Kamera HP
  const bukaKamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // 'user' = kamera depan selfie
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert('Gagal membuka kamera. Pastikan Anda memberi izin akses kamera.');
    }
  };

  // Fungsi Mengambil Foto
  const jepretFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      // Set ukuran kanvas sesuai ukuran video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const fotoData = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setFotoBase64(fotoData);
      tutupKamera();
    }
  };

  // Fungsi Menutup Kamera
  const tutupKamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Fungsi Hapus Foto untuk Mengulang
  const ulangFoto = () => {
    setFotoBase64(null);
    bukaKamera();
  };

  // Fungsi Submit Data
  const handleAbsen = (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.shift || !fotoBase64) {
      alert('Harap lengkapi Nama, Shift, dan Foto Selfie!');
      return;
    }

    setIsSubmitting(true);

    // SIMULASI PROSES PENGIRIMAN DATA KE VERCEL -> GOOGLE SHEETS
    setTimeout(() => {
      alert(
        '✅ Absen Berhasil Tersimpan!\n\nData akan dikirim ke DB_Absensi.csv'
      );
      setIsSubmitting(false);
      setFotoBase64(null);
      setFormData({ nama: '', shift: '', status: 'Masuk' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pb-10">
      <div className="w-full max-w-md bg-white shadow-lg rounded-b-3xl">
        {/* Header */}
        <div className="bg-amber-800 text-white p-5 rounded-b-3xl shadow-md text-center">
          <h1 className="text-2xl font-bold tracking-wider">KEDAI KOPI BARA</h1>
          <p className="text-sm mt-1 text-amber-200">Sistem Absensi Digital</p>
        </div>

        <div className="p-6">
          {/* Tanggal & Waktu */}
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-6 text-center shadow-sm">
            <p className="text-xs text-gray-500 font-semibold mb-1">
              Waktu Saat Ini
            </p>
            <p className="text-sm font-bold text-gray-800">
              {waktu || 'Memuat waktu...'}
            </p>
          </div>

          <form onSubmit={handleAbsen} className="space-y-4">
            {/* Input Nama */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nama Kru
              </label>
              <select
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white text-gray-700"
              >
                <option value="">-- Pilih Nama --</option>
                {daftarKru.map((kru, idx) => (
                  <option key={idx} value={kru}>
                    {kru}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Shift */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Shift Kerja
              </label>
              <select
                value={formData.shift}
                onChange={(e) =>
                  setFormData({ ...formData, shift: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white text-gray-700"
              >
                <option value="">-- Pilih Shift --</option>
                {daftarShift.map((shift, idx) => (
                  <option key={idx} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Status Kehadiran
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white text-gray-700"
              >
                <option value="Masuk">🟢 Masuk (Check-in)</option>
                <option value="Pulang">🔴 Pulang (Check-out)</option>
                <option value="Izin">🟡 Izin</option>
                <option value="Sakit">🔵 Sakit</option>
              </select>
            </div>

            {/* Area Kamera Selfie */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                Foto Selfie Bukti Kehadiran
              </label>

              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[250px]">
                {/* Mode Tampil Kamera */}
                {stream && !fotoBase64 && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={jepretFoto}
                      className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform transform active:scale-95"
                    >
                      📸 Jepret Foto
                    </button>
                  </>
                )}

                {/* Mode Tampil Hasil Foto */}
                {fotoBase64 && (
                  <>
                    <img
                      src={fotoBase64}
                      alt="Hasil Selfie"
                      className="w-full rounded-xl shadow-md"
                    />
                    <button
                      type="button"
                      onClick={ulangFoto}
                      className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform transform active:scale-95"
                    >
                      🔄 Ulangi Foto
                    </button>
                  </>
                )}

                {/* Tombol Mulai Kamera */}
                {!stream && !fotoBase64 && (
                  <button
                    type="button"
                    onClick={bukaKamera}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md flex items-center gap-2"
                  >
                    <span>📷 Buka Kamera Selfie</span>
                  </button>
                )}

                {/* Kanvas tersembunyi untuk mengambil gambar */}
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:scale-95'
              }`}
            >
              {isSubmitting ? '🔄 Mengirim Data...' : '🚀 ABSEN SEKARANG'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
