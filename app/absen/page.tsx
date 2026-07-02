'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Fingerprint, Sun, Moon, Clock, CheckCircle2, Camera, RefreshCw, FileText, Stethoscope } from 'lucide-react';

export default function HalamanAbsenKru() {
  const router = useRouter();
  const [profilKru, setProfilKru] = useState<any>(null);
  const [shiftPilihan, setShiftPilihan] = useState<string>('');
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [berhasil, setBerhasil] = useState<boolean>(false);

  useEffect(() => {
    const sesi = localStorage.getItem('kru_session');
    if (!sesi) router.push('/kru/login');
    else setProfilKru(JSON.parse(sesi));
    return () => tutupKamera();
  }, [router]);

  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  const bukaKamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
    } catch (err) {
      alert("Akses kamera ditolak. Izinkan browser mengakses kamera Anda.");
    }
  };

  const tutupKamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const jepretFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;
      const MAX_WIDTH = 400; const MAX_HEIGHT = 400;
      canvasRef.current.width = MAX_WIDTH; canvasRef.current.height = MAX_HEIGHT;
      context.translate(MAX_WIDTH, 0); context.scale(-1, 1);
      context.drawImage(videoRef.current, 0, 0, MAX_WIDTH, MAX_HEIGHT);
      context.setTransform(1, 0, 0, 1, 0, 0);
      setFotoBase64(canvasRef.current.toDataURL('image/jpeg', 0.6));
      tutupKamera();
    }
  };

  const handleKirimAbsen = async () => {
    if (!shiftPilihan) return alert("Pilih tipe shift / status kehadiran Anda!");
    if (!fotoBase64) return alert("Harap ambil foto bukti kehadiran / surat dokter!");
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/absen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: profilKru.nama, shift: shiftPilihan, fotoBase64: fotoBase64 })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBerhasil(true);
        setTimeout(() => router.push('/kru/dashboard'), 3000); 
      } else {
        alert("Gagal mencatat absen: " + data.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat mengupload foto.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profilKru) return null;

  if (berhasil) {
    return (
      <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center p-5 text-center animate-in fade-in duration-500">
        <div className="bg-white p-5 rounded-full text-emerald-500 mb-5 shadow-2xl scale-in-center">
          <CheckCircle2 size={80} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">TEREKAM!</h1>
        <p className="text-emerald-100 font-medium">Data kehadiran/status berhasil diverifikasi.<br/>Sehat selalu, {profilKru.nama}!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-4 flex flex-col items-center pt-8 pb-20">
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link href="/kru/dashboard" className="p-2.5 bg-white border border-zinc-200 text-zinc-500 rounded-full hover:bg-zinc-100 transition-colors shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xs font-black tracking-widest text-zinc-800 uppercase flex items-center gap-1.5">
          <Fingerprint size={16} className="text-indigo-500" /> Presensi Digital
        </h1>
        <div className="w-10 h-10"></div>
      </div>

      <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xl space-y-6">
        <div className="text-center pb-4 border-b border-zinc-100">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Mencatat kehadiran untuk</p>
          <h2 className="text-2xl font-black text-zinc-800 uppercase">{profilKru.nama}</h2>
          <span className="inline-block mt-2 text-[10px] font-black px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg uppercase tracking-wider">{profilKru.cabang}</span>
        </div>

        {/* 1. PILIH SHIFT / STATUS */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest text-center mb-3">1. Pilih Kehadiran / Status Hari Ini</p>
          
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setShiftPilihan('Shift Pagi')} className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${shiftPilihan === 'Shift Pagi' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-zinc-100 bg-zinc-50/50 text-zinc-400'}`}>
              <Sun size={20} className={shiftPilihan === 'Shift Pagi' ? 'text-indigo-600' : 'text-zinc-400'} />
              <span className={`text-[10px] font-black uppercase ${shiftPilihan === 'Shift Pagi' ? 'text-indigo-700' : 'text-zinc-600'}`}>Shift Pagi</span>
            </button>
            <button onClick={() => setShiftPilihan('Shift Malam')} className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${shiftPilihan === 'Shift Malam' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-zinc-100 bg-zinc-50/50 text-zinc-400'}`}>
              <Moon size={20} className={shiftPilihan === 'Shift Malam' ? 'text-indigo-600' : 'text-zinc-400'} />
              <span className={`text-[10px] font-black uppercase ${shiftPilihan === 'Shift Malam' ? 'text-indigo-700' : 'text-zinc-600'}`}>Shift Malam</span>
            </button>
          </div>
          
          <button onClick={() => setShiftPilihan('Full Day')} className={`w-full p-2.5 rounded-2xl border-2 transition-all flex justify-center items-center gap-2 ${shiftPilihan === 'Full Day' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-zinc-100 bg-zinc-50/50 text-zinc-400'}`}>
            <Clock size={16} className={shiftPilihan === 'Full Day' ? 'text-indigo-600' : 'text-zinc-400'} />
            <span className={`text-[10px] font-black uppercase ${shiftPilihan === 'Full Day' ? 'text-indigo-700' : 'text-zinc-600'}`}>Full Day (Lembur)</span>
          </button>

          <div className="flex items-center gap-2 py-2">
            <div className="h-px bg-zinc-100 flex-1"></div>
            <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Tidak Masuk</span>
            <div className="h-px bg-zinc-100 flex-1"></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setShiftPilihan('Izin Resmi')} className={`p-3 rounded-2xl border-2 transition-all flex justify-center items-center gap-1.5 ${shiftPilihan === 'Izin Resmi' ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-zinc-100 bg-zinc-50/50 text-zinc-400'}`}>
              <FileText size={16} className={shiftPilihan === 'Izin Resmi' ? 'text-amber-600' : 'text-zinc-400'} />
              <span className={`text-[10px] font-black uppercase ${shiftPilihan === 'Izin Resmi' ? 'text-amber-700' : 'text-zinc-600'}`}>Izin Resmi</span>
            </button>
            <button onClick={() => setShiftPilihan('Sakit')} className={`p-3 rounded-2xl border-2 transition-all flex justify-center items-center gap-1.5 ${shiftPilihan === 'Sakit' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-zinc-100 bg-zinc-50/50 text-zinc-400'}`}>
              <Stethoscope size={16} className={shiftPilihan === 'Sakit' ? 'text-orange-600' : 'text-zinc-400'} />
              <span className={`text-[10px] font-black uppercase ${shiftPilihan === 'Sakit' ? 'text-orange-700' : 'text-zinc-600'}`}>Sakit</span>
            </button>
          </div>
        </div>

        {/* 2. KAMERA BUKTI */}
        <div className="pt-4 border-t border-zinc-100">
          <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest text-center mb-4">2. Foto Bukti (Selfie / Surat Dokter)</p>
          <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-2xl p-2 flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
            {stream && !fotoBase64 && (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-[220px] object-cover rounded-xl shadow-inner -scale-x-100" />
                <button type="button" onClick={jepretFoto} className="absolute bottom-4 bg-white text-indigo-600 px-5 py-2.5 rounded-full shadow-lg font-bold text-xs flex items-center gap-2 border border-zinc-200 animate-in zoom-in duration-300">
                  <Camera size={16} /> Jepret Foto
                </button>
              </>
            )}
            {fotoBase64 && (
              <>
                <img src={fotoBase64} alt="Selfie" className="w-full h-[220px] object-cover rounded-xl shadow-inner" />
                <button type="button" onClick={() => { setFotoBase64(null); bukaKamera(); }} className="absolute bottom-4 bg-zinc-900/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-lg font-bold text-xs flex items-center gap-2">
                  <RefreshCw size={14} /> Ulangi Foto
                </button>
              </>
            )}
            {!stream && !fotoBase64 && (
              <button type="button" onClick={bukaKamera} className="text-zinc-400 flex flex-col items-center gap-3 p-10 hover:text-indigo-500 transition-colors">
                <div className="p-4 bg-zinc-200/50 rounded-full"><Camera size={32} /></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Ketuk Buka Kamera</span>
              </button>
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
        </div>

        {/* TOMBOL SUBMIT */}
        <button onClick={handleKirimAbsen} disabled={!shiftPilihan || !fotoBase64 || isLoading} className="w-full mt-4 py-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
          {isLoading ? <><RefreshCw size={16} className="animate-spin" /> MENGIRIM DATA...</> : <><CheckCircle2 size={16} /> KIRIM DATA</>}
        </button>
      </div>
    </div>
  );
}