"use client";

import { Calendar, User, Plus, Pencil, Trash2, X, Megaphone, AlertCircle, Info } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

// --- Types & Constants ---
// 1. Pastikan Kategori konsisten dengan yang ada di Django/Database
type KategoriType = "INFORMASI" | "PENTING" | "DARURAT";

interface Pengumuman {
  id: number;
  judul: string;
  kategori: KategoriType; // Menggunakan type yang konsisten
  deskripsi: string;
  tanggal: string;
  penulis: number | null;
  nama_penulis?: string;
}

const INITIAL_FORM: { judul: string; kategori: KategoriType; deskripsi: string } = {
  judul: "",
  kategori: "INFORMASI", // Pastikan casing huruf sama persis
  deskripsi: "",
};

// 2. Gunakan Record dengan KategoriType agar key-nya terikat secara ketat
const BADGE_KATEGORI: Record<KategoriType, string> = {
  INFORMASI: "bg-blue-100 text-blue-600",
  PENTING: "bg-yellow-100 text-yellow-700",
  DARURAT: "bg-red-100 text-red-600",
};

export default function PengumumanList() {
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("Semua");
  
  const [openKelola, setOpenKelola] = useState<number | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // --- API Actions ---
  const fetchPengumuman = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/pengumuman/", {
        headers: { 
          Authorization: `Token ${token}`, 
          "Content-Type": "application/json" 
        },
      });

      if (!res.ok) throw new Error("Gagal mengambil data pengumuman");
      const data = await res.json();
      setPengumuman(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPengumuman();
  }, [fetchPengumuman]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    // Gunakan trailing slash '/' karena Django membutuhkannya
    const url = editId 
      ? `http://127.0.0.1:8000/api/pengumuman/${editId}/` 
      : "http://127.0.0.1:8000/api/pengumuman/";

    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        judul: formData.judul,
        kategori: formData.kategori, // Pastikan nilainya 'Informasi', 'Penting', atau 'Darurat'
        deskripsi: formData.deskripsi,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Detail Error Django:", errorData); // Ini akan memunculkan pesan error spesifik dari Django
      throw new Error("Gagal menyimpan data");
    }

    alert("Berhasil!");
    closeModal();
    fetchPengumuman();
  } catch (err: any) {
    alert(err.message);
  }
};
  const deletePengumuman = async (id: number) => {
    if (!confirm("Hapus pengumuman ini secara permanen?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/api/pengumuman/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });

      if (!res.ok) throw new Error("Gagal menghapus");
      
      alert("Pengumuman berhasil dihapus");
      setOpenKelola(null);
      fetchPengumuman();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const closeModal = () => {
    setOpenForm(false);
    setEditId(null);
    setFormData(INITIAL_FORM);
  };

  const handleEditOpen = () => {
    const item = pengumuman.find((p) => p.id === openKelola);
    if (item) {
      setFormData({
        judul: item.judul,
        kategori: item.kategori, // TypeScript sekarang mengenali ini sebagai KategoriType
        deskripsi: item.deskripsi,
      });
      setEditId(item.id);
      setOpenForm(true);
      setOpenKelola(null);
    }
  };

  const filteredData = pengumuman.filter((item) => 
    filter === "Semua" ? true : item.kategori === filter
  );

  const getIcon = (kategori: KategoriType) => {
    if (kategori === "DARURAT") return <AlertCircle className="text-red-500" />;
    if (kategori === "PENTING") return <Megaphone className="text-yellow-600" />;
    return <Info className="text-blue-500" />;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-sm text-black border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Pengumuman</h1>
          <p className="text-sm text-gray-500">Informasi terbaru untuk seluruh warga</p>
        </div>
        <button
          onClick={() => setOpenForm(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-black hover:bg-gray-800 px-5 py-2.5 text-sm font-medium text-white transition-all shadow-sm"
        >
          <Plus size={18} /> Buat Pengumuman
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        {["Semua", "Informasi", "Penting", "Darurat"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 text-sm rounded-full transition-all ${
              filter === f
                ? "bg-gray-100 text-black font-bold border border-gray-200"
                : "text-gray-500 hover:bg-gray-50 hover:text-black"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid gap-5">
        {filteredData.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all border-l-4" 
               style={{ borderLeftColor: item.kategori === 'DARURAT' ? '#ef4444' : item.kategori === 'PENTING' ? '#eab308' : '#3b82f6' }}>
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className={`p-3 rounded-full h-fit ${BADGE_KATEGORI[item.kategori].split(' ')[0]}`}>
                  {getIcon(item.kategori)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{item.judul}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${BADGE_KATEGORI[item.kategori]}`}>
                      {item.kategori}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 max-w-3xl">{item.deskripsi}</p>
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
        ))}
      </div>

      {/* Modal Form */}
      {openForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">{editId ? "Edit Pengumuman" : "Buat Baru"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Judul</label>
                <input
                  required
                  className="w-full rounded-xl border p-2.5 focus:ring-2 focus:ring-black"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Kategori</label>
                <select
                  className="w-full rounded-xl border p-2.5"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value as KategoriType })}
                >
                  <option value="INFORMASI">Informasi</option>
                  <option value="PENTING">Penting</option>
                  <option value="DARURAT">Darurat</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Isi</label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-xl border p-2.5"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-5 py-2 border rounded-xl">Batal</button>
                <button type="submit" className="px-5 py-2 bg-black text-white rounded-xl">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola (sama seperti sebelumnya, hanya ganti state openKelola) */}
      {openKelola && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 space-y-3">
            <button onClick={handleEditOpen} className="flex items-center justify-center gap-2 w-full border rounded-xl py-3 font-bold hover:bg-gray-50"><Pencil size={16}/> Edit</button>
            <button onClick={() => deletePengumuman(openKelola)} className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-700 rounded-xl py-3 font-bold border border-red-100"><Trash2 size={16}/> Hapus</button>
            <button onClick={() => setOpenKelola(null)} className="w-full text-gray-400 py-2">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}