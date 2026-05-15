import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 30000,
});

// --- REGULATORY LOOP ENDPOINTS ---

// 1. Fetch the list of circulars (Live + Local)
export const fetchRegulatoryFeed = () => api.get('/security/fetch-circulars');

// 2. Specific Analysis (The JSON payload you asked about)
export const analyzeRegulatoryCircular = async (circular_id, title) => {
  const payload = {
    circular_id: circular_id,
    title: title,
    mode: "hybrid"
  };
  return await api.post('/security/analyze-circular', payload);
};

// --- THEME 1 & 2 HELPER FUNCTIONS ---

// Document Forgery Detection (PDF Upload)
export const verifyDocument = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/auth/verify-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// PII Data Masking
export const maskData = (rawText) => api.post('/security/mask-data', { raw_data: rawText });

// Phishing URL Scanner
export const scanUrl = (url) => api.post('/security/scan-url', { url: url });


// --- INTERCEPTORS (Phase 5: Elderly/Family Mode) ---

api.interceptors.request.use((config) => {
  // LocalStorage se check karega ki "Family Mode" on hai ya nahi
  const isElderly = localStorage.getItem('familyMode') === 'true';
  
  if (isElderly) {
    // Agar File Upload (FormData) hai
    if (config.data instanceof FormData) {
      config.data.append('is_elderly', 'true');
    } 
    // Agar Normal JSON request hai
    else if (config.method === 'post' || config.method === 'put') {
      config.data = { ...config.data, is_elderly: true };
    }
    // Agar GET request hai toh query param mein jod do
    else if (config.method === 'get') {
      config.params = { ...config.params, is_elderly: true };
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;