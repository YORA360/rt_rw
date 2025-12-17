"use client"
import { useState,useEffect } from "react";
import {Users,Venus,Mars,BookUser} from "lucide-react"
import PendudukTable from "@/components/penduduktable";
import SideBar from "@/components/sidebar";
import { StatCard } from "@/components/statcard";



interface Penduduk{
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
      <SideBar/>
      <div className="flex-1 m-5">
        <div className="mx-5 my-5">
                <h1 className="text-[18px] text-black">Dashboard RT/RW</h1>
                <p className="text-gray-500">Kelurahan jaya, kecamatan cihuy</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div>
                    <StatCard
                     title="Total Penduduk"
                     value={penduduk.length}
                     icon={<Users className="text-blue-500"/>} 
                    />
                  </div>
                  <div>
                    <StatCard
                     title="Kepala Keluarga"
                     value={9}
                     bgColor="bg-green-50"
                     icon={<BookUser className="text-green-500"/>} 
                    />
                  </div>
                  <div>
                    <StatCard
                     title="Laki-laki"
                     value={5}
                     bgColor="bg-purple-50"
                     icon={<Mars className="text-purple-500"/>} 
                    />
                  </div>
                  <div>
                    <StatCard
                     title="Perempuan"
                     value={4}
                     bgColor="bg-pink-50"
                     icon={<Venus className="text-pink-500"/>} 
                    />
                  </div>
                </div>
            </div>
      <PendudukTable />
      </div>
    </div>
  );
}
