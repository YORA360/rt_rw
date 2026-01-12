"use client";

import { 
  Calendar, Clock, MapPin, Users, Plus, Pencil, 
  CheckCircle, Trash2, Users2, HardHat, Notebook, Loader2 
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";

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
}

const INITIAL_FORM: Omit<Aktivitas, 'id'> = {
  judul: "",
  kategori: "RAPAT",
  status: "AKAN_DATANG",
  deskripsi: "",
  tanggal: "",
  jam: "",
  tempat: "",
  penyelenggara: "",
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

const API_BASE = "http://127.0.0.1:8000/api";

export default function AktivitasList() {
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"SEMUA" | "AKAN_DATANG" | "SELESAI">("SEMUA");
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

  const getAktivitas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/aktivitas/`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setAktivitas(data);
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
    setOpenForm(false);
    setEditId(null);
    setFormData(INITIAL_FORM);
  };

  const handleEditOpen = (id: number) => {
    const item = aktivitas.find(a => a.id === id);
    if (item) {
      setFormData({ ...item });
      setEditId(id);
      setOpenForm(true);
      setOpenKelola(null);
    }
  };

  const deleteAktivitas = async (id: number) => {
    if (!confirm("Hapus aktivitas ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/aktivitas/${id}/`, { 
        method: "DELETE", headers: getHeaders() 
      });
      if (res.ok) {
        setAktivitas(prev => prev.filter(a => a.id !== id));
        setOpenKelola(null);
      }
    } catch (err) { alert("Gagal menghapus"); }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/aktivitas/${id}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        getAktivitas();
        setOpenKelola(null);
      }
    } catch (err) { alert("Gagal update status"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `${API_BASE}/aktivitas/${editId}/` : `${API_BASE}/aktivitas/`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      getAktivitas();
      closeModal();
    } catch (err) { alert("Terjadi kesalahan saat menyimpan"); }
  };

  if (loading && aktivitas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="animate-spin mb-2" />
        <p>Memuat aktivitas...</p>
      </div>
    );
  }

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
      <div className="grid gap-4">
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
                    <p className="text-sm text-gray-600 line-clamp-2">{item.deskripsi}</p>
                    
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
                <button type="submit" className="px-5 py-2 text-sm font-medium bg-black text-white rounded-xl">Simpan</button>
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
    </div>
  );
}