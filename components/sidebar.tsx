"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Calendar, Megaphone, Wallet, Store, Users, LogOut, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function SideBar() {
    const path = usePathname();
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false)
    
    
    useEffect(() => {
        const userRole = Cookies.get('role');
        setRole(userRole || 'WARGA');
    }, []);

    const prefix = role === "WARGA" ? "/user" : "/admin";

    const menu = [
        { name: "Dashboard", icon: Home, href: `${prefix}/dashboard` },
        { name: "Penduduk", icon: Users, href: `${prefix}/penduduk`, adminOnly: true },
        { name: "KK", icon: Users, href: `${prefix}/kk`, adminOnly: true },
        { name: "Keluarga", icon: Users, href: `${prefix}/keluarga` },
        { name: "Aktivitas", icon: Calendar, href: `${prefix}/aktivitas` },
        { name: "Pengumuman", icon: Megaphone, href: `${prefix}/pengumuman` },
        { name: "Iuran", icon: Wallet, href: `${prefix}/iuran` },
        { name: "Toko Bersama", icon: Store, href: `${prefix}/toko` },
    ];

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('role');
        localStorage.clear();
        router.push('/auth/login');
    };

    return (
        <>
            {/* MOBILE HEADER */}
            <div className="md:hidden fixed top-0 left-0 w-full bg-white border-b border-gray-300 p-4 flex justify-between items-center z-50">
                <h1 className="text-blue-600 font-bold">Sipakerte.id</h1>
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-1">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* OVERLAY & SIDEBAR */}
            <div className={`fixed inset-0 z-40 md:relative md:z-0 transition-all duration-300 
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                
                {/* Backdrop Hitam Transparan (Hanya di HP) */}
                {isOpen && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
                )}

                <aside className="relative w-64 md:w-56 h-screen border-r border-gray-300 bg-white flex flex-col justify-between">
                    <div>
                        <div className="border-b border-gray-300 py-4 px-6 mb-2 flex justify-between items-center">
                            <div>
                                <h1 className="text-blue-600 font-bold text-[16px]">Sipakerte.id</h1>
                                <p className="text-gray-500 text-[10px] uppercase font-semibold">Role: {role}</p>
                            </div>
                        </div>

                        <nav className="px-3 space-y-1">
                            {menu.map((item) => {
                                if (item.adminOnly && role === "WARGA") return null;
                                const Icon = item.icon;
                                const active = path.startsWith(item.href);
                                return (
                                    <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                        ${active ? "bg-blue-50 text-blue-600 font-bold" : "text-[14px] text-gray-600 hover:bg-gray-50"}`}>
                                        <Icon size={18} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-gray-100">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 rounded-xl text-[14px]">
                            <LogOut size={18} />
                            <span>Keluar</span>
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}