import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR REQUEST ---
// Otomatis menempelkan Token di setiap request
api.interceptors.request.use(
  (config) => {
    // Di Next.js, pastikan kita di sisi client (browser) sebelum akses localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        // Django Knox menggunakan "Token ", bukan "Bearer "
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTOR RESPONSE ---
// Menangani jika Token Expired (Server kirim 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika server merespon 401 (Unauthorized), artinya token sudah mati
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        alert("Sesi anda telah berakhir. Silakan login kembali.");
        
        // Bersihkan data auth
        localStorage.removeItem('token');
        Cookies.remove('token');
        Cookies.remove('role');
        
        // Redirect ke login
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;