'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Camera, User, Clock, CheckCircle2, RefreshCw, ChevronLeft } from 'lucide-react';

export default function AbsensiSaaS() {
  const [waktu, setWaktu] = useState<string>('');
  const [formData, setFormData] = useState({ nama: '', shift: '', status: 'Masuk' });
  
  // Type asuransi untuk MediaStream di TypeScript
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  
  // Type asuransi untuk Referensi Elemen DOM HTML
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const daftarKru = ["Chika", "Ibnu", "Novi", "Diska", "Nugye", "Ruslan", "A Novan"];
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

  const bukaKamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      alert("Akses kamera ditolak atau tidak tersedia.");
    }
  };

  const jepretFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      
      // Proteksi null-check context kanvas untuk TypeScript
      if (!context) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      setFotoBase64(canvasRef.current.toDataURL('image/jpeg', 0.8));
      tutupKamera();
    }
  };

  const tutupKamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleAbsen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.shift || !fotoBase64) return alert("Lengkapi data dan foto selfie.");
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Presensi Berhasil Diverifikasi!");
      setIsSubmitting(false); setFotoBase64(null); setFormData({ nama: '', shift: '', status: 'Masuk' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-10">
      {/* Header Premium SaaS */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold tracking-wide">Presensi Karyawan</h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5">
        {/* Widget Jam Digital */}
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-600 shadow-sm mb-6">
          <Clock size={16} className="text-indigo-600" />
          <span>{waktu || "Sinkronisasi waktu..."}</span>
        </div>

        {/* Form Input Utama */}
        <form onSubmit={handleAbsen} className="space-y-5">
          
          {/* Blok Identitas Staf */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nama Staf</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <User size={16} />
                </div>
                <select value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full pl-10 p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none">
                  <option value="">Pilih identitas Anda...</option>
                  {daftarKru.map((kru, idx) => <option key={idx} value={kru}>{kru}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Shift</label>
                <select value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                  <option value="">-- Pilih --</option>
                  {daftarShift.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tipe</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                  <option value="Masuk">Masuk</option>
                  <option value="Pulang">Pulang</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Blok Modul Kamera */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3 text-center">Verifikasi Wajah (Selfie)</label>
            
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden min-h-[260px] transition-all hover:border-indigo-400">
              {stream && !fotoBase64 && (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={jepretFoto} className="absolute bottom-4 bg-white text-indigo-600 px-6 py-2.5 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-indigo-50 active:scale-95 transition-all border border-zinc-200">
                    <Camera size={18} /> Ambil Foto
                  </button>
                </>
              )}
              {fotoBase64 && (
                <>
                  <img src={fotoBase64} alt="Selfie" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => { setFotoBase64(null); bukaKamera(); }} className="absolute bottom-4 bg-zinc-900 text-white px-6 py-2.5 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all">
                    <RefreshCw size={16} /> Ulangi
                  </button>
                </>
              )}
              {!stream && !fotoBase64 && (
                <button type="button" onClick={bukaKamera} className="text-zinc-400 flex flex-col items-center gap-2 hover:text-indigo-600 transition-colors p-10">
                  <Camera size={40} strokeWidth={1.5} />
                  <span className="text-sm font-semibold tracking-tight text-zinc-500">Ketuk untuk membuka kamera</span>
                </button>
              )}
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
          </div>

          {/* Tombol Pengiriman Akhir Form */}
          <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-xl text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${isSubmitting ? 'bg-zinc-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}>
            {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSubmitting ? 'Memverifikasi Data...' : 'KIRIM PRESENSI'}
          </button>
          
        </form>
      </div>
    </div>
  );
}