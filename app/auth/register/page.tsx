"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Image as ImageIcon } from "lucide-react";
import api, {BASE_URL} from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nik: "",
    no_kk: "",
    nama: "",
    jenis_kelamin: "",
    alamat: "",
    email: "",
    password: "",
    password2: "",
  });

  // State khusus untuk file dan preview (seperti di Pengumuman)
  const [fotoKK, setFotoKK] = useState<File | null>(null);
  const [fotoKTP, setFotoKTP] = useState<File | null>(null);
  const [previewKK, setPreviewKK] = useState<string | null>(null);
  const [previewKTP, setPreviewKTP] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler File (Cara yang sama dengan Pengumuman)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'kk' | 'ktp') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'kk') {
        setFotoKK(file);
        setPreviewKK(URL.createObjectURL(file));
      } else {
        setFotoKTP(file);
        setPreviewKTP(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.password2) {
      setErrorMsg("Password tidak sama");
      return;
    }

    if (!fotoKK || !fotoKTP) {
      setErrorMsg("Foto KK dan Foto KTP wajib diunggah");
      return;
    }

    setLoading(true);

    try {
  // 1. Siapkan FormData (Sudah benar)
  const data = new FormData();
  data.append("nik", formData.nik);
  data.append("no_kk", formData.no_kk);
  data.append("nama", formData.nama);
  data.append("jenis_kelamin", formData.jenis_kelamin);
  data.append("alamat", formData.alamat);
  data.append("email", formData.email);
  data.append("password", formData.password);
  
  if (fotoKK) data.append("foto_kk", fotoKK);
  if (fotoKTP) data.append("foto_ktp", fotoKTP);

  // 2. Gunakan endpoint Register (BUKAN /pengumuman/)
  // Jika menggunakan Axios (api), tidak perlu await res.json()
  const res = await api.post("/auth/register/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // 3. Axios langsung mengembalikan data di properti .data
  // Jika sampai sini, berarti status code 2xx (Berhasil)
  router.push("/auth/login");

} catch (err: any) {
  // 4. Error Handling ala Axios
  console.error("Register Error:", err);
  
  if (err.response) {
    // Error dari server (misal: NIK sudah ada, email sudah ada)
    const serverError = err.response.data;
    
    // Ambil pesan error detail jika ada, atau tampilkan pesan umum
    const msg = serverError.detail || 
                serverError.email?.[0] || 
                serverError.nik?.[0] || 
                "Gagal membuat akun. Periksa kembali data Anda.";
                
    setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
  } else {
    setErrorMsg("Terjadi kesalahan jaringan atau server mati");
  }
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
                No Kartu Keluarga
              </label>
              <input
                name="no_kk"
                value={formData.no_kk}
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Bagian Foto KK */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon size={16} /> Foto Kartu Keluarga (KK)
            </label>
            <div 
              onClick={() => document.getElementById('inputKK')?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 h-40 overflow-hidden"
            >
              {previewKK ? (
                <img src={previewKK} alt="Preview KK" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <Camera size={32} className="mx-auto mb-2" />
                  <p className="text-xs">Klik untuk upload Foto KK</p>
                </div>
              )}
            </div>
            <input id="inputKK" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'kk')} />
          </div>

          {/* Bagian Foto KTP */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon size={16} /> Foto KTP
            </label>
            <div 
              onClick={() => document.getElementById('inputKTP')?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 h-40 overflow-hidden"
            >
              {previewKTP ? (
                <img src={previewKTP} alt="Preview KTP" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <Camera size={32} className="mx-auto mb-2" />
                  <p className="text-xs">Klik untuk upload Foto KTP</p>
                </div>
              )}
            </div>
            <input id="inputKTP" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'ktp')} />
          </div>
        </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-lg mt-2 hover:bg-gray-800 transition font-medium"
            >
              {loading ? "Mendaftarkan..." : "Daftar"}
            </button>
          </form>

          <div className="border-t border-gray-300 mt-6 mb-7"></div>

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
