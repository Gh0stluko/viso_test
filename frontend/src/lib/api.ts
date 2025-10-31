import axios from 'axios';

const api = axios.create({
  baseURL: typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
    : 'http://backend:4000',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const requestUrl: string = (error.config?.url as string) || '';
      const onAuthPage = currentPath.startsWith('/auth/');
      const isAuthApiCall = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

      if (onAuthPage || isAuthApiCall) {
        return Promise.reject(error);
      }

      localStorage.setItem('redirectAfterLogin', currentPath);
      window.location.replace('/auth/login');
      return;
    }
    return Promise.reject(error);
  },
);

export default api;