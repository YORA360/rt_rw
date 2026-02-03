"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Edit3, Trash2, Download, X, Loader2 } from "lucide-react";
import api from "@/lib/api";


const BASE_URL = "http://127.0.0.1:8000"; 


interface Penduduk {
  id: number;
  nik: string;
  nama: string;
  jenis_kelamin: "L" | "P";
  alamat: string;
  pekerjaan: string;
  status_keluarga: "KK" | "ANGGOTA";
  ttl?: string;
  agama:  "ISLAM" | "KRISTEN"| "KATOLIK" | "HINDU" | "BUDDHA" | "KONGHUCU" ;
  status_perkawinan: "KAWIN" | "BELUM_KAWIN" | "CERAI";
  status_tempat_tinggal: "PT" | "KT" | "KS" | "TD" ;
  kewarganegaraan: string;
  no_telepon?: string;
  foto: string;
  rt?: string;
  rw?: string;
}

const PendudukTable: React.FC = () => {
  const [penduduk, setPenduduk] = useState<Penduduk[]>([]);
  const [unverifiedPenduduk, setUnverifiedPenduduk] = useState<Penduduk[]>([]);
  const [search, setSearch] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);

  // UI States
  const [detailOpen, setDetailOpen] = useState(false);
  const [unverifiedOpen, setUnverifiedOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPenduduk, setSelectedPenduduk] = useState<Penduduk | null>(null);

  // Form State untuk Edit
  const [formData, setFormData] = useState<Partial<Penduduk>>({});

   const getImageUrl = (path: string | null, name: string) => {
    if (!path) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    if (path.startsWith('http')) return path;
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
  };

  const genderMap = { L: "Laki-Laki", P: "Perempuan"};
  const statusperkawinanMap = {
      BELUM_KAWIN: "Belum Kawin",
      KAWIN: "Kawin",
      CERAI: "Cerai",
  };
  const statusKeluargaMap = {KK: "Kepala Keluarga", ANGGOTA: "Anggota Keluarga"};
  const agamaMap = {
    ISLAM: "Islam",
    KRISTEN: "Kristen",
    KATOLIK: "Katolik",
    HINDU: "Hindu",
    BUDDHA:"Buddha",
    KONGHUCU: "Konghucu"
  }
  const statusTempatTinggalMap = {
    PT: "Penghuni Tetap",
    KT: "Kontrak",
    KS: "Kost",
    TD: "Tidak Ditinggali"
  }
  const getPenduduk = useCallback(async () => {
    try {
      const res = await api.get("/penduduk/");
      setPenduduk(res.data);
    } catch (err) {
      console.error("Error fetching penduduk:", err);
    }
  }, []);

  const getUnverifiedPenduduk = useCallback(async () => {
    try {
      const res = await api.get("/auth/pending-user/");
      setUnverifiedPenduduk(res.data);
    } catch (err) {
      console.error("Error fetching pending users:", err);
    }
  }, []);

  const checkUserRole = useCallback(async () => {
    try {
      const res = await api.get("/auth/me/");
      setUserRole(res.data.role);
    } catch (err) {
      console.error("Gagal mengambil role:", err);
    }
  }, []);

  useEffect(() => {
    checkUserRole();
    getPenduduk();
    getUnverifiedPenduduk();
  }, [checkUserRole, getPenduduk, getUnverifiedPenduduk]);

  // Fungsi untuk membuka modal edit dan mengisi data awal
  const handleOpenEdit = (p: Penduduk) => {
    setSelectedPenduduk(p);
    setFormData(p); // Isi form dengan data yang sudah ada
    setEditOpen(true);
    setDetailOpen(false); // Tutup detail jika sedang terbuka
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPenduduk) return;

    setIsSubmitting(true);
    try {
      await api.patch(`/penduduk/${selectedPenduduk.id}/`, formData);
      alert("Data penduduk berhasil diperbarui! ✅");
      setEditOpen(false);
      getPenduduk(); // Refresh data tabel
    } catch (error: any) {
      alert("Gagal memperbarui data: " + JSON.stringify(error.response?.data));
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyUser = async (id: number) => {
    try {
      await api.post(`/auth/verify-user/${id}/`, { action: "APPROVED" });
      alert("Penduduk berhasil diverifikasi ✅");
      getPenduduk();
      getUnverifiedPenduduk();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal verifikasi");
    }
  };

  const filteredPenduduk = penduduk.filter((p) =>
    [p.nik, p.nama, p.alamat].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow text-black">
      {/* Header & Search (Sama seperti sebelumnya) */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Daftar Penduduk</h2>
        {userRole !== "WARGA" && (
          <button
            onClick={() => setUnverifiedOpen(true)}
            className="px-3 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Belum Diverifikasi ({unverifiedPenduduk.length})
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Cari berdasarkan nama, NIK, atau alamat..."
          className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Download size={18} /> Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto border border-gray-300 rounded-lg ">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-blue-400 text-left text-black font-semibold">
              <th className="p-3">NIK</th>
              <th className="p-3">Nama Lengkap</th>
              <th className="p-3">L/P</th>
              <th className="p-3">Alamat</th>
              <th className="p-3">Pekerjaan</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPenduduk.map((p) => (
              <tr key={p.id} className="border-b border-gray-300 hover:bg-gray-100 transition-colors">
                <td className="p-3">{p.nik}</td>
                <td className="p-3 font-medium">{p.nama}</td>
                <td className="p-3 text-center">{p.jenis_kelamin}</td>
                <td className="p-3">{p.alamat}</td>
                <td className="p-3">{p.pekerjaan}</td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => { setSelectedPenduduk(p); setDetailOpen(true); }} className="text-blue-600 hover:text-blue-800"><Eye size={18} /></button>
                    <button onClick={() => handleOpenEdit(p)} className="text-green-600 hover:text-green-800"><Edit3 size={18} /></button>
                    <button className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL: EDIT DATA (Style Baru) --- */}
      {editOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto text-black">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Data Penduduk</h3>
              <button onClick={() => setEditOpen(false)}><X className="text-gray-400" /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">NIK (16 Digit)</label>
                  <input required readOnly className="w-full rounded-xl border p-2.5 mt-1 bg-gray-50" value={formData.nik || ""} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                  <input required className="w-full rounded-xl border p-2.5 mt-1" value={formData.nama || ""} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jenis Kelamin</label>
                  <select className="w-full rounded-xl border p-2.5 mt-1" value={formData.jenis_kelamin} onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as any })}>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Agama</label>
                  <select className="w-full rounded-xl border p-2.5 mt-1" value={formData.agama || ""} onChange={(e) => setFormData({ ...formData, agama: e.target.value as any})} >
                    <option value="">Pilih Agama</option>
                    <option value="ISLAM">Islam</option>
                    <option value="KRISTEN">Kristen</option>
                    <option value="KATOLIK">Katolik</option>
                    <option value="HINDU">Hindu</option>
                    <option value="BUDDHA">Buddha</option>
                    <option value="KHONGHUCU">Khonghucu</option> 
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pekerjaan</label>
                  <input className="w-full rounded-xl border p-2.5 mt-1" value={formData.pekerjaan || ""} onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status Perkawinan</label>
                  <select className="w-full rounded-xl border p-2.5 mt-1" value={formData.status_perkawinan || ""} onChange={(e) => setFormData({ ...formData, status_perkawinan: e.target.value as any})} >
                    <option value="">Pilih Status</option>
                    <option value="BELUM_KAWIN">Belum Kawin</option>
                    <option value="KAWIN">Kawin</option>
                    <option value="CERAI">Cerai</option>
                  </select>
            
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Alamat</label>
                  <textarea rows={2} className="w-full rounded-xl border p-2.5 mt-1" value={formData.alamat || ""} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status Tempat Tinggal</label>
                  <select className="w-full rounded-xl border p-2.5 mt-1" value={formData.status_tempat_tinggal || ""} onChange={(e) => setFormData({ ...formData, status_tempat_tinggal: e.target.value as any})} >
                    <option value="">Pilih Status</option>
                    <option value="PT">Penghuni Tetap</option>
                    <option value="KT">Kontrak</option>
                    <option value="KS">Kost</option>
                    <option value="TD">Tidak Ditinggali</option>
                  </select>
                  </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={() => setEditOpen(false)} className="px-6 py-2 text-sm font-bold border rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-bold bg-black text-white rounded-xl hover:bg-gray-800 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: DETAIL --- */}
      {detailOpen && selectedPenduduk && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <button onClick={() => setDetailOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                    
                    <div className="flex  items-center gap-4 mb-6">
                      <div>
                      <img 
                        src={getImageUrl(selectedPenduduk.foto, selectedPenduduk.nama)} 
                        className="w-22 h-22 rounded-full object-cover  shadow-2xl " 
                        alt="profile"
                      />
                      </div>
                      <div className="flex flex-col gap-1">
                      <h3 className=" ">{selectedPenduduk.nama}</h3>
                      <h3 className="text-sm text-gray-700">{selectedPenduduk.nik}</h3>
                      <div
                        className={`px-2 py-1 text-[10px] font-black rounded-lg w-fit
                          ${
                            selectedPenduduk.status_keluarga === "KK"
                              ? "bg-black text-white"
                              : "bg-gray-300 text-gray-700"
                          }
                        `}
                      >
                        {selectedPenduduk.status_keluarga}
                      </div>
                      </div>
                    </div>
        
                    
                       
                       <div className="grid grid-cols-2 gap-y-5 text-sm">
                      {[
                        { label: "Jenis Kelamin", value: genderMap[selectedPenduduk.jenis_kelamin]},
                        { label: "Agama", value: agamaMap[selectedPenduduk.agama]},
                        { label: "Status Kawin",   value:statusperkawinanMap[selectedPenduduk.status_perkawinan]},
                        { label: "Pekerjaan", value: selectedPenduduk.pekerjaan },
                        { label: "Kewarganegaraan", value: selectedPenduduk.kewarganegaraan },
                        { label: "Status Keluarga", value: statusKeluargaMap[selectedPenduduk.status_keluarga]},
                        { label: "Status Tempat Tinggal", value: statusTempatTinggalMap[selectedPenduduk.status_tempat_tinggal]}
        
                      ].map((item, idx) => (
                        <div key={idx}>
                          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">{item.label}</p>
                          <p className="font-medium">{item.value || "-"}</p>
                        </div>
                      ))}
                      <div className="col-span-2">
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Alamat</p>
                        <p className="font-medium">{selectedPenduduk.alamat}</p>
                      </div>
                    </div>
                    
        
                    <div className="flex justify-end gap-3 pt-3  ">
              <button onClick={() => setDetailOpen(false)} className="px-3 py-2 border rounded-lg text-sm font-medium">Tutup</button>
              <button onClick={() => handleOpenEdit(selectedPenduduk)} className="px-3 bg-black text-white rounded-lg text-sm font-medium flex items-center gap-2">
                <Edit3 size={16} /> Edit Data
              </button>
            </div>
                  </div>
                </div>
      )}

      {/* --- MODAL: UNVERIFIED (Sama seperti sebelumnya) --- */}
      {unverifiedOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-black">
          <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Penduduk Belum Diverifikasi</h3>
              <button onClick={() => setUnverifiedOpen(false)}><X /></button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {unverifiedPenduduk.map((p) => (
                <div key={p.id} className="flex justify-between items-center border rounded-lg p-3 bg-gray-50">
                  <div>
                    <p className="font-semibold text-sm">{p.nama}</p>
                    <p className="text-xs text-gray-500">{p.nik}</p>
                  </div>
                  <button onClick={() => verifyUser(p.id)} className="px-4 py-1.5 text-xs bg-black text-white rounded-md">Verifikasi</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendudukTable;