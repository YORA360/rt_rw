"use client";

import { 
  Calendar, Clock, MapPin, Users, Plus, Pencil, 
  CheckCircle, Trash2, Users2, HardHat, Notebook, X, Camera, Loader2  
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import api, {BASE_URL} from "@/lib/api"

// --- Types & Constants ---


interface Aktivitas {
  id: number;
  judul: string;
  kategori: "RAPAT" | "KERJA_BAKTI" | "ACARA";
  status: "AKAN_DATANG" | "BERLANGSUNG" | "SELESAI";
  deskripsi: string;
  tanggal: string;
  jam: string;
  tempat: string;
  penyelenggara: string;
  foto: string | null;
}
type AktivitasFormType = Omit<Partial<Aktivitas>, 'foto'> & { foto?: File | string | null };

const INITIAL_FORM: AktivitasFormType = {
  judul: "",
  kategori: "RAPAT",
  status: "AKAN_DATANG",
  deskripsi: "",
  tanggal: "",
  jam: "",
  tempat: "",
  penyelenggara: "",
  foto: null,
};

const THEME_KATEGORI = {
  RAPAT: { 
    badge: "bg-blue-100 text-blue-600", 
    border: "border-l-blue-500", 
    icon: <Notebook size={18} /> 
  },
  KERJA_BAKTI: { 
    badge: "bg-green-100 text-green-600", 
    border: "border-l-green-500", 
    icon: <HardHat size={18} /> 
  },
  ACARA: { 
    badge: "bg-purple-100 text-purple-600", 
    border: "border-l-purple-500", 
    icon: <Users2 size={18} /> 
  },
};



export default function AktivitasList() {
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"SEMUA" | "AKAN_DATANG" | "SELESAI">("SEMUA");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); 
  const [openKelola, setOpenKelola] = useState<number | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedDetail, setSelectedDetail] = useState<Aktivitas | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // --- API Helpers ---


  const prepareFormData = (inputData: any) => {
  const data = new FormData();
  Object.entries(inputData).forEach(([key, value]) => {
    if (key === 'foto') {
      // Hanya kirim ke server jika value adalah File baru
      if (value instanceof File) data.append('foto', value);
    } else if (value !== null && value !== undefined && value !== "") {
      data.append(key, value.toString());
    }
  });
  return data;
};

  const checkUserRole = useCallback(async () => {
    try {
      const res = await api.get("/auth/me/");
        setUserRole(res.data.role);
      } catch (err){
       console.error("Role check failed", err); 
      }
  }, []);

  const getAktivitas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/aktivitas/");
      setAktivitas(res.data.sort((a: any, b: any) => b.id - a.id));
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, []);

  // Inisialisasi Data
  useEffect(() => {
    checkUserRole();
    getAktivitas();
  }, [checkUserRole, getAktivitas]);

  // --- Logic Handlers ---
  const filteredData = useMemo(() => {
    return aktivitas.filter(item => filter === "SEMUA" ? true : item.status === filter);
  }, [aktivitas, filter]);

  const closeModal = () => {
  // Hapus preview URL dari memori browser
  if (previewUrl) URL.revokeObjectURL(previewUrl); 
  setOpenForm(false);
  setEditId(null);
  setPreviewUrl(null);
  setFormData(INITIAL_FORM);
};

  const handleEditOpen = (id: number) => {
  const item = aktivitas.find(a => a.id === id);
  if (item) {
    // Foto di set null agar tidak bentrok dengan file baru saat submit
    setFormData({ ...item, foto: null }); 
    setPreviewUrl(getImageUrl(item.foto, item.judul));
    setEditId(id);
    setOpenForm(true);
    setOpenKelola(null);
  }
};

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, foto: file }));
    }
  };

 const deleteAktivitas = async (id: number) => {
    if (!confirm("Hapus Aktivitas ini secara permanen?")) return;
    try {
      await api.delete(`/aktivitas/${id}/`);
      setAktivitas(prev => prev.filter(p => p.id !== id));
      setOpenKelola(null);
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const getImageUrl = (path: string | null, name: string) => {
    if (!path) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
  };

const updateStatus = async (id: number, status: string) => {
  try {
    const res = await api.patch(`/aktivitas/${id}/`, { status });

    if (res.status === 200 || res.status === 204) {
      getAktivitas();
      setOpenKelola(null);
    }
  } catch (err) {
    console.error(err);
    alert("Gagal update status");
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    const data = prepareFormData(formData);
    
    if (editId) {
      // Gunakan PATCH agar lebih aman untuk update sebagian
      await api.patch(`/aktivitas/${editId}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      await api.post("/aktivitas/", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    getAktivitas();
    closeModal();
    alert("Berhasil disimpan");
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.detail || "Terjadi kesalahan saat menyimpan");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-sm text-black border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Aktivitas</h1>
          <p className="text-sm text-gray-500">Jadwal dan agenda warga RT/RW</p>
        </div>
        {userRole !== "WARGA" && (
          <button
            onClick={() => setOpenForm(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-black hover:bg-gray-800 px-5 py-2.5 text-sm font-medium text-white transition-all"
          >
            <Plus size={18} /> Tambah Aktivitas
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        {["SEMUA", "AKAN_DATANG", "SELESAI"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-5 py-2 text-sm rounded-full transition-all ${
              filter === f
                ? "bg-black text-white font-medium"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {f === "SEMUA" ? "Semua" : f.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* List Card */}
      <div className="grid gap-4 overflow-x-auto overflow-y-auto   scrollbar-thin scrollbar-thumb-gray-300">
        {filteredData.length === 0 ? (
          <p className="text-center py-10 text-gray-400">Tidak ada aktivitas ditemukan.</p>
        ) : (
          filteredData.map((item) => {
            const theme = THEME_KATEGORI[item.kategori];
            return (
              <div 
                key={item.id} 
                className={`group bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-all border-l-4 ${theme.border}`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                        {theme.icon} {item.kategori.replace("_", " ")}
                      </span>
                      {item.status === "SELESAI" && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-gray-100 text-gray-500">
                          Selesai
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-lg font-bold text-gray-900">{item.judul}</h2>
                                            {/* Thumbnail Image / Icon */}
                    {item.foto && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <img 
                          src={getImageUrl(item.foto, item.judul)} 
                          alt="thumb" 
                          className="w-full h-full object-cover"
                          onError={(e) => { 
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${item.judul}`; 
                          }}
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-1">{item.deskripsi}</p>
                    {/* Tombol Lihat Selengkapnya */}
                    <button 
                      onClick={() => setSelectedDetail(item)}
                      className="text-blue-600 text-xs font-bold hover:underline mt-1 block"
                    >
                      Lihat Selengkapnya
                    </button>
                    <div className="flex flex-wrap gap-y-2 gap-x-5 text-[11px] font-medium text-gray-500">
                      <div className="flex items-center gap-1.5"><Calendar size={13}/> {item.tanggal}</div>
                      <div className="flex items-center gap-1.5"><Clock size={13}/> {item.jam}</div>
                      <div className="flex items-center gap-1.5"><MapPin size={13}/> {item.tempat}</div>
                      <div className="flex items-center gap-1.5"><Users size={13}/> {item.penyelenggara}</div>
                    </div>
                  </div>

                  {userRole !== "WARGA" && (
                    <button
                      onClick={() => setOpenKelola(item.id)}
                      className="px-3 py-1.5 text-xs font-bold text-gray-500 border rounded-lg hover:bg-gray-50"
                    >
                      Kelola
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Form */}
      {openForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-6">{editId ? "Edit Aktivitas" : "Buat Aktivitas Baru"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Uploader */}
              <div className="flex justify-center mb-6">
                <div className="relative group w-32 h-20">
                  <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group-hover:border-black transition-all">
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <Camera className="text-gray-300" size={24} />
                    )}
                  </div>
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <span className="text-white text-[10px] font-bold">UNGGAH FOTO</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Judul Aktivitas</label>
                <input required className="w-full rounded-xl border p-2.5 mt-1" value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Kategori</label>
                  <select className="w-full rounded-xl border p-2.5 mt-1" value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}>
                    <option value="RAPAT">Rapat</option>
                    <option value="KERJA_BAKTI">Kerja Bakti</option>
                    <option value="ACARA">Acara</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Penyelenggara</label>
                  <input required className="w-full rounded-xl border p-2.5 mt-1" value={formData.penyelenggara} onChange={(e) => setFormData({ ...formData, penyelenggara: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-400 uppercase">Tanggal</label><input type="date" required className="w-full rounded-xl border p-2.5 mt-1" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-gray-400 uppercase">Jam</label><input type="time" required className="w-full rounded-xl border p-2.5 mt-1" value={formData.jam} onChange={(e) => setFormData({ ...formData, jam: e.target.value })} /></div>
              </div>
              <div><label className="text-xs font-bold text-gray-400 uppercase">Tempat</label><input required className="w-full rounded-xl border p-2.5 mt-1" value={formData.tempat} onChange={(e) => setFormData({ ...formData, tempat: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-400 uppercase">Deskripsi</label><textarea required rows={3} className="w-full rounded-xl border p-2.5 mt-1" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} /></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-5 py-2 text-sm font-medium border rounded-xl">Batal</button>
                <button 
  type="submit" 
  disabled={isSubmitting} 
  className="px-5 py-2 text-sm font-bold bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-400 flex items-center gap-2"
>
  {isSubmitting && <Loader2 className="animate-spin" size={14}/>}
  {editId ? "Simpan Perubahan" : "Simpan"}
</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola */}
      {openKelola && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 space-y-2 shadow-2xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase text-center mb-2">Opsi Kelola</h4>
            <button onClick={() => handleEditOpen(openKelola)} className="flex items-center justify-center gap-2 w-full border rounded-xl py-3 text-sm font-bold hover:bg-gray-50"><Pencil size={16}/> Edit Data</button>
            <button onClick={() => updateStatus(openKelola, "SELESAI")} className="flex items-center justify-center gap-2 w-full bg-green-50 text-green-700 rounded-xl py-3 text-sm font-bold border border-green-100"><CheckCircle size={16}/> Tandai Selesai</button>
            <button onClick={() => deleteAktivitas(openKelola)} className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-700 rounded-xl py-3 text-sm font-bold border border-red-100"><Trash2 size={16}/> Hapus</button>
            <button onClick={() => setOpenKelola(null)} className="w-full text-gray-400 text-sm py-2">Batal</button>
          </div>
        </div>
      )}

      {selectedDetail && (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
    <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl relative max-h-[95vh] flex flex-col">
      
      {/* Tombol Tutup - Dibuat lebih kontras karena background gambar gelap */}
      <button 
        onClick={() => setSelectedDetail(null)}
        className="absolute top-4 right-4 p-2 bg-black/50 text-white backdrop-blur-md rounded-full hover:bg-black/70 transition-colors z-20 shadow-sm"
      >
        <X size={20} />
      </button>

      {/* Konten Scrollable */}
      <div className="overflow-y-auto">
        
        {/* Gambar Full - Tidak Terpotong */}
        {selectedDetail.foto && (
          <div className="w-full bg-gray-900 flex items-center justify-center group relative min-h-[300px]">
            <img 
              src={getImageUrl(selectedDetail.foto, selectedDetail.judul)} 
              alt="Detail" 
              className="w-full h-auto max-h-[550px] object-contain"
            />
            {/* Overlay hint saat hover */}
            <div className="absolute bottom-2 right-2 bg-black/40 text-[10px] text-white/70 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Tampilan Penuh
            </div>
          </div>
        )}

        <div className="p-8">
          {/* Badge & Tanggal */}
          <div className="flex items-center justify-between mb-6">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${THEME_KATEGORI[selectedDetail.kategori]?.badge}`}>
              {selectedDetail.kategori}
            </span>
            <span className="text-gray-400 text-xs flex items-center gap-1.5 font-medium">
              <Calendar size={14} className="text-gray-300" /> {selectedDetail.tanggal}
            </span>
          </div>

          {/* Judul */}
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            {selectedDetail.judul}
          </h2>

          {/* Isi Deskripsi */}
          <div className="border-t border-gray-100 pt-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
              {selectedDetail.deskripsi}
            </p>
          </div>

          
        </div>
      </div>

      {/* Footer Modal */}
      <div className="p-4 bg-white border-t flex justify-end">
        <button 
          onClick={() => setSelectedDetail(null)}
          className="px-8 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all active:scale-95"
        >
          Selesai Membaca
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}