'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { Camera, User, Clock, CheckCircle2, RefreshCw, ChevronLeft } from 'lucide-react';

export default function AbsensiSaaS() {
  const [waktu, setWaktu] = useState<string>('');
  const [formData, setFormData] = useState({ nama: '', shift: '', status: 'Masuk' });
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // TWEAK 2: Mengunci daftar nama kru toko sesuai instruksi
  const daftarKru = ["Chika", "Nugye", "Diska", "Ibnu"];
  const daftarShift = ["Shift 1 (Pagi)", "Shift 2 (Malam/Tutup)", "Full Day (Gabungan)"];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setWaktu(now.toLocaleString('id-ID', { 
        weekday: 'long', year: 'numeric', month: 'long', 
        day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).replace(/,/g, ' •'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const bukaKamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
    } catch (err) {
      alert("Akses kamera ditolak atau tidak tersedia pada perangkat ini.");
    }
  };

  // TWEAK 1A: Membalik matriks kanvas agar hasil simpanan .jpg di Vercel Blob ikut ter-mirror otomatis
  const jepretFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;

      canvasRef.current.width = MAX_WIDTH;
      canvasRef.current.height = MAX_HEIGHT;

      // Logika Kriptografi Kanvas: Geser sumbu X ke kanan, lalu balik arah skalanya (-1)
      context.translate(MAX_WIDTH, 0);
      context.scale(-1, 1);

      // Gambar video ke kanvas mini dalam kondisi terbalik (mirrored)
      context.drawImage(videoRef.current, 0, 0, MAX_WIDTH, MAX_HEIGHT);

      // Kembalikan transformasi kanvas ke normal setelah selesai menggambar
      context.setTransform(1, 0, 0, 1, 0, 0);

      const kualitasKompresi = 0.6; 
      setFotoBase64(canvasRef.current.toDataURL('image/jpeg', kualitasKompresi));
      
      tutupKamera();
    }
  };

  const tutupKamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleAbsen = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.shift || !fotoBase64) {
      alert("Harap lengkapi identitas, shift, dan foto wajah Anda!");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/absen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: formData.nama,
          shift: formData.shift,
          status: formData.status,
          fotoBase64: fotoBase64, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        setFotoBase64(null); 
        setFormData({ nama: '', shift: '', status: 'Masuk' });
      } else {
        alert(`❌ Gagal menyimpan: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Terjadi kesalahan koneksi sistem ke backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-10">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold tracking-wide text-zinc-800 uppercase">Presensi Karyawan</h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5">
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-600 shadow-xs mb-6">
          <Clock size={16} className="text-indigo-600" />
          <span>{waktu || "Sinkronisasi waktu server..."}</span>
        </div>

        <form onSubmit={handleAbsen} className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nama Anggota Staf</label>
              <select 
                value={formData.nama} 
                onChange={(e) => setFormData({...formData, nama: e.target.value})} 
                className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm outline-none font-medium text-zinc-800"
                required
              >
                <option value="">Pilih identitas Anda...</option>
                {daftarKru.map((kru, idx) => <option key={idx} value={kru}>{kru}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Shift Kerja</label>
                <select 
                  value={formData.shift} 
                  onChange={(e) => setFormData({...formData, shift: e.target.value})} 
                  className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium text-zinc-800"
                  required
                >
                  <option value="">-- Pilih --</option>
                  {daftarShift.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Status Log</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})} 
                  className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium text-zinc-800"
                >
                  <option value="Masuk">Masuk Shift</option>
                  <option value="Pulang">Pulang Tutup</option>
                  <option value="Izin">Izin Resmi</option>
                  <option value="Sakit">Sakit</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3 text-center">Verifikasi Wajah (Selfie Toko)</label>
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden min-h-[260px]">
              {stream && !fotoBase64 && (
                <>
                  {/* TWEAK 1B: Menambahkan class Tailwind '-scale-x-100' agar live preview video di layar HP terasa seperti cermin */}
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg shadow-inner -scale-x-100" />
                  <button type="button" onClick={jepretFoto} className="absolute bottom-4 bg-white text-indigo-600 px-6 py-2.5 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 border border-zinc-200">
                    <Camera size={18} /> Ambil Foto
                  </button>
                </>
              )}
              {fotoBase64 && (
                <>
                  {/* Gambar hasil jepretan tidak perlu dibalik manual lagi karena piksel datanya sudah dibalik permanen oleh Canvas di atas */}
                  <img src={fotoBase64} alt="Selfie" className="w-full h-full object-cover rounded-lg shadow-inner" />
                  <button type="button" onClick={() => { setFotoBase64(null); bukaKamera(); }} className="absolute bottom-4 bg-zinc-900 text-white px-6 py-2.5 rounded-full shadow-lg font-bold text-sm flex items-center gap-2">
                    <RefreshCw size={16} /> Kamera Ulang
                  </button>
                </>
              )}
              {!stream && !fotoBase64 && (
                <button type="button" onClick={bukaKamera} className="text-zinc-400 flex flex-col items-center gap-2 p-10">
                  <Camera size={40} strokeWidth={1.5} />
                  <span className="text-xs font-semibold tracking-tight text-zinc-500">Ketuk untuk mengaktifkan kamera</span>
                </button>
              )}
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full py-4 rounded-xl text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
              isSubmitting ? 'bg-zinc-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSubmitting ? 'Mengirim ke Google Sheets...' : 'KIRIM PRESENSI MASUK'}
          </button>
        </form>
      </div>
    </div>
  );
}