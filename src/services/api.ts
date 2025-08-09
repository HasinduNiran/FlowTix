import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of requests to be retried after token refresh
interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}
let failedRequestsQueue: QueueItem[] = [];

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    
    // Add content type if it's missing
    if (!originalRequest.headers['Content-Type']) {
      originalRequest.headers['Content-Type'] = 'application/json';
    }
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Mark this request as a retry to prevent infinite loops
      originalRequest._retry = true;
      
      // If we're already refreshing the token, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }
      
      isRefreshing = true;
      
      try {
        // Try to refresh the token
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/refresh-token`, {}, {
          withCredentials: true // Important for cookies
        });
        
        const { accessToken } = response.data.data;
        
        // Update the token
        Cookies.set('auth-token', accessToken, { expires: 7 });
        
        // Process queued requests with the new token
        failedRequestsQueue.forEach(request => {
          request.resolve(accessToken);
        });
        
        // Clear the queue
        failedRequestsQueue = [];
        
        // Update the header and retry the original request
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, reject all queued requests
        failedRequestsQueue.forEach(request => {
          request.reject(refreshError);
        });
        
        // Clear the queue
        failedRequestsQueue = [];
        
        // Logout user
        Cookies.remove('auth-token');
        localStorage.removeItem('user');
        
        // Redirect to login page if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?session=expired';
        }
        
        return Promise.reject(refreshError);
      } finally {
        // Reset the refreshing flag
        isRefreshing = false;
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    // Return a standardized error format
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default api; 