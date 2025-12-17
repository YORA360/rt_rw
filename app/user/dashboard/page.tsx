"use client"

import SideBar from "@/components/sidebar"
import {Users} from "lucide-react"

export default function page() {
    return(
        <>
        <div className="flex min-h-screen bg-[#F9FAFB]">
            <SideBar/>
            <div className="mx-5 my-5">
                <h1 className="text-[18px]">Dashboard RT/RW</h1>
                <p>Kelurahan jaya, kecamatan cihuy</p>
                <div className="w-full grid grid-cols-4 space-between gap-8">
                    <div className="border border-gray-300 rounded-xl bg-white flex items-center justify-center justify-between p-5 conten-between gap-5">
                        <div>
                        <p>Total Penduduk</p>
                        <p>342</p>
                        </div>
                        <div className="flex items-center justify-center w-12 rounded-xl bg-blue-50">
                        <Users className=" text-blue-500"></Users>
                        </div>
                    </div>
                    <div className="border border-gray-300 rounded-xl bg-white flex items-center justify-center justify-between p-5 conten-between gap-5">
                        <div>
                        <p>Total Penduduk</p>
                        <p>342</p>
                        </div>
                        <div className="flex items-center justify-center w-12 rounded-xl bg-blue-50">
                        <Users className=" text-blue-500"></Users>
                        </div>
                    </div>
                    <div className="border border-gray-300 rounded-xl bg-white flex items-center justify-center justify-between p-5 conten-between gap-5">
                        <div>
                        <p>Total Penduduk</p>
                        <p>342</p>
                        </div>
                        <div className="flex items-center justify-center w-12 rounded-xl bg-blue-50">
                        <Users className=" text-blue-500"></Users>
                        </div>
                    </div>
                    <div className="border border-gray-300 rounded-xl bg-white flex items-center justify-center justify-between p-5 conten-between gap-5">
                        <div>
                        <p>Total Penduduk</p>
                        <p>342</p>
                        </div>
                        <div className="flex items-center justify-center w-12 rounded-xl bg-blue-50 ">
                        <Users className=" text-blue-500 text-xl"></Users>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}