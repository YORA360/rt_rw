"use client";

import { 
  Calendar, User, Plus, Pencil, Trash2, X, 
  Megaphone, AlertCircle, Info, Loader2, Camera
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import api, { BASE_URL as API_URL } from "@/lib/api";

// --- Constants & Types ---
const BASE_URL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

type KategoriType = "INFORMASI" | "PENTING" | "DARURAT";

interface Pengumuman {
  id: number;
  judul: string;
  kategori: KategoriType;
  deskripsi: string;
  tanggal: string;
  nama_penulis?: string;
  foto: string | null;
}

// Tipe khusus untuk Form (agar field foto bisa menerima File)
type PengumumanFormType = Omit<Partial<Pengumuman>, 'foto'> & { foto?: File | string | null };

const INITIAL_FORM: PengumumanFormType = {
  judul: "",
  kategori: "INFORMASI",
  deskripsi: "",
  foto: null,
};

const THEME_CONFIG = {
  INFORMASI: { 
    badge: "bg-blue-100 text-blue-600", 
    border: "border-l-blue-500", 
    icon: <Info size={18} className="text-blue-500" /> 
  },
  PENTING: { 
    badge: "bg-yellow-100 text-yellow-700", 
    border: "border-l-yellow-500", 
    icon: <Megaphone size={18} className="text-yellow-600" /> 
  },
  DARURAT: { 
    badge: "bg-red-100 text-red-600", 
    border: "border-l-red-500", 
    icon: <AlertCircle size={18} className="text-red-500" /> 
  },
};

export default function PengumumanList() {
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("Semua");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Pengumuman | null>(null);
  const [openKelola, setOpenKelola] = useState<number | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PengumumanFormType>(INITIAL_FORM);

  // --- Helpers ---
  const getImageUrl = (path: string | null, name: string) => {
    if (!path) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
  };

  const prepareFormData = (inputData: any) => {
    const data = new FormData();
    Object.entries(inputData).forEach(([key, value]) => {
      if (key === 'foto') {
        if (value instanceof File) data.append('foto', value);
      } else if (value !== null && value !== undefined && value !== "") {
        data.append(key, value.toString());
      }
    });
    return data;
  };

  // --- API Handlers ---
  const checkUserRole = useCallback(async () => {
    try {
      const res = await api.get("/auth/me/");
      setUserRole(res.data.role); 
    } catch (err) { 
      console.error("Role check failed", err); 
    }
  }, []);

  const getPengumuman = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/pengumuman/");
      setPengumuman(res.data.sort((a: any, b: any) => b.id - a.id));
    } catch (err) {
      console.error("Fetch Error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserRole();
    getPengumuman();
  }, [checkUserRole, getPengumuman]);

  // --- Actions ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, foto: file }));
    }
  };

  const closeModal = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setOpenForm(false);
    setEditId(null);
    setPreviewUrl(null);
    setFormData(INITIAL_FORM);
  };

  const handleEditOpen = (id: number) => {
    const item = pengumuman.find(p => p.id === id);
    if (item) {
      setFormData({ ...item, foto: null });
      setPreviewUrl(getImageUrl(item.foto, item.judul));
      setEditId(id);
      setOpenForm(true);
      setOpenKelola(null);
    }
  };

  const deletePengumuman = async (id: number) => {
    if (!confirm("Hapus pengumuman ini secara permanen?")) return;
    try {
      await api.delete(`/pengumuman/${id}/`);
      setPengumuman(prev => prev.filter(p => p.id !== id));
      setOpenKelola(null);
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = prepareFormData(formData);
      if (editId) {
        await api.patch(`/pengumuman/${editId}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post("/pengumuman/", data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      getPengumuman();
      closeModal();
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = useMemo(() => {
    return pengumuman.filter(item => 
      filter === "Semua" ? true : item.kategori === filter.toUpperCase()
    );
  }, [pengumuman, filter]);

  if (loading && pengumuman.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="animate-spin mb-2" />
        <p>Memuat pengumuman...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-sm text-black border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Pengumuman</h1>
          <p className="text-sm text-gray-500">Informasi terbaru untuk seluruh warga</p>
        </div>
        {userRole !== "WARGA" && (
          <button
            onClick={() => setOpenForm(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-black hover:bg-gray-800 px-5 py-2.5 text-sm font-medium text-white transition-all shadow-sm"
          >
            <Plus size={18} /> Buat Pengumuman
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        {["Semua", "Informasi", "Penting", "Darurat"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 text-sm rounded-full transition-all ${
              filter === f
                ? "bg-black text-white font-medium"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid gap-5 overflow-y-auto  pr-2 scrollbar-thin scrollbar-thumb-gray-200">
        {filteredData.length === 0 ? (
          <p className="text-center py-10 text-gray-400 italic font-medium">Belum ada pengumuman.</p>
        ) : (
          filteredData.map((item) => {
            const theme = THEME_CONFIG[item.kategori] || THEME_CONFIG.INFORMASI;
            return (
              <div key={item.id} className={`group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all border-l-4 ${theme.border}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="space-y-2 text-left">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{item.judul}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                          {item.kategori}
                        </span>
                      </div>
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
   <p className="text-sm text-gray-600 max-w-3xl leading-relaxed line-clamp-1">{item.deskripsi}</p>

{/* Tombol Lihat Selengkapnya */}
<button 
  onClick={() => setSelectedDetail(item)}
  className="text-blue-600 text-xs font-bold hover:underline mt-1 block"
>
  Lihat Selengkapnya
</button>
                      <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium">
                         <span className="flex items-center gap-1"><Calendar size={12}/> {item.tanggal}</span>
                         <span className="flex items-center gap-1"><User size={12}/> {item.nama_penulis || 'Admin'}</span>
                      </div>
                    </div>
                  </div>
                  {userRole !== "WARGA" && (
                    <button
                      onClick={() => setOpenKelola(item.id)}
                      className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold mb-6 text-left">{editId ? "Edit Pengumuman" : "Buat Pengumuman Baru"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-left text-black">
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
                <label className="text-xs font-bold text-gray-400 uppercase">Judul</label>
                <input
                  required
                  className="w-full rounded-xl border p-2.5 mt-1 focus:ring-2 focus:ring-black outline-none"
                  value={formData.judul || ""}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Kategori</label>
                <select
                  className="w-full rounded-xl border p-2.5 mt-1 outline-none bg-white"
                  value={formData.kategori || "INFORMASI"}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value as KategoriType })}
                >
                  <option value="INFORMASI">Informasi</option>
                  <option value="PENTING">Penting</option>
                  <option value="DARURAT">Darurat</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Isi Pengumuman</label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-xl border p-2.5 mt-1 outline-none focus:ring-2 focus:ring-black"
                  value={formData.deskripsi || ""}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-5 py-2 text-sm font-medium border rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-bold bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-400 flex items-center gap-2">
                  {isSubmitting && <Loader2 className="animate-spin" size={14}/>}
                  {editId ? "Simpan Perubahan" : "Terbitkan"}
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
            <h4 className="text-xs font-bold text-gray-400 uppercase text-center mb-2 tracking-widest">Opsi Kelola</h4>
            <button onClick={() => handleEditOpen(openKelola)} className="flex items-center justify-center gap-2 w-full border rounded-xl py-3 text-sm font-bold hover:bg-gray-50 transition-colors"><Pencil size={16}/> Edit Data</button>
            <button onClick={() => deletePengumuman(openKelola)} className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-700 rounded-xl py-3 text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors"><Trash2 size={16}/> Hapus Permanen</button>
            <button onClick={() => setOpenKelola(null)} className="w-full text-gray-400 text-sm py-2">Tutup</button>
          </div>
        </div>
      )}

      {/* Modal Detail Pengumuman */}
{selectedDetail && (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity">
    <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
      
      {/* Tombol Tutup */}
      <button 
        onClick={() => setSelectedDetail(null)}
        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-gray-100 transition-colors z-10 shadow-sm"
      >
        <X size={20} className="text-gray-600" />
      </button>

      {/* Konten Scrollable */}
      <div className="overflow-y-auto">
        {/* Gambar Header (Jika ada) */}
        {selectedDetail.foto && (
          <div className="w-full h-64 bg-gray-100">
            <img 
              src={getImageUrl(selectedDetail.foto, selectedDetail.judul)} 
              alt="Detail" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          {/* Badge Kategori */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${THEME_CONFIG[selectedDetail.kategori]?.badge}`}>
              {selectedDetail.kategori}
            </span>
            <span className="text-gray-400 text-xs flex items-center gap-1">
              <Calendar size={14} /> {selectedDetail.tanggal}
            </span>
          </div>

          {/* Judul */}
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4 leading-tight">
            {selectedDetail.judul}
          </h2>

          {/* Info Penulis */}
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <User size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium leading-none">Diterbitkan oleh</p>
              <p className="text-sm font-bold text-gray-700">{selectedDetail.nama_penulis || 'Admin'}</p>
            </div>
          </div>

          {/* Isi Deskripsi Lengkap */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedDetail.deskripsi}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Modal */}
      <div className="p-4 bg-gray-50 border-t flex justify-end">
        <button 
          onClick={() => setSelectedDetail(null)}
          className="px-6 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
        >
          Tutup
        </button>
      </div>
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
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${THEME_CONFIG[selectedDetail.kategori]?.badge}`}>
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

          {/* Info Penulis (Diletakkan di bawah agar fokus ke isi) */}
          <div className="mt-10 flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                <User size={20} />
             </div>
             <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Penulis</p>
                <p className="text-sm font-bold text-gray-800">{selectedDetail.nama_penulis || 'Admin Sistem'}</p>
             </div>
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