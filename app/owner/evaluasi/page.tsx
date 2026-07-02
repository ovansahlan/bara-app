// ... (Kode import tetap sama seperti sebelumnya) ...

export default function FormEvaluasiOwner() {
    // ... (State awal panggil router & master kru) ...
    
    const [form, setForm] = useState({
      namaKru: '',
      tunjangan: '',
      overtime: '', // Tambahkan state overtime
      catatan: ''
    });
  
    // ... (useEffect fetch master kru & fungsi helper format rupiah tetap sama) ...
  
    const bersihAngka = (teks: string) => teks.replace(/\./g, '');
  
    const handleSimpanEvaluasi = async (e: FormEvent) => {
      e.preventDefault();
      if (!form.namaKru) return alert("Pilih nama kru!");
      
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/owner/evaluasi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            namaKru: form.namaKru,
            tunjangan: bersihAngka(form.tunjangan) || '0',
            overtime: bersihAngka(form.overtime) || '0', // Kirim data overtime
            catatan: form.catatan
          }),
        });
  
        if (response.ok) {
          alert(`✅ Evaluasi & Overtime ${form.namaKru} Berhasil Dikunci!`);
          setForm({ namaKru: '', tunjangan: '', overtime: '', catatan: '' });
          router.push('/');
        } else {
          alert("❌ Gagal menyimpan data.");
        }
      } catch (err) {
        alert("❌ Kendala jaringan.");
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      // ... (Bagian atas UI tetap sama) ...
      <form onSubmit={handleSimpanEvaluasi} className="space-y-5">
        {/* 1. PILIH KRU */}
        {/* ... (Tetap sama) ... */}
  
        {/* 2. INPUT INSENTIF OBJEKTIF */}
        {/* ... (Tetap sama) ... */}
  
        {/* 3. INPUT UANG OVERTIME (TAMBAHAN BARU) */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Upah Overtime (Lembur)</label>
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition-all">
            <div className="px-4 py-3.5 bg-slate-950 text-slate-500 border-r border-slate-700 text-xs font-bold min-w-[70px]">
              OT
            </div>
            <div className="pl-3 pr-1 text-slate-400 font-bold text-xs">Rp</div>
            <input 
              type="text" inputMode="numeric" placeholder="0"
              value={form.overtime}
              onChange={(e) => setForm({...form, overtime: formatRupiah(e.target.value)})}
              className="w-full py-3.5 pr-4 bg-transparent text-base font-black text-amber-400 outline-none text-right tracking-wide"
            />
          </div>
        </div>
  
        {/* 4. CATATAN FEEDBACK */}
        {/* ... (Tetap sama) ... */}
  
        {/* BUTTON SUBMIT */}
        {/* ... (Tetap sama) ... */}
      </form>
    );
  }