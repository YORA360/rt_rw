"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const TIMEOUT_IN_MS = 30 * 60 * 1000; // 30 Menit

export default function AuthTimeout() {
  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    Cookies.remove("token");
    Cookies.remove("role");
    router.push("/auth/login");
  }, [router]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      // Cek apakah user sedang login sebelum set timer
      if (Cookies.get('token')) {
        timeoutId = setTimeout(handleLogout, TIMEOUT_IN_MS);
      }
    };

    // Event yang menandakan user "aktif"
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

    // Pasang listener
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Jalankan timer pertama kali

    return () => {
      // Bersihkan listener saat logout/unmount
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleLogout]);

  return null; // Komponen ini tidak merender apa-apa
}