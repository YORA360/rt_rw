"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Users, Download, X, Search, MapPin } from "lucide-react";
import api from "@/lib/api"; // Pastikan path ini sesuai dengan lokasi utility axios Anda

interface AnggotaKeluarga {
  id: number;
  nama: string;
  nik: string;
  status_keluarga: string;
  jenis_kelamin: string;
}

interface Keluarga {
  id: number;
  no_kk: string;
  kepala_keluarga: string;
  alamat_kk: string;
  jumlah_anggota: number;
  penduduk?: AnggotaKeluarga[];
}

const KeluargaAdminTable: React.FC = () => {
  const [keluargaList, setKeluargaList] = useState<Keluarga[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedKK, setSelectedKK] = useState<Keluarga | null>(null);

  const getKeluarga = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/keluarga/");
      setKeluargaList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data keluarga:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getKeluarga();
  }, [getKeluarga]);

  const filteredKeluarga = keluargaList.filter((k) =>
    k.no_kk.includes(search) ||
    k.kepala_keluarga.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow text-black font-sans">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Daftar Kartu Keluarga</h2>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative w-1/2">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari No. KK atau Nama Kepala Keluarga..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium">
          <Download size={18} /> Export
        </button>
      </div>

      {/* --- TABLE WITH STICKY HEADER & SCROLL --- */}
      <div className="overflow-x-auto overflow-y-auto max-h-[350px] border rounded-lg scrollbar-thin scrollbar-thumb-gray-300">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-100 text-left text-gray-700 font-semibold uppercase tracking-wider">
              <th className="p-4 bg-gray-100">No. Kartu Keluarga</th>
              <th className="p-4 bg-gray-100">Kepala Keluarga</th>
              <th className="p-4 bg-gray-100">Alamat</th>
              <th className="p-4 bg-gray-100 text-center">Anggota</th>
              <th className="p-4 bg-gray-100 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-400">Memuat data keluarga...</td>
              </tr>
            ) : filteredKeluarga.length > 0 ? (
              filteredKeluarga.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50 transition-colors bg-white">
                  <td className="p-4 font-bold text-blue-600 tracking-tight">{k.no_kk}</td>
                  <td className="p-4 font-medium text-gray-900">{k.kepala_keluarga}</td>
                  <td className="p-4 text-gray-500 italic line-clamp-1">{k.alamat_kk}</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[11px] font-bold">
                      {k.jumlah_anggota} Orang
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => { setSelectedKK(k); setDetailOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Anggota"
                      >
                        <Users size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-400">Data tidak ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DETAIL (Style PendudukTable) --- */}
      {detailOpen && selectedKK && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in duration-300">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start p-6 border-b">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedKK.kepala_keluarga.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedKK.kepala_keluarga}</h3>
                  <p className="text-sm text-blue-600 font-medium">No. KK: {selectedKK.no_kk}</p>
                </div>
              </div>
              <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-black p-1 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Alamat Info */}
              <div className="mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                  <MapPin size={10} /> Alamat Kartu Keluarga
                </p>
                <p className="text-gray-800 text-sm font-medium">{selectedKK.alamat_kk}</p>
              </div>

              <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                <Users size={16} className="text-blue-600" /> Daftar Anggota Keluarga
              </h4>

              {/* Tabel Anggota dalam Modal */}
              <div className="border rounded-xl overflow-hidden max-h-60 overflow-y-auto border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-left text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                      <th className="p-3">Nama</th>
                      <th className="p-3">NIK</th>
                      <th className="p-3">Hubungan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedKK.penduduk && selectedKK.penduduk.length > 0 ? (
                      selectedKK.penduduk.map((ang) => (
                        <tr key={ang.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-semibold text-gray-800">{ang.nama}</td>
                          <td className="p-3 text-gray-500 font-mono text-xs">{ang.nik}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                              ang.status_keluarga === 'KK' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {ang.status_keluarga === 'KK' ? 'Kepala Keluarga' : 'Anggota'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="p-4 text-center text-gray-400">Data anggota tidak tersedia.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setDetailOpen(false)} className="px-5 py-2 border rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                Tutup
              </button>
              <button className="px-5 py-2 bg-black text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition">
                <Download size={16} /> Cetak Kartu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeluargaAdminTable;