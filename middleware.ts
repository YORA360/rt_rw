import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value; // Ambil role dari cookie
  const { pathname } = request.nextUrl;

  // 1. Jika TIDAK ada token dan mencoba akses halaman terproteksi
  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/user'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 2. Jika SUDAH login dan mencoba akses halaman Login/Register
  if (token && pathname.startsWith('/auth/login')) {
    if (role === 'WARGA') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // 3. PROTEKSI ROLE: Warga dilarang masuk area /admin
  if (pathname.startsWith('/admin') && role === 'WARGA') {
    // Kita arahkan ke rute yang sengaja tidak ada agar muncul 404 bawaan Next.js
    // atau kamu bisa buat page khusus di /404
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // 4. PROTEKSI ROLE: Admin/RT/RW mengakses area /user (Opsional)
  if (pathname.startsWith('/user') && role !== 'WARGA') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Masukkan semua rute yang ingin diproteksi
  matcher: [
    '/admin/:path*', '/user/:path*', '/auth/:path*',
     '/((?!api|_next/static|_next/image|favicon.ico).*)',

  ],

};