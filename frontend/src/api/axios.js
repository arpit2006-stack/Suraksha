import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 30000,
});

// Attach is_elderly flag for Family Mode on every request
api.interceptors.request.use((config) => {
  const isElderly = localStorage.getItem('familyMode') === 'true';
  if (isElderly) {
    if (config.method === 'post' && config.data instanceof FormData) {
      config.data.append('is_elderly', 'true');
    } else if (config.method === 'post' && config.data) {
      config.data = { ...config.data, is_elderly: true };
    }
  }
  return config;
});

export default api;
