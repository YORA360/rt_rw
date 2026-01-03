"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    jenis_kelamin: "",
    alamat: "",
    email: "",
    password: "",
    password2: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent)  => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.password2) {
      setErrorMsg("Password tidak sama");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nik: formData.nik,
          nama: formData.nama,
          jenis_kelamin: formData.jenis_kelamin,
          alamat: formData.alamat,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.detail || "Gagal membuat akun");
      } else {
        // Redirect setelah berhasil
        router.push("/auth/login");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#eef1ff] px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-center text-blue-700">
            Sipakerte.id
          </h1>
          <p className="text-center text-gray-600 mt-1">
            Sistem Informasi RT/RW
          </p>

          <h2 className="text-lg text-black text-center mt-3">
            Daftar Akun Warga
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Error message */}
            {errorMsg && (
              <p className="text-red-600 bg-red-100 p-2 rounded">{errorMsg}</p>
            )}

            <div>
              <label className="block text-sm text-black font-medium mb-1">
                NIK (16 digit)
              </label>
              <input
                name="nik"
                value={formData.nik}
                onChange={handleChange}
                className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="3249867385204301"
              />
            </div>

            <div>
              <label className="block text-sm text-black font-medium mb-1">
                Nama Lengkap
              </label>
              <input
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nama sesuai KTP"
              />
            </div>
            
             <div>
              <label className="block text-sm text-black font-medium mb-1">
                Jenis Kelamin
              </label>
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleChange}
                className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Pilih Jenis Kelamin --</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>        
              </select>
            </div>

            <div>
              <label className="block text-sm text-black font-medium mb-1">
                Alamat Rumah
              </label>
              <input
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Jl. Mawar No.15"
              />
            </div>

            <div>
              <label className="block text-sm text-black font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="text-black block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label className="text-black block text-sm font-medium mb-1">
                Konfirmasi Password
              </label>
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                className="w-full text-black px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ulangi password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-lg mt-2 hover:bg-gray-800 transition font-medium"
            >
              {loading ? "Mendaftarkan..." : "Daftar"}
            </button>
          </form>

          <div className="border-t mt-6"></div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
              Masuk disini
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
