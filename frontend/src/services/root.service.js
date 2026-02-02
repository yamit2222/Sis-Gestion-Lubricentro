import axios from 'axios';
import cookies from 'js-cookie';
const API_URL = import.meta.env.VITE_BASE_URL || 'https://elsocio.up.railway.app/api';

console.log('🔍 API_URL:', API_URL);
console.log('🔍 VITE_BASE_URL:', import.meta.env.VITE_BASE_URL);


const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = cookies.get('jwt-auth', { path: '/' });
    if(token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
