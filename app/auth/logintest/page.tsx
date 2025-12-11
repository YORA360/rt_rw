'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; 

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
      // 1. URL diganti ke '/login/' sesuai urls.py backend
      const response = await api.post('/auth/login/', {
        email: formData.email,
        password: formData.password,
      });

      console.log('Login Response:', response.data);

      // 2. Knox mengembalikan object: { expiry: "...", token: "..." }
      // Tidak ada access/refresh terpisah
      const { token } = response.data;
      
      // Simpan token
      localStorage.setItem('token', token);

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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email" // Ubah jadi email agar validasi HTML jalan
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} 
              transition-colors`}
          >
            {isLoading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}