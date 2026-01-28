"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Home, Users, User, UserCheck, Loader2, BabyIcon } from "lucide-react";
import KeluargaTable from "@/components/KeluargaTable";
import SideBar from "@/components/sidebar";
import { StatCard } from "@/components/statcard";
import api from "@/lib/api";

interface Penduduk {
  jenis_kelamin: "L" | "P" | string;
}

interface Keluarga {
  id: number;
  no_kk: string;
  jumlah_anggota: number;
  penduduk: Penduduk[]; // Asumsi data penduduk ikut ter-fetch untuk kalkulasi gender
}

export default function KeluargaPage() {
  const [keluargaList, setKeluargaList] = useState<Keluarga[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKeluargaData = useCallback(async () => {
    try {
      setLoading(true);
      // Mengambil data keluarga (pastikan endpoint ini mengembalikan list keluarga)
      const res = await api.get("/keluarga/"); 
      setKeluargaList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeluargaData();
  }, [fetchKeluargaData]);

  // Kalkulasi Statistik menggunakan useMemo agar efisien
  const stats = useMemo(() => {
    let totalAnggota = 0;
    let totalPria = 0;
    let totalWanita = 0;

    keluargaList.forEach((keluarga) => {
      totalAnggota += keluarga.jumlah_anggota || 0;
      
      // Jika backend mengirimkan nested array penduduk, kita hitung gender di sini
      if (keluarga.penduduk) {
        keluarga.penduduk.forEach((p) => {
          if (p.jenis_kelamin === "L") totalPria++;
          if (p.jenis_kelamin === "P") totalWanita++;
        });
      }
    });

    return {
      
      totalAnggota,
      totalPria,
      totalWanita,
    };
  }, [keluargaList]);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <aside className="sticky top-0 h-screen">
            <SideBar/>
            </aside>

      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Statistik Anggota Keluarga</h1>
              <p className="text-gray-500 mt-1">Data real-time berdasarkan Kartu Keluarga terdaftar</p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                <Loader2 className="animate-spin" size={16} />
                Loading...
              </div>
            )}
          </div>

          {/* Grid Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
            <StatCard
              title="Total Anggota Keluarga"
              value={loading ? "..." : stats.totalAnggota}
              valueColor="text-gray-900"
              bgColor="bg-white"
              icon={<Users className="text-blue-600" size={20} />}
            />
            <StatCard
              title="Laki-laki"
              value={loading ? "..." : stats.totalPria}
              valueColor="text-blue-600"
              bgColor="bg-blue-50"
              icon={<User className="text-blue-600" size={20} />}
            />
            <StatCard
              title="Perepuan"
              value={loading ? "..." : stats.totalWanita}
              valueColor="text-pink-600"
              bgColor="bg-pink-50"
              icon={<User className="text-pink-600" size={20} />}
            />
          
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <KeluargaTable />
        </div>
      </main>
    </div>
  );
}