"use client";

import { useEffect, useState, useCallback } from "react";
import AktivitasTerbaru from "@/components/aktivitasTerbaru";
import PengumumanTerbaru from "@/components/pengumumanTerbaru";
import SideBar from "@/components/sidebar";
import { StatCard } from "@/components/statcard";
import { User, Calendar, Megaphone } from "lucide-react";

// --- Types ---
interface Aktivitas {
  id: number;
  status: "AKAN_DATANG" | "BERLANGSUNG" | "SELESAI";
}

interface Pengumuman {
  id: number;
}

interface Penduduk {
  id: number;
}

export default function DashboardPage() {
  // --- States ---
  const [stats, setStats] = useState({
    totalPenduduk: 0,
    aktivitasAkanDatang: 0,
    totalPengumuman: 0,
  });
  const [loading, setLoading] = useState(true);

  // --- Fetch Logic ---
  const getDashboardData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    };

    try {
      setLoading(true);
      // Mengambil semua data secara paralel untuk efisiensi waktu
      const [resPenduduk, resAktivitas, resPengumuman] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/penduduk/", { headers }),
        fetch("http://127.0.0.1:8000/api/aktivitas/", { headers }),
        fetch("http://127.0.0.1:8000/api/pengumuman/", { headers }),
      ]);

      const dataPenduduk: Penduduk[] = await resPenduduk.json();
      const dataAktivitas: Aktivitas[] = await resAktivitas.json();
      const dataPengumuman: Pengumuman[] = await resPengumuman.json();

      // Hitung statistik
      setStats({
        totalPenduduk: dataPenduduk.length,
        aktivitasAkanDatang: dataAktivitas.filter((a) => a.status === "AKAN_DATANG").length,
        totalPengumuman: dataPengumuman.length,
      });
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);

  return (
    <div className="flex  min-h-screen bg-[#F9FAFB]">
      <aside className="sticky top-0 h-screen">
            <SideBar/>
            </aside>
      
      <main className="flex-1 p-6 md:p-10 mt-[10%] md:mt-0">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard RT/RW</h1>
          <p className="text-gray-500">Kelurahan Jaya, Kecamatan Cihuy</p>
        </header>

        {/* Statistics Section */}
        <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Total Penduduk"
            value={stats.totalPenduduk}
            valueColor="text-blue-600"
            bgColor="bg-blue-50"
            icon={<User size={24} className="text-blue-600" />}
          />
          <StatCard
            title="Aktivitas Akan Datang"
            value={stats.aktivitasAkanDatang}
            valueColor="text-green-600"
            bgColor="bg-green-50"
            icon={<Calendar size={24} className="text-green-600" />}
          />
          <StatCard
            title="Total Pengumuman"
            value={stats.totalPengumuman}
            valueColor="text-purple-600"
            bgColor="bg-purple-50"
            icon={<Megaphone size={24} className="text-purple-600" />}
          />
        </section>

        {/* List Section */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <AktivitasTerbaru />
          <PengumumanTerbaru />
        </section>
      </main>
    </div>
  );
}