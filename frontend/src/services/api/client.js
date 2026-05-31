import axios from 'axios';

// Create a reusable API client instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle global errors and token refresh
apiClient.interceptors.response.use(
  (response) => response.data, // Unwrap response data directly
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/login/access-token') {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          const retryRes = await axios(originalRequest);
          return retryRes.data;
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Use base axios to avoid interceptor loops
          const res = await axios.post(`${apiClient.defaults.baseURL}/login/refresh`, {
            refresh_token: refreshToken
          });
          
          if (res.data?.access_token) {
            localStorage.setItem('token', res.data.access_token);
            if (res.data.refresh_token) {
              localStorage.setItem('refresh_token', res.data.refresh_token);
            }
            
            processQueue(null, res.data.access_token);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
            const retryRes = await axios(originalRequest);
            return retryRes.data; // Unwrap since original caller expects data
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Refresh token invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available, just log out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 401) {
      // If we got 401 on login or already retried
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      if (originalRequest.url !== '/login/access-token') {
        window.location.href = '/login';
      }
    }
    
    // Standardize error message
    let errorMessage = error.message || 'An error occurred';
    const detail = error.response?.data?.detail;
    if (detail) {
      if (Array.isArray(detail)) {
        errorMessage = detail.map(d => `${d.loc.slice(-1)}: ${d.msg}`).join(', ');
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      } else {
        errorMessage = JSON.stringify(detail);
      }
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
