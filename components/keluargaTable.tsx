"use client";
import React, { useEffect, useState } from "react";
import { Eye, Edit3, Trash2, Plus, Download, Users } from "lucide-react";

interface AnggotaKeluarga {
  id: number;
  nama: string;
  nik: string;
  status_keluarga: string;
}

interface Keluarga {
  id: number;
  no_kk: string;
  kepala_keluarga: string;
  alamat_kk: string;
  jumlah_anggota: number;
  penduduk?: AnggotaKeluarga[]; // Relasi penduduk di dalam KK
}

const KeluargaTable: React.FC = () => {
  const [keluargaList, setKeluargaList] = useState<Keluarga[]>([]);
  const [search, setSearch] = useState<string>("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedKK, setSelectedKK] = useState<Keluarga | null>(null);

  const getKeluarga = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/keluarga/", {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setKeluargaList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getKeluarga();
  }, []);

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow text-black">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Daftar Kartu Keluarga</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Cari No. KK atau Nama Kepala Keluarga..."
            className="px-4 py-2 border rounded-lg w-80 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm">
            <Plus size={18} /> Tambah KK Baru
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-700">
              <th className="p-4">No. Kartu Keluarga</th>
              <th className="p-4">Kepala Keluarga</th>
              <th className="p-4">Alamat</th>
              <th className="p-4 text-center">Jumlah Anggota</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {keluargaList
              .filter((k) => 
                k.no_kk.includes(search) || 
                k.kepala_keluarga.toLowerCase().includes(search.toLowerCase())
              )
              .map((k) => (
                <tr key={k.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-blue-700">{k.no_kk}</td>
                  <td className="p-4">{k.kepala_keluarga}</td>
                  <td className="p-4 text-sm text-gray-600">{k.alamat_kk}</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold">
                      {k.jumlah_anggota} Orang
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => { setSelectedKK(k); setDetailOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Lihat Anggota"
                      >
                        <Users size={18} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Edit3 size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Anggota Keluarga */}
      {detailOpen && selectedKK && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-blue-700 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Detail Keluarga</h3>
                  <p className="text-blue-100 text-sm">No. KK: {selectedKK.no_kk}</p>
                </div>
                <button onClick={() => setDetailOpen(false)} className="text-white hover:text-gray-200 text-2xl">✕</button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Alamat KK</p>
                <p className="text-gray-800">{selectedKK.alamat_kk}</p>
              </div>

              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-600" /> Daftar Anggota Keluarga
              </h4>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-3 text-left">Nama</th>
                      <th className="p-3 text-left">NIK</th>
                      <th className="p-3 text-left">Hubungan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Data ini diambil dari nested serializer 'penduduk' di backend */}
                    {selectedKK.penduduk?.map((ang) => (
                      <tr key={ang.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-3 font-medium">{ang.nama}</td>
                        <td className="p-3 text-gray-500">{ang.nik}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ang.status_keluarga === 'KK' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {ang.status_keluarga === 'KK' ? 'KEPALA KELUARGA' : 'ANGGOTA'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex justify-end gap-3">
               <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                <Download size={16} /> Cetak Kartu
              </button>
              <button onClick={() => setDetailOpen(false)} className="px-4 py-2 border bg-white rounded-lg text-sm font-bold">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeluargaTable;