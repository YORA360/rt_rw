"use client"


import React from "react";
import  Link from "next/link";
import {Home,Calendar,Megaphone,Wallet,Store, } from "lucide-react"
import { usePathname } from "next/navigation";


export default function SideBar(){
    const path = usePathname();
 
    const menu = [
        {name:"Dasboard", icon: Home, href: "/dashboard"},
        {name:"Aktivitas RT/RW", icon: Calendar, href: "/aktivitas"},
        {name:"Pengumuman", icon: Megaphone, href: "/pengumuman"},
        {name:"Iuran", icon: Wallet, href: "/iuran"},
        {name:"Toko Bersama", icon: Store, href: "/toko"},

    ];
    return(
        <aside className="w-48 h-screen border-gray-300 border-r-[1px] bg-white flex flex-col justify-between">
        {/* top brand */}
        <div className="">
            <div className="border-gray-300 border-b-[1px] py-3 px-4">
                <h1 className="  text-blue-600 text-[14px]">Sipakerte.id</h1>
                <p className="text-gray-500 text-[11px]">Sistem Informasi RT/RW</p>
            </div>
        {/* menu */}
        <nav className="px-2">
            {menu.map((item) =>{
                const Icon = item.icon;
                const active = path === item.href;

                return(
                    <Link 
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition
                    ${
                    active
                    ? "bg-blue-50 text-blue-600"
                    : "text-[14px] text-gray-700 hover:bg-gray-100"}
                    
                    `}
                    >
                        <Icon size={15}/>
                        <span>{item.name}</span>
                    </Link>
                );
            })}

        </nav>
        </div>

        </aside>
    )
}