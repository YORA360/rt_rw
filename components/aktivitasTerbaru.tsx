"use client";

import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

interface Aktivitas {
  id: number;
  judul: string;
  status: "AKAN_DATANG" | "BERLANGSUNG" | "SELESAI";
  tanggal: string;
  jam: string;
}

export default function AktivitasTerbaru() {
  const [data, setData] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAktivitas = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://127.0.0.1:8000/api/aktivitas/", {
          headers: { Authorization: `Token ${token}` },
        });
        const result = await res.json();
        // Ambil 4 data terbaru saja
        setData(result.slice(0, 4));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAktivitas();
  }, []);

  if (loading) return <div className="p-6 bg-white rounded-xl border animate-pulse h-64">Memuat aktivitas...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Aktivitas Terbaru</h2>
        <a href="/admin/aktivitas" className="text-sm font-semibold text-gray-900 hover:underline">Lihat Semua</a>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${item.status === "SELESAI" ? 'bg-gray-100' : 'bg-green-50'}`}>
                <Calendar size={20} className={`${item.status === "SELESAI" ? 'text-gray-500' : 'text-green-600'}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{item.judul}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.tanggal} • {item.jam.substring(0, 5)}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase ${
              item.status === "SELESAI" ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'
            }`}>
              {item.status.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}