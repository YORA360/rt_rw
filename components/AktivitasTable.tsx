"use client";

import { Calendar, Clock, MapPin, Users, Plus, Pencil, CheckCircle, Trash2, X, Users2, HardHat, Notebook } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

// --- Types & Constants ---
interface Aktivitas {
  id: number;
  judul: string;
  kategori: string;
  status: "AKAN_DATANG" | "BERLANGSUNG" | "SELESAI";
  deskripsi: string;
  tanggal: string;
  jam: string;
  tempat: string;
  penyelenggara: string;
  peserta?: number;
}

const INITIAL_FORM = {
  judul: "",
  kategori: "RAPAT",
  status: "AKAN_DATANG",
  deskripsi: "",
  tanggal: "",
  jam: "",
  tempat: "",
  penyelenggara: "",
};

// Map warna untuk badge dan border kiri (Disamakan dengan logika Pengumuman)
const THEME_KATEGORI: Record<string, { badge: string; border: string; iconBg: string; iconColor: string }> = {
  RAPAT: { 
    badge: "bg-blue-100 text-blue-600", 
    border: "#3b82f6", 
    iconBg: "bg-blue-50", 
    iconColor: "text-blue-500" 
  },
  KERJA_BAKTI: { 
    badge: "bg-green-100 text-green-600", 
    border: "#22c55e", 
    iconBg: "bg-green-50", 
    iconColor: "text-green-500" 
  },
  ACARA: { 
    badge: "bg-purple-100 text-purple-600", 
    border: "#a855f7", 
    iconBg: "bg-purple-50", 
    iconColor: "text-purple-500" 
  },
};

export default function AktivitasList() {
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"SEMUA" | "AKAN_DATANG" | "SELESAI">("SEMUA");
  
  const [openKelola, setOpenKelola] = useState<number | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const getAktivitas = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/aktivitas/", {
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Gagal mengambil data aktivitas");
      const data = await res.json();
      setAktivitas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { getAktivitas(); }, [getAktivitas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editId ? `http://127.0.0.1:8000/api/aktivitas/${editId}/` : "http://127.0.0.1:8000/api/aktivitas/";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Gagal menyimpan data");
      alert("Berhasil!");
      closeModal();
      getAktivitas();
    } catch (err: any) { alert(err.message); }
  };

  const deleteAktivitas = async (id: number) => {
    if (!confirm("Hapus aktivitas ini?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://127.0.0.1:8000/api/aktivitas/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      setOpenKelola(null);
      getAktivitas();
    } catch (err: any) { alert(err.message); }
  };

  const endAktivitas = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://127.0.0.1:8000/api/aktivitas/${id}/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SELESAI" }),
      });
      setOpenKelola(null);
      getAktivitas();
    } catch (err: any) { alert(err.message); }
  };

  const closeModal = () => {
    setOpenForm(false);
    setEditId(null);
    setFormData(INITIAL_FORM);
  };

  const handleEditOpen = () => {
    const item = aktivitas.find((a) => a.id === openKelola);
    if (item) {
      setFormData({ ...item });
      setEditId(item.id);
      setOpenForm(true);
      setOpenKelola(null);
    }
  };

  const getIcon = (kategori: string) => {
    if (kategori === "RAPAT") return <Notebook size={20} />;
    if (kategori === "KERJA_BAKTI") return <HardHat size={20} />;
    return <Users2 size={20} />;
  };

  const filteredData = aktivitas.filter((item) => 
    filter === "SEMUA" ? true : item.status === filter
  );

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-sm text-black border border-gray-100">
      {/* Header - Samakan dengan Pengumuman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Aktivitas</h1>
          <p className="text-sm text-gray-500">Kelola jadwal dan agenda warga</p>
        </div>
        <button
          onClick={() => setOpenForm(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-black hover:bg-gray-800 px-5 py-2.5 text-sm font-medium text-white transition-all shadow-sm"
        >
          <Plus size={18} /> Tambah Aktivitas
        </button>
      </div>

      {/* Filter Tabs - Samakan dengan Pengumuman */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        {["SEMUA", "AKAN_DATANG", "SELESAI"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-5 py-2 text-sm rounded-full transition-all ${
              filter === f
                ? "bg-gray-100 text-black font-bold border border-gray-200"
                : "text-gray-500 hover:bg-gray-50 hover:text-black"
            }`}
          >
            {f === "SEMUA" ? "Semua" : f.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* List - Samakan Gaya Card dengan Pengumuman */}
      <div className="grid gap-5">
        {filteredData.map((item) => {
          const theme = THEME_KATEGORI[item.kategori] || THEME_KATEGORI.RAPAT;
          return (
            <div 
              key={item.id} 
              className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all border-l-4" 
              style={{ borderLeftColor: theme.border }}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  {/* Icon Circle */}
                 
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">{item.judul}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                        {item.kategori}
                      </span>
                      {item.status === "SELESAI" && (
                         <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                           Selesai
                         </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 max-w-3xl">{item.deskripsi}</p>
                    
                    {/* Metadata Row */}
                    <div className="flex flex-wrap gap-y-2 gap-x-5 pt-1 text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> {item.tanggal}</div>
                      <div className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> {item.jam}</div>
                      <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> {item.tempat}</div>
                      <div className="flex items-center gap-1.5"><Users size={14} className="text-gray-400"/> {item.penyelenggara}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setOpenKelola(item.id)}
                  className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Kelola
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Form */}
      {openForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">{editId ? "Edit Aktivitas" : "Tambah Aktivitas"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Judul</label>
                <input required className="w-full rounded-xl border p-2.5" value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Kategori</label>
                  <select className="w-full rounded-xl border p-2.5" value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}>
                    <option value="RAPAT">Rapat</option>
                    <option value="KERJA_BAKTI">Kerja Bakti</option>
                    <option value="ACARA">Acara</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Penyelenggara</label>
                  <input required className="w-full rounded-xl border p-2.5" value={formData.penyelenggara} onChange={(e) => setFormData({ ...formData, penyelenggara: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Tanggal</label><input type="date" required className="w-full rounded-xl border p-2.5" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Jam</label><input type="time" required className="w-full rounded-xl border p-2.5" value={formData.jam} onChange={(e) => setFormData({ ...formData, jam: e.target.value })} /></div>
              </div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">Tempat</label><input required className="w-full rounded-xl border p-2.5" value={formData.tempat} onChange={(e) => setFormData({ ...formData, tempat: e.target.value })} /></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">Deskripsi</label><textarea required rows={3} className="w-full rounded-xl border p-2.5" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} /></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-5 py-2 border rounded-xl">Batal</button>
                <button type="submit" className="px-5 py-2 bg-black text-white rounded-xl">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola */}
      {openKelola && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 space-y-3">
            <button onClick={handleEditOpen} className="flex items-center justify-center gap-2 w-full border rounded-xl py-3 font-bold hover:bg-gray-50"><Pencil size={16}/> Edit</button>
            <button onClick={() => endAktivitas(openKelola)} className="flex items-center justify-center gap-2 w-full bg-green-50 text-green-700 rounded-xl py-3 font-bold border border-green-100"><CheckCircle size={16}/> Selesai</button>
            <button onClick={() => deleteAktivitas(openKelola)} className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-700 rounded-xl py-3 font-bold border border-red-100"><Trash2 size={16}/> Hapus</button>
            <button onClick={() => setOpenKelola(null)} className="w-full text-gray-400 py-2">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}