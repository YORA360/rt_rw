"use client";

import SideBar from "@/components/sidebar";
import { Users, Calendar, Megaphone, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/statcard";

interface Penduduk {
  id: number;
  nik: string;
  nama: string;
  jenis_kelamin: "L" | "P";
  alamat: string;
  pekerjaan: string;
  status: "KK" | "Anggota" | string;
}

export default function Page() {
  const [penduduk, setPenduduk] = useState<Penduduk[]>([]);

  useEffect(() => {
    const fetchPenduduk = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://127.0.0.1:8000/api/penduduk/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (!res.ok) throw new Error("Fetch gagal");
        setPenduduk(await res.json());
      } catch (err) {
        console.error(err);
      }
    };

    fetchPenduduk();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <SideBar />

      <main className="flex-1 p-6">
        <h1 className="text-lg font-semibold">Dashboard RT/RW</h1>
        <p className="text-sm text-gray-500 mb-6">
          Kelurahan Jaya, Kecamatan Cihuy
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Penduduk"
            value={penduduk.length}
            icon={<Users className="text-blue-500 "  />}
          />
          <div>
          <StatCard
            title="Aktivitas Bulan Ini"
            value={120}
            bgColor="bg-green-50"
            icon={<Calendar className="text-green-500 "  />}
          />
          </div>
          <StatCard
            title="Pengumuman Aktif"
            value={180}
            bgColor="bg-purple-50"
            icon={<Megaphone className="text-purple-500" />}
          />

          <StatCard
            
            title="Iuran Terkumpul"
            value={162}
            bgColor="bg-orange-50"
            icon={<Wallet className="text-orange-500" />}
            
          />
        </div>
      </main>
    </div>
  );
}
