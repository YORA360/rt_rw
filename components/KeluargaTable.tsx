"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Camera, Edit3, Trash2, Plus, Search, MapPin, Download, Loader2, X } from "lucide-react";
import api, { BASE_URL as API_URL } from "@/lib/api";

// Menghapus slash di akhir jika ada agar penggabungan URL konsisten
const BASE_URL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

interface Penduduk {
  id: number;
  nik: string;
  nama: string;
  jenis_kelamin: "L" | "P";
  ttl: string;
  agama: string;
  alamat: string;
  rt: string;
  rw: string;
  pekerjaan: string;
  status_perkawinan: string;
  status_tempat_tinggal: string;
  kewarganegaraan: string;
  no_telepon: string;
  status_keluarga: "KK" | "ANGGOTA";
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
  const [previewKtp, setPreviewKtp] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [detailOpen, setDetailOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPenduduk, setSelectedPenduduk] = useState<Penduduk | null>(null);

  type PendudukFormType = Omit<Partial<Penduduk>, 'foto'> & { foto?: File | string | null };

const [formData, setFormData] = useState<PendudukFormType>({});

  // Maps untuk tampilan detail
  const genderMap = { L: "Laki-Laki", P: "Perempuan" };
  const statusperkawinanMap: any = { BELUM_KAWIN: "Belum Kawin", KAWIN: "Kawin", CERAI: "Cerai" };
  const statusKeluargaMap: any = { KK: "Kepala Keluarga", ANGGOTA: "Anggota Keluarga" };
  const agamaMap: any = { ISLAM: "Islam", KRISTEN: "Kristen", KATOLIK: "Katolik", HINDU: "Hindu", BUDDHA: "Buddha", KONGHUCU: "Konghucu" };
  const statusTempatTinggalMap: any = { PT: "Penghuni Tetap", KT: "Kontrak", KS: "Kost", TD: "Tidak Ditinggali" };

