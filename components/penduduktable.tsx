"use client";

import React, { useEffect, useState } from "react";
import { Eye, Edit3, Trash2, Plus, Download } from "lucide-react";



interface Penduduk {
  id: number;
  nik: string;
  nama: string;
  jenis_kelamin: "L" | "P";
  alamat: string;
  pekerjaan: string;
  status: "KK" | "Anggota" | string;
}

const PendudukTable: React.FC = () => {
  const [penduduk, setPenduduk] = useState<Penduduk[]>([]);
  const [search, setSearch] = useState<string>("");
  const [openForm, setOpenForm] = useState(false);

  const getPenduduk = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("Token tidak ada di localStorage!");
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/api/penduduk/", {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data penduduk");
      }

      const data = await res.json();
      setPenduduk(data);

    } catch (err) {
      console.error("Error fetching penduduk:", err);
    }
  };

  useEffect(() => {
    getPenduduk();
  }, []);



  return (
    <div className="w-full p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Daftar Penduduk</h2>

      {/* Search + Buttons */}
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Cari berdasarkan nama, NIK, atau alamat..."
          className="w-1/2 px-4 py-2 border rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <Download size={18} /> Export
          </button>

          <button
            onClick={() => setOpenForm(true)}
             className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg"
             >
            <Plus size={18} /> Tambah Penduduk
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">NIK</th>
              <th className="p-3">Nama Lengkap</th>
              <th className="p-3">L/P</th>
              <th className="p-3">Alamat</th>
              <th className="p-3">Pekerjaan</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
<tbody>
  {penduduk
    .filter((p) =>
      [p.nik, p.nama, p.alamat]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .map((p) => (
      <tr key={p.id} className="border-b hover:bg-gray-50">
        <td className="p-3">{p.nik}</td>
        <td className="p-3">{p.nama}</td>
        <td className="p-3">{p.jenis_kelamin}</td>
        <td className="p-3">{p.alamat}</td>
        <td className="p-3">{p.pekerjaan}</td>
        <td className="p-3">{p.status}</td>

        {/* Aksi */}
        <td className="p-3">
          <div className="flex items-center justify-center gap-3">
            <button className="text-blue-600 hover:text-blue-800">
              <Eye size={18} />
            </button>

            <button className="text-green-600 hover:text-green-800">
              <Edit3 size={18} />
            </button>

            <button className="text-red-600 hover:text-red-800">
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    ))}
</tbody>

{openForm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Tambah Penduduk</h3>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="NIK"
          className="w-full px-4 py-2 border rounded-lg"
        />

        <input
          type="text"
          placeholder="Nama Lengkap"
          className="w-full px-4 py-2 border rounded-lg"
        />

        <select className="w-full px-4 py-2 border rounded-lg">
          <option value="">Jenis Kelamin</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>

        <input
          type="text"
          placeholder="Alamat"
          className="w-full px-4 py-2 border rounded-lg"
        />

        <input
          type="text"
          placeholder="Pekerjaan"
          className="w-full px-4 py-2 border rounded-lg"
        />

        <select className="w-full px-4 py-2 border rounded-lg">
          <option value="">Status</option>
          <option value="KK">KK</option>
          <option value="Anggota">Anggota</option>
        </select>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setOpenForm(false)}
            className="px-4 py-2 border rounded-lg"
          >
            Batal
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
 </div>
)}

          

        </table>
      </div>
    </div>
  );
};

export default PendudukTable;
