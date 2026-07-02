'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, KeyRound, RefreshCw, LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginKru() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [daftarKru, setDaftarKru] = useState<any[]>([]);
  const [loadingKru, setLoadingKru] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [form, setForm] = useState({
    nama: '',
    password: ''
  });

  // Load otomatis semua nama karyawan aktif agar mempermudah login di HP
  useEffect(() => {
    const fetchSemuaKru = async () => {
      try {
        const res = await fetch('/api/kru', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) setDaftarKru(data.kru);
      } catch (e) {
        console.error("Gagal memuat daftar kru", e);
      } finally {
        setLoadingKru(false);
      }
    };
    fetchSemuaKru();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nama) return alert("Silakan pilih namamu terlebih dahulu!");
    if (!form.password) return alert("Masukkan password/PIN keamanan Anda!");

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/kru/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // SIMPAN SESI: Simpan data profil ke localStorage agar halaman lain tahu siapa yang sedang login
        localStorage.setItem('kru_session', JSON.stringify(data.kru));
        
        alert(`👋 Halo ${data.kru.nama}, Selamat bekerja!`);
        router.push('/kru/dashboard'); // Diarahkan ke dashboard khusus handbook & slip gaji nanti
      } else {
        alert(`❌ Login Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("❌ Terjadi kendala komunikasi jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center p-6 font-sans">
      <div className="w-full max-w-sm mx-auto space-y-6">
        
        {/* LOGO & BRANDING */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-zinc-900/10 border border-zinc-800">
            <Lock size={26} strokeWidth={2.5} />
          </div>
          <div className="pt-2">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Handbook Karyawan</h1>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Kedai Kopi Bara</p>
          </div>
        </div>

        {/* BOX FORM CONTAINER */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xl shadow-zinc-100/50">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* INPUT CHOOSE NAMA */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Pilih Namamu</label>
              <select 
                value={form.nama} 
                onChange={(e) => setForm({...form, nama: e.target.value})} 
                className="w-full p-3.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs font-bold text-zinc-800 outline-none cursor-pointer focus:bg-white focus:border-zinc-900 transition-all"
                required
              >
                <option value="">{loadingKru ? 'Mengambil data tim...' : '-- Pilih Nama Anda --'}</option>
                {daftarKru.map(k => (
                  <option key={k.id} value={k.nama}>{k.nama} ({k.cabang})</option>
                ))}
              </select>
            </div>

            {/* INPUT PASSWORD */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Sandi / PIN Keamanan</label>
              <div className="relative flex items-center bg-zinc-50 border border-zinc-300 rounded-2xl overflow-hidden focus-within:border-zinc-900浏览 focus-within:bg-white transition-all">
                <div className="pl-4 pr-2 text-zinc-400">
                  <KeyRound size={16} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••" 
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  className="w-full py-3.5 pr-12 bg-transparent text-sm font-bold text-zinc-800 outline-none tracking-wide"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* BUTTON SUBMIT */}
            <button 
              type="submit" 
              disabled={isSubmitting || loadingKru} 
              className="w-full py-4 mt-2 bg-zinc-900 text-white font-black text-xs tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <LogIn size={16} strokeWidth={2.5} />}
              {isSubmitting ? 'VERIFIKASI...' : 'MASUK KE HANDBOOK'}
            </button>

          </form>
        </div>

        {/* UTILITY FOOTER */}
        <p className="text-center text-[10px] font-medium text-zinc-400">
          Lupa password? Silakan hubungi Owner untuk reset data.
        </p>

      </div>
    </div>
  );
}