  // --- Helpers ---
  const getImageUrl = (path: string | null, name: string) => {
    if (!path) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const prepareFormData = (inputData: any) => {
    const data = new FormData();
    Object.entries(inputData).forEach(([key, value]) => {
      if (key === 'foto') {
        if (value instanceof File) data.append('foto', value);
      } else if (key === 'rt' || key === 'rw') {
        const intVal = parseInt(value as string);
        data.append(key, isNaN(intVal) ? "0" : intVal.toString());
      } else if (value !== null && value !== undefined && value !== "") {
        data.append(key, value.toString());
      }
    });
    return data;
  };

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

  // --- Event Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, foto: file }));
    }
  };

  const openTambahForm = () => {
    const dataKK = keluarga?.penduduk?.find(p => p.status_keluarga === 'KK');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFormData({
      nik: '', nama: '', agama: 'ISLAM', status_perkawinan: 'BELUM_KAWIN',
      rt: dataKK?.rt || '', rw: dataKK?.rw || '', alamat: dataKK?.alamat || '',
      status_tempat_tinggal: 'PT', kewarganegaraan: 'Indonesia', foto: null
    });
    setOpenForm(true);
  };

  const handleOpenEdit = (p: Penduduk) => {
    setSelectedPenduduk(p);
    setFormData({ ...p, foto: null }); 
    setPreviewUrl(getImageUrl(p.foto, p.nama));
    setEditOpen(true);
    setDetailOpen(false);
  };

  const processSubmit = async (e: React.FormEvent, isEdit: boolean) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = prepareFormData(formData);
      const url = isEdit ? `/penduduk/${selectedPenduduk?.id}/` : '/penduduk/';
      const method = isEdit ? 'patch' : 'post';

      await api[method](url, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(isEdit ? "Berhasil diperbarui! ✅" : "Berhasil ditambah! ✅");
      setOpenForm(false);
      setEditOpen(false);
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
              <h2 className="text-xl font-bold text-gray-900">No. KK: {keluarga.no_kk}</h2>
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
          <button onClick={openTambahForm} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-sm">
            <Plus size={18} /> Tambah
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-purple-50 text-left text-sm text-gray-700 font-bold border-b">
              <th className="p-4 ">Foto</th>
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
                  <img
                    src={getImageUrl(p.foto, p.nama)}
                    className="w-12 h-12 rounded-full object-cover border shadow-sm"
                    alt="profile"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${p.nama}&background=random`; }}
                  />
                </td>
                <td className="p-4 font-semibold text-gray-900">{p.nama}</td>
                <td className="p-4 text-gray-500 font-mono tracking-tight">{p.nik}</td>
                <td className="p-4 text-center text-gray-600">{p.jenis_kelamin}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${p.status_keluarga === 'KK' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {p.status_keluarga === 'KK' ? 'Kepala Keluarga' : 'Anggota'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => { setSelectedPenduduk(p); setDetailOpen(true); }} className="text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={18} /></button>
                    <button onClick={() => handleOpenEdit(p)} className="text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Edit3 size={18} /></button>
                    <button className="text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal (Create & Edit) */}
      {(openForm || editOpen) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-black">{editOpen ? 'Edit Data Penduduk' : 'Tambah Anggota Keluarga Baru'}</h3>
              <button onClick={() => { setOpenForm(false); setEditOpen(false); }}><X className="text-gray-400" /></button>
            </div>
            
            <form onSubmit={(e) => processSubmit(e, editOpen)} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative group w-24 h-24">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group-hover:border-blue-400 transition-all">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" /> : <Camera className="text-gray-300" size={32} />}
                  </div>
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <span className="text-white text-[10px] font-black uppercase">Pilih Foto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Foto Profil (Optional)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">NIK (16 Digit)</label>
                  <input required readOnly={editOpen} className={`w-full rounded-xl border p-2.5 mt-1 ${editOpen ? 'bg-gray-100' : ''}`} value={formData.nik || ""} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                  <input required className="w-full rounded-xl border p-2.5 mt-1" value={formData.nama || ""} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jenis Kelamin</label>
                  <select className="w-full rounded-xl border p-2.5 mt-1" value={formData.jenis_kelamin || ""} onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as any })}>
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Agama</label>
                  <select className="w-full rounded-xl border p-2.5 mt-1" value={formData.agama || ""} onChange={(e) => setFormData({ ...formData, agama: e.target.value as any })}>
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
                  <select className="w-full rounded-xl border p-2.5 mt-1" value={formData.status_perkawinan || ""} onChange={(e) => setFormData({ ...formData, status_perkawinan: e.target.value as any })}>
                    <option value="BELUM_KAWIN">Belum Kawin</option>
                    <option value="KAWIN">Kawin</option>
                    <option value="CERAI">Cerai</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Alamat</label>
                  <textarea rows={2} readOnly className="w-full rounded-xl border p-2.5 mt-1 bg-gray-100" value={formData.alamat || ""} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status Tempat Tinggal</label>
                  <select className="w-full rounded-xl border p-2.5 mt-1" value={formData.status_tempat_tinggal || ""} onChange={(e) => setFormData({ ...formData, status_tempat_tinggal: e.target.value as any })}>
                    <option value="PT">Penghuni Tetap</option>
                    <option value="KT">Kontrak</option>
                    <option value="KS">Kost</option>
                    <option value="TD">Tidak Ditinggali</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => { setOpenForm(false); setEditOpen(false); }} className="flex-1 py-3 border rounded-2xl font-bold hover:bg-gray-50 transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 flex items-center justify-center gap-2 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : editOpen ? "Simpan Perubahan" : "Simpan Anggota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailOpen && selectedPenduduk && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-black">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => setDetailOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
            <div className="flex items-center gap-4 mb-6">
              <img src={getImageUrl(selectedPenduduk.foto, selectedPenduduk.nama)} className="w-20 h-20 rounded-full object-cover shadow-xl" alt="profile" />
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-lg">{selectedPenduduk.nama}</h3>
                <h3 className="text-sm text-gray-500">{selectedPenduduk.nik}</h3>
                <div className={`px-2 py-1 text-[10px] font-black rounded-lg w-fit ${selectedPenduduk.status_keluarga === "KK" ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}>
                  {selectedPenduduk.status_keluarga === "KK" ? "KEPALA KELUARGA" : "ANGGOTA"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-5 text-sm">
              {[
                { label: "Jenis Kelamin", value: genderMap[selectedPenduduk.jenis_kelamin] },
                { label: "Agama", value: agamaMap[selectedPenduduk.agama] },
                { label: "Status Kawin", value: statusperkawinanMap[selectedPenduduk.status_perkawinan] },
                { label: "Pekerjaan", value: selectedPenduduk.pekerjaan },
                { label: "Status Tempat Tinggal", value: statusTempatTinggalMap[selectedPenduduk.status_tempat_tinggal] }
              ].map((item, idx) => (
                <div key={idx}>
                  <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">{item.label}</p>
                  <p className="font-medium">{item.value || "-"}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Alamat</p>
                <p className="font-medium">{selectedPenduduk.alamat} (RT {selectedPenduduk.rt} / RW {selectedPenduduk.rw})</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button onClick={() => setDetailOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-medium">Tutup</button>
              <button onClick={() => handleOpenEdit(selectedPenduduk)} className="px-4 bg-black text-white rounded-lg text-sm font-medium flex items-center gap-2">
                <Edit3 size={16} /> Edit Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeluargaTable;