'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { 
  Receipt, User, Calendar, ChevronLeft, CheckCircle2, 
  Plus, Trash2, Layers, Landmark, CreditCard, Store
} from 'lucide-react';

// Interface struktur form input penampung teks ribuan
interface OmsetForm {
  lokasi: string;
  shift: string;
  tunai: string;
  qris: string;
  edc: string;
  grab: string;
  [key: string]: string; // Trik utama agar TypeScript mengizinkan akses dinamis via properti string
}

// Interface rekaman data bersih di dalam keranjang (cart)
interface OmsetRecord {
  lokasi: string;
  shift: string;
  tunai: number;
  qris: number;
  edc: number;
  grab: number;
  total: number;
}

export default function PenjualanSaaSMulti() {
  const [metaData, setMetaData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kasir: '',
  });

  const [currentOmset, setCurrentOmset] = useState<OmsetForm>({
    lokasi: 'Kedai Utama',
    shift: 'Shift 1 (Pagi)',
    tunai: '', qris: '', edc: '', grab: ''
  });

  const [daftarOmset, setDaftarOmset] = useState<OmsetRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const daftarKru = ["Chika", "Ibnu", "Novi", "Diska", "Nugye", "Ruslan", "A Novan"];
  const daftarShift = ["Shift 1 (Pagi)", "Shift 2 (Malam/Tutup)", "Full Day (Gabungan)"];

  const formatInputRupiah = (val: string) => {
    const angkaSaja = val.replace(/\D/g, '');
    return angkaSaja === '' ? '' : parseInt(angkaSaja, 10).toLocaleString('id-ID');
  };

  const handleMoneyChange = (field: string, value: string) => {
    setCurrentOmset({ ...currentOmset, [field]: formatInputRupiah(value) });
  };

  const tunaiAsli = parseInt((currentOmset.tunai || '').replace(/\./g, '')) || 0;
  const qrisAsli = parseInt((currentOmset.qris || '').replace(/\./g, '')) || 0;
  const edcAsli = parseInt((currentOmset.edc || '').replace(/\./g, '')) || 0;
  const grabAsli = parseInt((currentOmset.grab || '').replace(/\./g, '')) || 0;
  const subtotalCurrent = tunaiAsli + qrisAsli + edcAsli + grabAsli;

  const handleTambahOmset = (e: FormEvent) => {
    e.preventDefault();
    if (!metaData.kasir) return alert("Pilih Nama Kasir terlebih dahulu!");
    if (subtotalCurrent === 0) return alert("Masukkan nominal minimal di salah satu metode pembayaran!");

    const indexSama = daftarOmset.findIndex(
      item => item.lokasi === currentOmset.lokasi && item.shift === currentOmset.shift
    );

    if (indexSama !== -1) {
      const listBaru = [...daftarOmset];
      listBaru[indexSama].tunai += tunaiAsli;
      listBaru[indexSama].qris += qrisAsli;
      listBaru[indexSama].edc += edcAsli;
      listBaru[indexSama].grab += grabAsli;
      listBaru[indexSama].total += subtotalCurrent;
      setDaftarOmset(listBaru);
    } else {
      setDaftarOmset([...daftarOmset, {
        lokasi: currentOmset.lokasi,
        shift: currentOmset.shift,
        tunai: tunaiAsli, qris: qrisAsli, edc: edcAsli, grab: grabAsli,
        total: subtotalCurrent
      }]);
    }

    setCurrentOmset({ ...currentOmset, tunai: '', qris: '', edc: '', grab: '' });
  };

  const grandTotalOmset = daftarOmset.reduce((sum, item) => sum + item.total, 0);

  const handleSimpanFinal = () => {
    if (daftarOmset.length === 0) return alert("Daftar laporan omset masih kosong!");
    setIsSubmitting(true);
    setTimeout(() => {
      alert(`✅ Sukses Disimpan!\nTotal: Rp ${grandTotalOmset.toLocaleString('id-ID')}`);
      setIsSubmitting(false); setDaftarOmset([]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-24">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold tracking-wide flex items-center gap-2 text-zinc-800">
            <Receipt size={16} className="text-emerald-600" /> Pelaporan Omset Shift
          </h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-5">
        
        {/* BLOCK KASIR */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tanggal Laporan</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-3.5 text-zinc-400" />
              <input type="date" value={metaData.tanggal} onChange={(e) => setMetaData({...metaData, tanggal: e.target.value})} className="w-full pl-9 p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Kasir Bertugas</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-3.5 text-zinc-400" />
              <select value={metaData.kasir} onChange={(e) => setMetaData({...metaData, kasir: e.target.value})} className="w-full pl-9 p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold outline-none appearance-none" required>
                <option value="">Pilih...</option>
                {daftarKru.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* FORM INPUT NOMINAL MUTASI */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Outlet</label>
              <select value={currentOmset.lokasi} onChange={(e) => setCurrentOmset({...currentOmset, lokasi: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold outline-none">
                <option value="Kedai Utama">☕ Kedai Utama</option>
                <option value="Gerobak">🛒 Gerobak Bajay</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Shift Kerja</label>
              <select value={currentOmset.shift} onChange={(e) => setCurrentOmset({...currentOmset, shift: e.target.value})} className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold outline-none">
                {daftarShift.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { id: 'tunai', label: 'Uang Tunai (Laci)', icon: <Store size={14} />, color: 'focus-within:ring-emerald-500' },
              { id: 'qris', label: 'QRIS Digital', icon: <Landmark size={14} />, color: 'focus-within:ring-blue-500' },
              { id: 'edc', label: 'EDC / Transfer Bank', icon: <CreditCard size={14} />, color: 'focus-within:ring-purple-500' },
              { id: 'grab', label: 'GrabFood / Online', icon: <Layers size={14} />, color: 'focus-within:ring-teal-500' },
            ].map(ch => (
              <div key={ch.id} className={`flex bg-zinc-50 border border-zinc-300 rounded-xl overflow-hidden focus-within:ring-2 ${ch.color} transition-all`}>
                <div className="bg-zinc-100 px-3.5 flex items-center border-r text-zinc-400">{ch.icon}</div>
                <input type="text" inputMode="numeric" placeholder={`Nominal ${ch.label}...`} value={currentOmset[ch.id]} onChange={(e: ChangeEvent<HTMLInputElement>) => handleMoneyChange(ch.id, e.target.value)} className="w-full p-2.5 text-sm font-bold text-zinc-800 bg-transparent outline-none" />
              </div>
            ))}
          </div>

          <button onClick={handleTambahOmset} className="w-full py-3 bg-zinc-950 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1">
            <Plus size={14} strokeWidth={3} /> TAMBAH REKAP SHIFT
          </button>
        </div>

        {/* PREVIEW RANGKUMAN BATCH KASIR */}
        {daftarOmset.length > 0 && (
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-md text-white space-y-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-800 pb-2">Rangkuman Struk Ganda ({daftarOmset.length} Records)</span>
            
            <div className="space-y-2.5 max-h-44 overflow-y-auto">
              {daftarOmset.map((item, idx) => (
                <div key={idx} className="bg-zinc-800 p-3 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5">{item.lokasi}</h4>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium">{item.shift} • Cash:{item.tunai.toLocaleString()} QRIS:{item.qris.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-400">Rp {item.total.toLocaleString('id-ID')}</span>
                    <button onClick={() => setDaftarOmset(daftarOmset.filter((_, i) => i !== idx))} className="p-1.5 text-zinc-400 hover:text-rose-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-400">Total Revenue Terakumulasi</span>
              <span className="text-lg font-black text-emerald-400">Rp {grandTotalOmset.toLocaleString('id-ID')}</span>
            </div>

            <button onClick={handleSimpanFinal} disabled={isSubmitting} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all">
              <CheckCircle2 size={16} /> KUNCI & KIRIM SEMUA LAPORAN
            </button>
          </div>
        )}

      </div>
    </div>
  );
}