"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Edit3, Trash2, Plus, Search, MapPin, Download, Loader2, X, Camera } from "lucide-react";
import api from "@/lib/api";

// URL Backend untuk akses file media
const BASE_URL = "http://127.0.0.1:8000";

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
  foto: string | null; // Tambahkan field foto
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

  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    jenis_kelamin: '',
    ttl: '',
    agama: '',
    alamat: '',
    rt: '',
    rw: '',
    pekerjaan: '',
    status_perkawinan: '',
    no_telepon: '',
    kewarganegaraan: 'Indonesia',
    foto: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, foto: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const openTambahForm = () => {
    const dataKK = keluarga?.penduduk?.find(p => p.status_keluarga === 'KK');
    setPreviewUrl(null);
    setFormData({
      ...formData,
      rt: dataKK?.rt || '',
      rw: dataKK?.rw || '',
      alamat: dataKK?.alamat || '',
      nik: '', nama: '', jenis_kelamin: '', ttl: '', agama: '',
      pekerjaan: '', status_perkawinan: '', no_telepon: '', 
      kewarganegaraan: 'Indonesia', foto: null
    });
    setOpenForm(true);
  };

  const getKeluargaSaya = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/keluarga/saya/");
      setKeluarga(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getKeluargaSaya();
  }, [getKeluargaSaya]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // WAJIB: Gunakan FormData untuk upload file
      const data = new FormData();
      
      // Masukkan semua data teks
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'foto' && value !== null) {
          data.append(key, value as string);
        }
      });

      // Masukkan file foto jika ada
      if (formData.foto) {
        data.append('foto', formData.foto);
      }

      await api.post('/penduduk/', data);
      
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
      
      {/* --- HEADER KK --- */}
      {keluarga && (
        <div className="mb-8 p-5 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><MapPin size={24} /></div>
            <div>
              <h2 className="text-xl font-bold">No. KK: {keluarga.no_kk}</h2>
              <p className="text-sm text-gray-500">{keluarga.alamat_kk}</p>
            </div>
          </div>
          <button onClick={openTambahForm} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
            <Plus size={18} /> Tambah Anggota
          </button>
        </div>
      )}

      {/* --- TABEL --- */}
      <div className="overflow-hidden border rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-purple-100 text-left text-sm font-bold text-gray-700">
              <th className="p-4">Foto</th>
              <th className="p-4">Nama Lengkap</th>
              <th className="p-4">NIK</th>
              <th className="p-4">Hubungan</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y">
            {filteredPenduduk.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <img 
                    src={p.foto ? `${BASE_URL}${p.foto}` : "https://ui-avatars.com/api/?name=" + p.nama} 
                    className="w-10 h-10 rounded-full object-cover border shadow-sm" 
                    alt="profile"
                  />
                </td>
                <td className="p-4 font-bold">{p.nama}</td>
                <td className="p-4 text-gray-500 font-mono">{p.nik}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.status_keluarga === 'KK' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {p.status_keluarga === 'KK' ? 'Kepala Keluarga' : 'Anggota'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => { setSelectedPenduduk(p); setDetailOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- FORM MODAL --- */}
      {openForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-6">Lengkapi Data Anggota</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* UPLOAD FOTO AREA */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group w-24 h-24">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group-hover:border-blue-400 transition-colors">
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-gray-300" size={32} />
                    )}
                  </div>
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <span className="text-white text-[10px] font-bold">PILIH FOTO</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Foto Profil</p>
              </div>

              {/* FIELD LAINNYA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Nama Lengkap</label>
                  <input required className="w-full rounded-xl border p-3 mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">NIK</label>
                  <input required maxLength={16} className="w-full rounded-xl border p-3 mt-1 outline-none focus:ring-2 focus:ring-blue-500" value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Jenis Kelamin</label>
                  <select className="w-full rounded-xl border p-3 mt-1" value={formData.jenis_kelamin} onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}>
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              {/* RT/RW & Alamat (Readonly sesuai instruksi sebelumnya) */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                 <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Domisili</span>
                    <span className="font-bold">RT {formData.rt} / RW {formData.rw}</span>
                 </div>
                 <p className="text-xs text-gray-600 leading-relaxed italic">"{formData.alamat}"</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setOpenForm(false)} className="flex-1 py-3 border rounded-2xl font-bold hover:bg-gray-50 transition">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DETAIL MODAL --- */}
      {detailOpen && selectedPenduduk && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative text-center">
            <button onClick={() => setDetailOpen(false)} className="absolute top-6 right-8 text-gray-300 hover:text-black transition-colors"><X size={24} /></button>
            
            <div className="flex flex-col items-center mb-8">
              <img 
                src={selectedPenduduk.foto ? `${BASE_URL}${selectedPenduduk.foto}` : "https://ui-avatars.com/api/?size=128&name=" + selectedPenduduk.nama} 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl mb-4" 
                alt="profile"
              />
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedPenduduk.nama}</h2>
              <p className="text-gray-400 font-medium text-sm tracking-widest uppercase mt-1">NIK: {selectedPenduduk.nik}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
               <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Pekerjaan</p>
                  <p className="text-sm font-bold">{selectedPenduduk.pekerjaan}</p>
               </div>
               <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Status</p>
                  <p className="text-sm font-bold">{selectedPenduduk.status_keluarga === 'KK' ? 'Kepala Keluarga' : 'Anggota'}</p>
               </div>
               <div className="col-span-2 p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Alamat Domisili</p>
                  <p className="text-xs font-medium leading-relaxed">{selectedPenduduk.alamat}</p>
               </div>
            </div>

            <button onClick={() => setDetailOpen(false)} className="w-full mt-8 py-4 bg-black text-white rounded-2xl font-bold shadow-xl">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeluargaTable;