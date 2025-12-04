import axios from 'axios';

// Ganti sesuai URL backend kamu
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/auth'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token'); // Kita simpan key 'token' saja
      if (token) {
        // PERHATIKAN: Knox defaultnya pakai "Token", bukan "Bearer"
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;