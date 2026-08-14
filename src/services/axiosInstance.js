// src/services/axiosInstance.js
import axios from "axios";

const PRIMARY_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FALLBACK_API_URL = "https://expensetracker-4jb3.onrender.com/api";
const SESSION_TOKEN_KEY = "myfinpal_session_token";

const axiosInstance = axios.create({
  baseURL: PRIMARY_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized & Fallback to Live Cloud API if Local Server is Offline
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If local backend is offline (Network Error / ECONNREFUSED) and not already retried
    if (!error.response && error.config && !error.config._isRetry) {
      error.config._isRetry = true;
      try {
        return await axios.request({
          ...error.config,
          baseURL: FALLBACK_API_URL,
        });
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem("myfinpal_active_user");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
