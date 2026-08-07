// src/services/axiosInstance.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SESSION_TOKEN_KEY = "myfinpal_session_token";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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

// Response Interceptor: Handle 401 Unauthorized Session Expired
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem("myfinpal_active_user");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
