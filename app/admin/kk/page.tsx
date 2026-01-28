"use client";
import { useState, useEffect } from "react";
import { Home, Users, UserCheck, MapPin } from "lucide-react";
import KeluargaAdminTable from "@/components/keluargaAdminTable";
import SideBar from "@/components/sidebar";
import { StatCard } from "@/components/statcard";

interface Keluarga {
  id: number;
  no_kk: string;
  kepala_keluarga: string; // Didapat dari anggota berkode "KK"
  alamat_kk: string;
  jumlah_anggota: number;
}

export default function KeluargaPage() {
  const [keluarga, setKeluarga] = useState<Keluarga[]>([]);

  useEffect(() => {
    const fetchKeluarga = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Endpoint ini harus mengembalikan list Keluarga beserta info ringkasnya
        const res = await fetch("http://127.0.0.1:8000/api/keluarga/", {
          headers: { Authorization: `Token ${token}` },
        });

        if (!res.ok) throw new Error("Fetch gagal");
        setKeluarga(await res.json());
      } catch (err) {
        console.error(err);
      }
    };

    fetchKeluarga();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <aside className="sticky top-0 h-screen">
            <SideBar/>
            </aside>
      <div className="flex-1 m-5">
        <div className="my-5">
          <h1 className="text-[18px] text-black font-bold">Manajemen Data Keluarga (KK)</h1>
          <p className="text-gray-500">Kelurahan Jaya, Kecamatan Cihuy</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
            <StatCard
              title="Total Kartu Keluarga"
              value={keluarga.length}
              valueColor="text-blue-600"
              bgColor="bg-blue-50"
              icon={<Home className="text-blue-600" />}
            />
            <StatCard
              title="Total Jiwa"
              value={keluarga.reduce((acc, curr) => acc + curr.jumlah_anggota, 0)}
              valueColor="text-orange-600"
              bgColor="bg-orange-50"
              icon={<Users className="text-orange-600" />}
            />
            <StatCard
              title="KK Terverifikasi"
              value={keluarga.length} // Sesuaikan logic jika ada status verifikasi KK
              valueColor="text-green-600"
              bgColor="bg-green-50"
              icon={<UserCheck className="text-green-600" />}
            />
            <StatCard
              title="Cakupan RT"
              value="08"
              valueColor="text-purple-600"
              bgColor="bg-purple-50"
              icon={<MapPin className="text-purple-600" />}
            />
          </div>
        </div>
        <KeluargaAdminTable />
      </div>
    </div>
  );
}