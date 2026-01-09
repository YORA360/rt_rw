"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function TambahAnggotaPage() {
  const router = useRouter();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      // Pastikan backend menggunakan Knox Token (keyword 'Token')
      await api.post('/penduduk/', formData, {
        headers: { Authorization: `Token ${token}` }
      });
      
      alert("Anggota keluarga berhasil ditambahkan ke database!");
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Submit Error:', err.response?.data);
      // Menampilkan pesan error detail dari backend (misal: NIK sudah terdaftar)
      const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : "Gagal menyimpan data.";
      setError(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        
        {/* Header Form */}
        <div className="bg-blue-700 p-6">
          <h1 className="text-2xl font-bold text-white">Formulir Tambah Anggota Keluarga</h1>
          <p className="text-blue-100 text-sm mt-1">
            Data ini akan langsung terhubung ke nomor KK Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              <strong>Gagal menyimpan:</strong> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Informasi Identitas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Identitas Utama</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK (16 Digit)</label>
                <input 
                  type="text" name="nik" maxLength={16} required 
                  onChange={handleChange} placeholder="3201xxxxxxxxxxxx"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" name="nama" required onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                  <select name="jenis_kelamin" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-black">
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <input type="date" name="ttl" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-black" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
                <select name="agama" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-black">
                  <option value="">Pilih Agama</option>
                  <option value="ISLAM">Islam</option>
                  <option value="KRISTEN">Kristen</option>
                  <option value="KATOLIK">Katolik</option>
                  <option value="HINDU">Hindu</option>
                  <option value="BUDDHA">Buddha</option>
                  <option value="KONGHUCU">Konghucu</option>
                </select>
              </div>
            </div>

            {/* Informasi Domisili & Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Status & Kontak</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RT</label>
                  <input type="number" name="rt" required onChange={handleChange} placeholder="001" className="w-full px-4 py-2 border rounded-lg text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RW</label>
                  <input type="number" name="rw" required onChange={handleChange} placeholder="005" className="w-full px-4 py-2 border rounded-lg text-black" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                <input type="text" name="pekerjaan" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-black" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Perkawinan</label>
                <select name="status_perkawinan" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-black">
                  <option value="">Pilih Status</option>
                  <option value="BELUM_KAWIN">Belum Kawin</option>
                  <option value="KAWIN">Kawin</option>
                  <option value="CERAI">Cerai</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                <input type="text" name="no_telepon" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-black" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kewarganegaraan</label>
                <input type="text" name="kewarganegaraan" defaultValue="Indonesia" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-black" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
            <textarea 
              name="alamat" rows={3} required onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition disabled:bg-blue-300"
            >
              {isSubmitting ? "Sedang Menyimpan..." : "Simpan Anggota Keluarga"}
            </button>
            <Link 
              href="/admin/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition flex items-center justify-center font-medium"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}