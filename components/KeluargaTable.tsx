"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Camera, Edit3, Trash2, Plus, Search, MapPin, Download, Loader2, X } from "lucide-react";
import api from "@/lib/api";

// --- Constants ---
const BASE_URL = "http://127.0.0.1:8000"; // Tanpa slash di akhir agar konsisten

const INITIAL_FORM = {
  nik: '',
  nama: '',
  jenis_kelamin: '',
  ttl: '',
  agama: 'ISLAM',
  alamat: '',
  rt: '',
  rw: '',
  pekerjaan: '',
  status_perkawinan: 'BELUM_KAWIN',
  no_telepon: '',
  kewarganegaraan: 'Indonesia',
  foto: null as File | null,
};

// --- Interfaces ---
interface Penduduk {
  id: number;
  nik: string;
  nama: string;
  jenis_kelamin: string;
  ttl: string;
  agama: string;
  alamat: string;
  rt: string;
  rw: string;
  pekerjaan: string;
  status_perkawinan: string;
  kewarganegaraan: string;
  no_telepon: string;
  status_keluarga: string;
  foto: string | null;
}

interface Keluarga {
  id: number;
  no_kk: string;
  kepala_keluarga: string;
  alamat_kk: string;
  jumlah_anggota: number;
  penduduk: Penduduk[];
}

