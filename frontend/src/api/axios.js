import axios from 'axios';

export const authApi = axios.create({
  baseURL: 'http://localhost:5000/auth',
  timeout: 30000,
});

export const securityApi = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 30000,
});

// Interceptor to dynamically attach JWT token
const authInterceptor = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Existing Family Mode Logic
  const isElderly = localStorage.getItem('familyMode') === 'true';
  if (isElderly) {
    if (config.data instanceof FormData) {
      config.data.append('is_elderly', 'true');
    } else if (config.method === 'post' || config.method === 'put') {
      config.data = { ...config.data, is_elderly: true };
    } else if (config.method === 'get') {
      config.params = { ...config.params, is_elderly: true };
    }
  }
  return config;
};

authApi.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
securityApi.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

// Security Endpoints (Python)
export const fetchRegulatoryFeed = () => securityApi.get('/security/fetch-circulars');
export const analyzeRegulatoryCircular = async (circular_id, title) => {
  return await securityApi.post('/security/analyze-circular', { circular_id, title, mode: "hybrid" });
};
export const maskData = (rawText) => securityApi.post('/security/mask-data', { raw_data: rawText });
export const scanUrl = (url) => securityApi.post('/security/scan-url', { url: url });
export const scanDocument = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return securityApi.post('/security/scan-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Migrated Endpoint (Now points to Python Security API instead of Node Auth API)
export const verifyDocument = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return securityApi.post('/security/verify-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export default securityApi;