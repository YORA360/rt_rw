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
 <div className="min-h-screen flex items-center justify-center bg-[#eef1ff] px-4 font-sans">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        
        {/* Logo & Tagline */}
        <div className="text-center mb-6">
          <h1 className="text-2xl  text-center text-blue-700">
            Sipakerte.id
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Sistem Informasi RT/RW
          </p>
        </div>

        {/* Title Masuk */}
        <div className="text-center mb-6">
          <h2 className="text-lg  text-black">Masuk ke Akun Anda</h2>
          <p className="text-gray-400 text-sm">
            Masukkan email dan password untuk melanjutkan
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <p className="text-red-600 bg-red-50 p-3 rounded-lg text-xs border border-red-100 italic">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm text-black font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="........"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#050510] text-white py-3.5 rounded-xl mt-2 hover:bg-gray-900 transition-all font-bold text-sm"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        
        <div className="border-t border-gray-300 mt-6 mb-7"></div>
        <p className="text-center text-gray-500 text-sm">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-blue-600 font-bold hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
);
}