const KeluargaTable: React.FC = () => {
  const [keluarga, setKeluarga] = useState<Keluarga | null>(null);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPenduduk, setSelectedPenduduk] = useState<Penduduk | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);

  // --- Helper: Format Image URL ---
  const getImageUrl = (path: string | null, name: string) => {
    if (!path) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    if (path.startsWith('http')) return path;
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
  };

  // --- Actions ---
  const getKeluargaSaya = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/keluarga/saya/");
      setKeluarga(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getKeluargaSaya();
  }, [getKeluargaSaya]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Hapus URL lama dari memori browser jika ada
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      
      setFormData(prev => ({ ...prev, foto: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const openTambahForm = () => {
    const dataKK = keluarga?.penduduk?.find(p => p.status_keluarga === 'KK');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    setFormData({
      ...INITIAL_FORM,
      rt: dataKK?.rt || '',
      rw: dataKK?.rw || '',
      alamat: dataKK?.alamat || '',
    });
    setOpenForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'foto') {
          if (value instanceof File) data.append('foto', value);
        } else if (key === 'rt' || key === 'rw') {
          // Pastikan dikirim sebagai angka yang valid
          const intVal = parseInt(value as string);
          data.append(key, isNaN(intVal) ? "0" : intVal.toString());
        } else if (value !== null) {
          data.append(key, value as string);
        }
      });

      await api.post('/penduduk/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("Berhasil!");
      setOpenForm(false);
      getKeluargaSaya(); 
    } catch (err: any) {
      alert("Gagal: " + JSON.stringify(err.response?.data));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPenduduk = keluarga?.penduduk?.filter((p) =>
    [p.nik, p.nama].some(val => val.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow text-black">
      
      {/* Header Info KK */}
      {keluarga && (
        <div className="mb-8 p-5 bg-gray-50 border border-gray-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><MapPin size={24} /></div>
            <div>
              <h2 className="text-xl font-bold">No. KK: {keluarga.no_kk}</h2>
              <p className="text-sm text-gray-500">{keluarga.alamat_kk}</p>
            </div>
          </div>
          <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Kepala Keluarga</p>
            <p className="font-bold text-gray-800 text-lg">{keluarga.kepala_keluarga}</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-800">Daftar Anggota Keluarga ({keluarga?.jumlah_anggota || 0})</h3>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text" placeholder="Cari Nama atau NIK..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={openTambahForm}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-sm"
          >
            <Plus size={18} /> Tambah
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-purple-50 text-left text-sm text-gray-700 font-bold border-b">
              <th className="p-4 w-20 text-center">Foto</th>
              <th className="p-4">Nama Lengkap</th>
              <th className="p-4">NIK</th>
              <th className="p-4 text-center">L/P</th>
              <th className="p-4">Hubungan</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y">
            {loading ? (
              <tr><td colSpan={6} className="p-10 text-center text-gray-400">Memuat data...</td></tr>
            ) : filteredPenduduk.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex justify-center">
                    <img
                      src={getImageUrl(p.foto, p.nama)}
                      className="w-12 h-12 rounded-full object-cover border shadow-sm"
                      alt="profile"
                      // Tambahkan onError untuk menangani jika gambar gagal load
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${p.nama}&background=random`;
                      }}
                    />
                  </div>
                </td>
                <td className="p-4 font-semibold text-gray-900">{p.nama}</td>
                <td className="p-4 text-gray-500 font-mono tracking-tight">{p.nik}</td>
                <td className="p-4 text-center text-gray-600">{p.jenis_kelamin}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                    p.status_keluarga === 'KK' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {p.status_keluarga === 'KK' ? 'Kepala Keluarga' : 'Anggota'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => { setSelectedPenduduk(p); setDetailOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={18} /></button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Edit3 size={18} /></button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {openForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Data Anggota Keluarga</h3>
              <button onClick={() => setOpenForm(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Uploader Foto Profil */}
              <div className="flex flex-col items-center">
                <div className="relative group w-24 h-24">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group-hover:border-blue-400 transition-all">
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <Camera className="text-gray-300" size={32} />
                    )}
                  </div>
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <span className="text-white text-[10px] font-black uppercase tracking-tighter">Pilih Foto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Foto Profil (Optional)</p>
              </div>

              {/* Data Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                  <input required className="w-full rounded-xl border p-3 mt-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NIK (16 Digit)</label>
                  <input required maxLength={16} className="w-full rounded-xl border p-3 mt-1 font-mono" value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jenis Kelamin</label>
                  <select required className="w-full rounded-xl border p-3 mt-1 appearance-none bg-white" value={formData.jenis_kelamin} onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}>
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Agama</label>
                  <select className="w-full rounded-xl border p-3 mt-1 appearance-none bg-white" value={formData.agama} onChange={(e) => setFormData({...formData, agama: e.target.value})}>
                    <option value="ISLAM">Islam</option>
                    <option value="KRISTEN">Kristen</option>
                    <option value="KATOLIK">Katolik</option>
                    <option value="HINDU">Hindu</option>
                    <option value="BUDDHA">Buddha</option>
                    <option value="KONGHUCU">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tanggal Lahir</label>
                  <input type="date" required className="w-full rounded-xl border p-3 mt-1" value={formData.ttl} onChange={(e) => setFormData({...formData, ttl: e.target.value})} />
                </div>
              </div>

              {/* Locked Fields */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Domisili & Alamat Tetap</span>
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Otomatis Terisi</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border p-3 rounded-xl text-sm font-bold text-gray-600">RT {formData.rt || '-'} / RW {formData.rw || '-'}</div>
                    <div className="bg-white border p-3 rounded-xl text-sm font-bold text-gray-600 truncate">{formData.alamat || 'Alamat belum diatur'}</div>
                 </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setOpenForm(false)} className="flex-1 py-3 border rounded-2xl font-bold hover:bg-gray-50 transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:bg-gray-400">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Simpan Anggota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailOpen && selectedPenduduk && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => setDetailOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
            
            <div className="flex flex-col items-center mb-8">
              <img 
                src={getImageUrl(selectedPenduduk.foto, selectedPenduduk.nama)} 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl mb-4" 
                alt="profile"
              />
              <h2 className="text-2xl font-black text-gray-900 text-center leading-tight">{selectedPenduduk.nama}</h2>
              <div className="mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                 {selectedPenduduk.status_keluarga === 'KK' ? 'Kepala Keluarga' : 'Anggota Keluarga'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
               <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">NIK</p>
                  <p className="text-xs font-bold text-gray-800 truncate">{selectedPenduduk.nik}</p>
               </div>
               <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pekerjaan</p>
                  <p className="text-xs font-bold text-gray-800">{selectedPenduduk.pekerjaan}</p>
               </div>
               <div className="col-span-2 p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Alamat Domisili</p>
                  <p className="text-xs font-medium leading-relaxed text-gray-700 italic">"{selectedPenduduk.alamat}"</p>
               </div>
            </div>

            <button onClick={() => setDetailOpen(false)} className="w-full mt-8 py-4 bg-black text-white rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-all active:scale-95">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeluargaTable;