"use client"
import AktivitasList from "@/components/AktivitasTable"
import { StatCard } from "@/components/statcard";
import SideBar from "@/components/sidebar";
import { Calendar, CircleAlert, CircleCheck } from "lucide-react";


export default function Page(){

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
                     title="Total Penduduk"
                     value={12}
                     valueColor="text-blue-500"
                     bgColor="bg-blue-50"
                     icon={<Calendar className="text-blue-500"/>} 
                    />
                  </div>
                  <div>
                    <StatCard
                     title="Kepala Keluarga"
                       value={12}
                     valueColor="text-green-500"
                     bgColor="bg-green-50"
                     icon={<CircleAlert className="text-green-500"/>} 
                    />
                  </div>
                  <div>
                    <StatCard
                     title="Laki-laki"
                     value={12}
                     valueColor="text-purple-500"
                     bgColor="bg-purple-50"
                     icon={<CircleCheck className="text-purple-500"/>} 
                    />
                  </div>                  
                </div>
            </div>
      <AktivitasList/>
      </div>
    </div>
  );
}

