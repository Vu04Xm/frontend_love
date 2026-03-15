import axios from 'axios';

// Lấy URL Backend từ biến môi trường (Render) hoặc dùng localhost nếu ở máy cá nhân
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
});

// Bạn có thể thêm các cấu hình như Token Header ở đây nếu cần trong tương lai
api.interceptors.request.use((config) => {
  // Ví dụ: config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  return config;
});

export default api;