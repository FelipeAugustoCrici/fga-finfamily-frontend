import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 1000 * 30,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_e) {
      // token not available, proceed without auth header
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);
