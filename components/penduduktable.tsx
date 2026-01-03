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
  status_keluarga: "KK" | "Anggota" | string;
}

const PendudukTable: React.FC = () => {
  const [penduduk, setPenduduk] = useState<Penduduk[]>([]);
  const [search, setSearch] = useState<string>("");
  const [pendudukForm, setPendudukForm] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
const [selectedPenduduk, setSelectedPenduduk] = useState<any>(null);
const [unverifiedOpen, setUnverifiedOpen] = useState(false);
const [unverifiedPenduduk, setUnverifiedPenduduk] = useState<Penduduk[]>([]);


  const [formData, setFormData] = useState(
    {
       nik  : "",
 nama : "",
 jenis_kelamin : "",
 ttl : "",
 agama : "",
 alamat : "",
 rt : "",
 rw : "",
 pekerjaan : "",
 status_perkawin: "",
 kewarganegaraan : "",
 no_telepon : "",
    }
  )

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
  const getUnverifiedPenduduk = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://127.0.0.1:8000/api/auth/pending-user/", {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Gagal mengambil data");

    const data = await res.json();
    setUnverifiedPenduduk(data);
  } catch (error) {
    console.error(error);
  }
};

const verifyUser = async (id: number) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Token tidak ditemukan, silakan login ulang");
    return;
  }

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/auth/verify-user/${id}/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            action: "APPROVED"
        })
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Gagal verifikasi");
    }

    // 🔄 refresh data
    getPenduduk();
    getUnverifiedPenduduk();

    alert("Penduduk berhasil diverifikasi ✅");
  } catch (error: any) {
    alert(error.message || "Terjadi kesalahan");
    console.error(error);
  }
};


  useEffect(() => {
    getPenduduk();
    getUnverifiedPenduduk();
  }, []);



  return (
    <div className="w-full p-6 bg-white rounded-xl shadow text-black">
      <div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-semibold">Daftar Penduduk</h2>

  <button
    onClick={() => {
      getUnverifiedPenduduk();
      setUnverifiedOpen(true);
    }}
    className="px-3 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
  >
    Belum Diverifikasi
  </button>
</div>


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
            onClick={() => setPendudukForm(true)}
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
            <tr className="bg-gray-100 text-left text-sm text-gray-700">
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
      <tr key={p.id} className="border-b hover:bg-gray-50 text-black">
        <td className="p-3">{p.nik}</td>
        <td className="p-3">{p.nama}</td>
        <td className="p-3">{p.jenis_kelamin}</td>
        <td className="p-3">{p.alamat}</td>
        <td className="p-3">{p.pekerjaan}</td>
        <td className="p-3">{p.status_keluarga}</td>

        {/* Aksi */}
        <td className="p-3">
          <div className="flex items-center justify-center gap-3">
           <button
  onClick={() => {
    setSelectedPenduduk(p);
    setDetailOpen(true);
  }}
  className="text-blue-600 hover:text-blue-800"
>
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
{unverifiedOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-lg">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Penduduk Belum Diverifikasi
        </h3>
        <button
          onClick={() => setUnverifiedOpen(false)}
          className="text-gray-400 hover:text-black"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      {unverifiedPenduduk.length === 0 ? (
        <p className="text-sm text-gray-500">
          Semua data penduduk sudah diverifikasi.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-auto">
          {unverifiedPenduduk.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center border rounded-lg p-3"
            >
              <div>
                <p className="font-semibold">{p.nama}</p>
                <p className="text-sm text-gray-500">{p.nik}</p>
                <p className="text-xs text-gray-400">{p.alamat}</p>
              </div>

              
              <button
  onClick={() => verifyUser(p.id)}
  className="px-3 py-1 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
>
  Verifikasi
</button>

              
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => setUnverifiedOpen(false)}
          className="px-4 py-2 border rounded-lg"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
)}

{pendudukForm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Tambah Penduduk</h3>

      <form className="space-y-4 text-black grid grid-cols-2 gap-x-4">
        <label >NIK
        <input
          type="text"
          placeholder="NIK"
          className="w-full px-4 py-2 border rounded-lg"
        />
        </label>
        <label htmlFor="">Nama Lengkap
        <input
          type="text"
          placeholder="Nama Lengkap"
          className="w-full px-4 py-2 border rounded-lg"
        />
        </label>
        <label htmlFor="">Jenis Kelamin
        <select className="w-full px-4 py-2 border rounded-lg">
          <option value="">Jenis Kelamin</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
        </label>
        <label htmlFor="">Tempat Lahir
        <input
          type="text"
          placeholder="Tempat Lahir"
          className="w-full px-4 py-2 border rounded-lg"
        />
        </label>
        <label htmlFor="">Tanggal Lahir
        <input
          type="date"
          className="w-full px-4 py-2 border rounded-lg"
        />
        </label>
        <label htmlFor="">Agama
        <select className="w-full px-4 py-2 border rounded-lg">
          <option value="">Islam</option>
          <option value="">Kristen</option>
          <option value="">Katolik</option>
          <option value="">Hindu</option>
          <option value="">Buddha</option>
          <option value="">Konghucu</option>
        </select>
        </label>

        <label className="col-span-2">Alamat Lengkap
          <input
          type="text"
          placeholder="Alamat"
          className="w-full px-4 py-2 border rounded-lg"
        />
        </label>

        <label >RT
        <input
          type="text"
          placeholder="NIK"
          className="w-full px-4 py-2 border rounded-lg"
        />
        </label>

        <label >RW
        <input
          type="text"
          placeholder="NIK"
          className="w-full px-4 py-2 border rounded-lg"
        />
        </label>

        <label >Pekerjaan
        <input
          type="text"
          placeholder="NIK"
          className="w-full px-4 py-2 border rounded-lg"
        />
        </label>
        
        <label htmlFor="">Status Pernikahan
        <select className="w-full px-4 py-2 border rounded-lg">
          <option value="">Islam</option>
          <option value="">Kristen</option>
          <option value="">Katolik</option>
          <option value="">Hindu</option>
          <option value="">Buddha</option>
          <option value="">Konghucu</option>
        </select>
        </label>

        <label >Kewarganegaraan
        <input
          type="text"
          placeholder="NIK"
          className="w-full px-4 py-2 border rounded-lg"
        />
        </label>

        <label htmlFor="">Agama
        <select className="w-full px-4 py-2 border rounded-lg">
          <option value="">Islam</option>
          <option value="">Kristen</option>
          <option value="">Katolik</option>
          <option value="">Hindu</option>
          <option value="">Buddha</option>
          <option value="">Konghucu</option>
        </select>
        </label>
        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setPendudukForm(false)}
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
{detailOpen && selectedPenduduk && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-lg relative">

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Detail Data Penduduk</h3>
        <button
          onClick={() => setDetailOpen(false)}
          className="text-gray-400 hover:text-black"
        >
          ✕
        </button>
      </div>

      {/* Profil */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
          {selectedPenduduk.nama.charAt(0)}
        </div>
        <div>
          <p className="font-semibold">{selectedPenduduk.nama}</p>
          <p className="text-sm text-gray-500">{selectedPenduduk.nik}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-black text-white">
            {selectedPenduduk.status}
          </span>
        </div>
      </div>

      {/* Data */}
      <div className="grid grid-cols-2 gap-y-4 text-sm">
        <div>
          <p className="text-gray-500">Jenis Kelamin</p>
          <p>{selectedPenduduk.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</p>
        </div>

        <div>
          <p className="text-gray-500">Pekerjaan</p>
          <p>{selectedPenduduk.pekerjaan}</p>
        </div>

        <div className="col-span-2">
          <p className="text-gray-500">Alamat</p>
          <p>{selectedPenduduk.alamat}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-6">
        <button
          onClick={() => setDetailOpen(false)}
          className="px-4 py-2 border rounded-lg"
        >
          Tutup
        </button>

        <button className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2">
          <Edit3 size={16} /> Edit Data
        </button>
      </div>
    </div>
  </div>
)}

          

        </table>
      </div>
    </div>
  );
};

export default PendudukTable;
