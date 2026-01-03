"use client";

import { Calendar, Clock, MapPin, Users, Plus, Pencil, CheckCircle, Trash2, X } from "lucide-react";
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

const BADGE_KATEGORI: Record<string, string> = {
  RAPAT: "bg-blue-100 text-blue-600",
  KERJA_BAKTI: "bg-green-100 text-green-600",
  ACARA: "bg-purple-100 text-purple-600",
};

const BADGE_STATUS: Record<string, string> = {
  AKAN_DATANG: "bg-blue-100 text-blue-600",
  BERLANGSUNG: "bg-yellow-100 text-yellow-600",
  SELESAI: "bg-gray-200 text-gray-600",
};

export default function AktivitasList() {
  // --- States ---
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"SEMUA" | "AKAN_DATANG" | "SELESAI">("SEMUA");
  
  const [openKelola, setOpenKelola] = useState<number | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // --- API Actions ---
  const getAktivitas = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan, silakan login ulang");

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

  useEffect(() => {
    getAktivitas();
  }, [getAktivitas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editId 
        ? `http://127.0.0.1:8000/api/aktivitas/${editId}/` 
        : "http://127.0.0.1:8000/api/aktivitas/";

      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");

      alert(editId ? "Aktivitas diperbarui!" : "Aktivitas ditambahkan!");
      closeModal();
      getAktivitas();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteAktivitas = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus aktivitas ini?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/api/aktivitas/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });

      if (!res.ok) throw new Error("Gagal menghapus");
      
      alert("Aktivitas berhasil dihapus ✅");
      setOpenKelola(null);
      getAktivitas();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const endAktivitas = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/api/aktivitas/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "SELESAI" }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status");

      alert("Aktivitas ditandai selesai ✅");
      setOpenKelola(null);
      getAktivitas();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Helpers ---
  const closeModal = () => {
    setOpenForm(false);
    setEditId(null);
    setFormData(INITIAL_FORM);
  };

  const handleEditOpen = () => {
    const item = aktivitas.find((a) => a.id === openKelola);
    if (item) {
      setFormData({
        judul: item.judul,
        kategori: item.kategori,
        status: item.status,
        deskripsi: item.deskripsi,
        tanggal: item.tanggal,
        jam: item.jam,
        tempat: item.tempat,
        penyelenggara: item.penyelenggara,
      });
      setEditId(item.id);
      setOpenForm(true);
      setOpenKelola(null);
    }
  };

  const filteredData = aktivitas.filter((item) => 
    filter === "SEMUA" ? true : item.status === filter
  );

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-sm text-black border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Aktivitas</h1>
          <p className="text-sm text-gray-500">Kelola jadwal dan agenda warga</p>
        </div>
        <button
          onClick={() => setOpenForm(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          <Plus size={18} /> Tambah Aktivitas
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b pb-4">
        {["SEMUA", "AKAN_DATANG", "SELESAI"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-1.5 text-sm rounded-full transition-all ${
              filter === f
                ? "bg-black text-white font-medium"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {f.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-10 text-center text-gray-400">Memuat data...</div>
      ) : error ? (
        <div className="py-10 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>
      ) : (
        <div className="grid gap-4">
          {filteredData.map((item) => (
            <div key={item.id} className="group relative rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{item.judul}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_KATEGORI[item.kategori]}`}>
                      {item.kategori.replace("_", " ")}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_STATUS[item.status]}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">{item.deskripsi}</p>

                  <div className="flex flex-wrap gap-y-2 gap-x-5 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5"><Calendar size={15} /> {item.tanggal}</div>
                    <div className="flex items-center gap-1.5"><Clock size={15} /> {item.jam}</div>
                    <div className="flex items-center gap-1.5"><MapPin size={15} /> {item.tempat}</div>
                    <div className="flex items-center gap-1.5"><Users size={15} /> {item.peserta || 0} peserta</div>
                  </div>
                  
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Penyelenggara: <span className="text-gray-600">{item.penyelenggara}</span>
                  </p>
                </div>

                <div className="flex items-start gap-2 self-end md:self-start">
                  {item.status !== "SELESAI" && (
                    <button
                      onClick={() => setOpenKelola(item.id)}
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors"
                    >
                      Kelola
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="py-20 text-center text-gray-400 border-2 border-dashed rounded-xl">
              Tidak ada aktivitas ditemukan.
            </div>
          )}
        </div>
      )}

      {/* Modal Form (Add/Edit) */}
      {openForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editId ? "Edit Aktivitas" : "Tambah Aktivitas Baru"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-black"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Judul Aktivitas</label>
                <input
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Contoh: Rapat RT Bulanan"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Kategori</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                >
                  <option value="RAPAT">Rapat</option>
                  <option value="KERJA_BAKTI">Kerja Bakti</option>
                  <option value="ACARA">Acara</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Penyelenggara</label>
                <input
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Contoh: Ketua RT"
                  value={formData.penyelenggara}
                  onChange={(e) => setFormData({ ...formData, penyelenggara: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Tanggal</label>
                <input
                  required
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Jam</label>
                <input
                  required
                  type="time"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={formData.jam}
                  onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Tempat</label>
                <input
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Lokasi kegiatan"
                  value={formData.tempat}
                  onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Deskripsi</label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Jelaskan detail aktivitas..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 rounded-lg border font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  {editId ? "Simpan Perubahan" : "Buat Aktivitas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola (Actions) */}
      {openKelola && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 space-y-3 shadow-xl animate-in slide-in-from-bottom-4 duration-200">
            <h2 className="text-center font-bold text-gray-800 mb-4">Kelola Aktivitas</h2>
            
            <button
              onClick={handleEditOpen}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Pencil size={16} className="text-blue-500" /> Edit Aktivitas
            </button>

            <button
              onClick={() => endAktivitas(openKelola)}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors border border-green-200"
            >
              <CheckCircle size={16} /> Tandai Selesai
            </button>

            <button
              onClick={() => deleteAktivitas(openKelola)}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors border border-red-200"
            >
              <Trash2 size={16} /> Hapus Aktivitas
            </button>

            <button
              onClick={() => setOpenKelola(null)}
              className="w-full pt-2 text-sm text-gray-400 hover:text-gray-600 font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}