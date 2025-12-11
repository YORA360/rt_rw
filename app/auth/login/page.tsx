"use client";


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; 
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login/', {
        email: formData.email,
        password: formData.password,
      });

      console.log('Login Response:', response.data);

      const { token } = response.data;

      localStorage.setItem('token', token);
      console.log("Token from localStorage:", localStorage.getItem("token"));

      // Redirect
      router.push('/dashboard'); 
      
    } catch (err: any) {
      console.error('Login Failed:', err);
      if (err.response) {
        // Menangkap pesan error dari backend (misal dari serializer)
        // LoginSerializer kita return array error, atau string detail
        const msg = err.response.data[0] || err.response.data.detail || 'Email atau password salah.';
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
        
        <h1 className="text-2xl font-bold text-center text-blue-700">
          Sipakerte.id
        </h1>
        <p className="text-center text-gray-600 mt-1">Sistem Informasi RT/RW</p>

        <h2 className="text-lg text-black text-center mt-3">
          Masuk ke Akun Anda
        </h2>
        <p className="text-center text-gray-500 text-sm mt-1">
          Masukkan email dan password untuk melanjutkan
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-black font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-black block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2 rounded-lg mt-2 hover:bg-gray-800 transition font-medium"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="border-t mt-6"></div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">
            Daftar sekarang
          </Link>
        </p>

        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-gray-700">
          <p className="font-semibold mb-2">Demo Akun:</p>
          <p>
            <span className="font-medium">Admin:</span> admin@rt05.id / admin123
          </p>
          <p className="mt-1">
            <span className="font-medium">Warga:</span> ahmad.suhardi@email.com /
            warga123
          </p>
        </div>

      </div>
    </div>
  );
}
