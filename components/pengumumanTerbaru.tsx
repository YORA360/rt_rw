"use client";

import React, { useEffect, useState } from "react";
import { Megaphone, AlertCircle } from "lucide-react";

interface Pengumuman {
  id: number;
  judul: string;
  kategori: "INFORMASI" | "PENTING" | "DARURAT";
  tanggal: string;
}

export default function PengumumanTerbaru() {
  const [data, setData] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPengumuman = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/api/pengumuman/", {
          headers: { Authorization: `Token ${token}` },
        });
        const result = await res.json();
        // Ambil 3 data terbaru saja
        setData(result.slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPengumuman();
  }, []);

  if (loading) return <div className="p-6 bg-white rounded-xl border animate-pulse h-64">Memuat pengumuman...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Pengumuman Terbaru</h2>
        <a href="/admin/pengumuman" className="text-sm font-semibold text-gray-900 hover:underline">Lihat Semua</a>
      </div>

      <div className="space-y-4">
        {data.map((item) => {
          const isUrgent = item.kategori === "PENTING" || item.kategori === "DARURAT";
          return (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${isUrgent ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <Megaphone size={20} className={`${isUrgent ? 'text-red-500' : 'text-blue-500'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{item.judul}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.tanggal}</p>
                </div>
              </div>
              {isUrgent && <AlertCircle size={20} className="text-red-500" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}