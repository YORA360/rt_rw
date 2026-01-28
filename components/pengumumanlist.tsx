"use client";

import { 
  Calendar, User, Plus, Pencil, Trash2, X, 
  Megaphone, AlertCircle, Info, Loader2 
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";

// --- Types & Constants ---
type KategoriType = "INFORMASI" | "PENTING" | "DARURAT";

interface Pengumuman {
  id: number;
  judul: string;
  kategori: KategoriType;
  deskripsi: string;
  tanggal: string;
  nama_penulis?: string;
}

const INITIAL_FORM = {
  judul: "",
  kategori: "INFORMASI" as KategoriType,
  deskripsi: "",
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

const API_BASE = "http://127.0.0.1:8000/api";

export default function PengumumanList() {
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("Semua");
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [openKelola, setOpenKelola] = useState<number | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // --- API Helpers ---
  const getHeaders = () => ({
    "Authorization": `Token ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const checkUserRole = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me/`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
      }
    } catch (err) { console.error("Role check failed", err); }
  }, []);

  const getPengumuman = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pengumuman/`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setPengumuman(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    checkUserRole();
    getPengumuman();
  }, [checkUserRole, getPengumuman]);

  // --- Handlers ---
  const filteredData = useMemo(() => {
    return pengumuman.filter(item => 
      filter === "Semua" ? true : item.kategori === filter.toUpperCase()
    );
  }, [pengumuman, filter]);

  const closeModal = () => {
    setOpenForm(false);
    setEditId(null);
    setFormData(INITIAL_FORM);
  };

  const handleEditOpen = (id: number) => {
    const item = pengumuman.find(p => p.id === id);
    if (item) {
      setFormData({ 
        judul: item.judul, 
        kategori: item.kategori, 
        deskripsi: item.deskripsi 
      });
      setEditId(id);
      setOpenForm(true);
      setOpenKelola(null);
    }
  };

  const deletePengumuman = async (id: number) => {
    if (!confirm("Hapus pengumuman ini secara permanen?")) return;
    try {
      const res = await fetch(`${API_BASE}/pengumuman/${id}/`, { 
        method: "DELETE", headers: getHeaders() 
      });
      if (res.ok) {
        setPengumuman(prev => prev.filter(p => p.id !== id));
        setOpenKelola(null);
      }
    } catch (err) { alert("Gagal menghapus"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `${API_BASE}/pengumuman/${editId}/` : `${API_BASE}/pengumuman/`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      getPengumuman();
      closeModal();
    } catch (err) { alert("Terjadi kesalahan saat menyimpan"); }
  };

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
      <div className="grid gap-5 overflow-x-auto overflow-y-auto max-h-[350px]  scrollbar-thin scrollbar-thumb-gray-300">
        {filteredData.length === 0 ? (
          <p className="text-center py-10 text-gray-400 italic">Belum ada pengumuman.</p>
        ) : (
          filteredData.map((item) => {
            const theme = THEME_CONFIG[item.kategori] || THEME_CONFIG.INFORMASI;
            return (
              <div key={item.id} className={`group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all border-l-4 ${theme.border}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="p-3 rounded-full h-fit bg-gray-50">
                      {theme.icon}
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{item.judul}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                          {item.kategori}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">{item.deskripsi}</p>
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-6">{editId ? "Edit Pengumuman" : "Buat Pengumuman Baru"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Judul</label>
                <input
                  required
                  className="w-full rounded-xl border p-2.5 mt-1 focus:ring-2 focus:ring-black outline-none"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Kategori</label>
                <select
                  className="w-full rounded-xl border p-2.5 mt-1 outline-none"
                  value={formData.kategori}
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
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-5 py-2 text-sm font-medium border rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-5 py-2 text-sm font-medium bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">Simpan</button>
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
    </div>
  );
}