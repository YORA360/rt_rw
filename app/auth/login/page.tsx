"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; 
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Login untuk ambil Token
      const response = await api.post('/auth/login/', {
        email: formData.email,
        password: formData.password,
      });

      const token = response.data.token;

      // Simpan Token awal
      localStorage.setItem('token', token);
      Cookies.set('token', token, { expires: 7, path: '/' });

      // 2. Ambil Profil Lengkap
      const profileRes = await api.get('/auth/me/', {
        headers: { Authorization: `Token ${token}` }
      });

      const userProfile = profileRes.data;
      const penduduk = userProfile.penduduk;

      // Simpan Role ke Cookie (Penting untuk Middleware)
      Cookies.set('role', userProfile.role, { expires: 7, path: '/' });

      if (!penduduk) {
        setError("Data penduduk tidak ditemukan.");
        return;
      }

      // 3. Cek Kelengkapan Data
      const isDataIncomplete = 
        !penduduk.rt || !penduduk.rw || !penduduk.ttl || 
        !penduduk.agama || !penduduk.status_perkawinan || !penduduk.no_telepon;

      // 4. Redirect Berdasarkan Kondisi & Role
      if (isDataIncomplete) {
        router.push('/auth/complete-profile');
      } else {
        // Logika Redirect sesuai ROLE
        if (userProfile.role === 'WARGA') {
          router.push('/user/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      }
      
    } catch (err: any) {
      console.error('Login Failed:', err);
      if (err.response) {
        const msg = err.response.data.detail || 'Email atau password salah.';
        setError(msg);
      } else {
        setError('Terjadi kesalahan jaringan.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef1ff] px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-700">Sipakerte.id</h1>
            <p className="text-gray-500 text-sm">Sistem Informasi Manajemen RT/RW</p>
        </div>

        <div className="mb-6">
            <h2 className="text-lg font-semibold text-black">Masuk ke Akun</h2>
            <p className="text-gray-400 text-xs">Gunakan email terdaftar untuk melanjutkan</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full text-black px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full text-black px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              placeholder="••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl mt-4 hover:bg-blue-700 transition-all font-bold shadow-md disabled:bg-gray-300"
          >
            {isLoading ? "Memvalidasi..." : "Masuk Sekarang"}
          </button>
        </form>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Atau</span></div>
        </div>

        <p className="text-center text-gray-500 text-sm">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-blue-600 font-bold hover:underline">
            Daftar Warga
          </Link>
        </p>
      </div>
    </div>
  );
}