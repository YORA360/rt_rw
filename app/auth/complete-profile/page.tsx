"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [residentId, setResidentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    kewarganegaraan: 'Indonesia'
  });

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const res = await api.get('/auth/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sesuaikan dengan struktur response API Anda
        const d = res.data.penduduk;
        
        if (d) {
          setResidentId(d.id);
          setFormData({
            nik: d.nik || '',
            nama: d.nama || '',
            jenis_kelamin: d.jenis_kelamin || '',
            ttl: d.ttl || '',
            agama: d.agama || '',
            alamat: d.alamat || '',
            rt: d.rt || '',
            rw: d.rw || '',
            pekerjaan: d.pekerjaan || '',
            status_perkawinan: d.status_perkawinan || '',
            no_telepon: d.no_telepon || '',
            kewarganegaraan: d.kewarganegaraan || 'Indonesia',
          });
        }
      } catch (err) {
        console.error(err);
        setError("Gagal mengambil data profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentId) {
      setError("ID Penduduk tidak ditemukan.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Menggunakan residentId yang dinamis dari state
      await api.patch(`/penduduk/${residentId}/`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Data berhasil dilengkapi!");
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Update Error:', err.response?.data);
      // Menampilkan pesan error spesifik dari backend jika ada
      const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : "Gagal memperbarui data.";
      setError(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 animate-pulse">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef1ff] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-blue-700">Lengkapi Data Diri</h1>
        <p className="text-gray-500 mb-6">Silakan lengkapi data profil Anda sebelum melanjutkan ke Dashboard.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm overflow-hidden">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">NIK (Nomor Induk Kependudukan)</label>
            <input 
              type="text" 
              name="nik" 
              value={formData.nik} 
              readOnly 
              className="w-full px-3 py-2 bg-gray-100 border rounded-lg text-gray-500 cursor-not-allowed" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <select 
              name="jenis_kelamin" 
              value={formData.jenis_kelamin} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Pilih</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tempat, Tanggal Lahir</label>
            <input 
              type="text" 
              name="ttl" 
              placeholder="Jakarta, 01-01-1990" 
              value={formData.ttl} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-400" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Agama</label>
            <select 
              name="agama" 
              value={formData.agama} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-400"
            >
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
            <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
            <input 
              type="text" 
              name="no_telepon" 
              value={formData.no_telepon} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-400" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">RT</label>
            <input 
              type="text" 
              name="rt" 
              placeholder="005"
              value={formData.rt} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-400" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">RW</label>
            <input 
              type="text" 
              name="rw" 
              placeholder="002"
              value={formData.rw} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-400" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pekerjaan</label>
            <input 
              type="text" 
              name="pekerjaan" 
              value={formData.pekerjaan} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-400" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status Perkawinan</label>
            <select 
              name="status_perkawinan" 
              value={formData.status_perkawinan} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Pilih Status</option>
              <option value="BELUM_KAWIN">Belum Kawin</option>
              <option value="KAWIN">Kawin</option>
              <option value="CERAI">Cerai</option>
              
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
            <input 
              type="text" 
              name="alamat" 
              value={formData.alamat} 
              onChange={handleChange} 
              required 
              className="w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-400" 
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 w-full bg-blue-700 text-white py-3 rounded-lg mt-4 hover:bg-blue-800 transition font-bold disabled:bg-blue-300"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan & Lanjutkan"}
          </button>
        </form>
      </div>
    </div>
  );
}