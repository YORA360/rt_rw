"use client"
import PengumumanList from "@/components/pengumumanlist";
import { StatCard } from "@/components/statcard";
import SideBar from "@/components/sidebar";
import { useEffect, useState } from "react";
import { Calendar, CircleAlert, CircleCheck } from "lucide-react";

interface Aktivitas {
  id: number;
  judul: string;
  kategori: string;
  status: "AKAN_DATANG" | "BERLANGSUNG" | "SELESAI";
  deskripsi: string;
  tanggal: string;
  jam: string;
  tempat: string;
  penyelenggara: string;
  peserta?: number;
}


export default function Page(){

  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
    
      useEffect(() => {
        const fetchAktivitas = async () => {
          const token = localStorage.getItem("token");
          if (!token) return;
    
          try {
            const res = await fetch("http://127.0.0.1:8000/api/aktivitas/", {
              headers: {
                Authorization: `Token ${token}`,
              },
            });
    
            if (!res.ok) throw new Error("Fetch gagal");
            setAktivitas(await res.json());
          } catch (err) {
            console.error(err);
          }
        };
    
        fetchAktivitas();
      }, []);

    return(
<div className="flex min-h-screen bg-[#F9FAFB]">
      <SideBar/>
      <div className="flex-1 m-5">
        <div className=" my-5">
                <h1 className="text-[18px] text-black">Dashboard RT/RW</h1>
                <p className="text-gray-500">Kelurahan jaya, kecamatan cihuy</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div>
                    <StatCard
                     title="Total Aktivitas"
                    value={aktivitas.length}
                     valueColor="text-blue-500"
                     bgColor="bg-blue-50"
                     icon={<Calendar className="text-blue-500"/>} 
                    />
                  </div>
                  <div>
                    <StatCard
                     title="akan Datang"
                     value={aktivitas.filter(a => a.status === "AKAN_DATANG").length}
                     valueColor="text-green-500"
                     bgColor="bg-green-50"
                     icon={<CircleAlert className="text-green-500"/>} 
                    />
                  </div>
                  <div>
                    <StatCard
                     title="Selesai"
                     value={aktivitas.filter(a => a.status === "SELESAI").length}
                     valueColor="text-purple-500"
                     bgColor="bg-purple-50"
                     icon={<CircleCheck className="text-purple-500"/>} 
                    />
                  </div>                  
                </div>
            </div>
      <PengumumanList/>
      </div>
    </div>
  );
}

