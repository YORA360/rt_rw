"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef1ff] px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        
        {/* Judul */}
        <h1 className="text-2xl font-bold text-center text-blue-700">
          Sipakerte.id
        </h1>
        <p className="text-center text-gray-600 mt-1">Sistem Informasi RT/RW</p>

        {/* Subjudul */}
        <h2 className="text-lg text-black text-center mt-3">
          Masuk ke Akun Anda
        </h2>
        <p className="text-center text-gray-500 text-sm mt-1">
          Masukkan email dan password untuk melanjutkan
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm text-black font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-black block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Tombol */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg mt-2 hover:bg-gray-800 transition font-medium"
          >
            Masuk
          </button>
        </form>

        {/* Garis */}
        <div className="border-t mt-6"></div>

        {/* Link daftar */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">
            Daftar sekarang
          </Link>
        </p>

        {/* Demo Akun */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-gray-700">
          <p className="font-semibold mb-2">Demo Akun:</p>

          <p>
            <span className="font-medium">Admin:</span> admin@rt05.id / admin123
          </p>
          <p className="mt-1">
            <span className="font-medium">Warga:</span> ahmad.suhardi@email.com / warga123
          </p>
        </div>

      </div>
    </div>
  );
}
