// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance.js";
import { authService } from "../services/authService.js";
import useStore from "../store/useStore.js";

const AuthContext = createContext();

const SESSION_TOKEN_KEY = "myfinpal_session_token";
const ACTIVE_USER_KEY = "myfinpal_active_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem(SESSION_TOKEN_KEY) || null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Current Logged in User Profile (/api/auth/me)
  const fetchMe = async () => {
    const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
    const storedUserRaw = localStorage.getItem(ACTIVE_USER_KEY);

    if (!storedToken || !storedUserRaw) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    let localUser = null;
    try {
      localUser = JSON.parse(storedUserRaw);
    } catch (e) {}

    try {
      const res = await axiosInstance.get("/auth/me");
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setToken(storedToken);
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(res.data.user));
        useStore.getState().resetForUser(res.data.user.id || res.data.user._id || res.data.user.email);
      } else if (localUser) {
        setUser(localUser);
        setToken(storedToken);
        useStore.getState().resetForUser(localUser.id || localUser._id || localUser.email);
      }
    } catch (err) {
      // Offline/local fallback: Keep user logged in with stored credentials
      if (err.response && err.response.status === 401) {
        logout();
      } else if (localUser) {
        setUser(localUser);
        setToken(storedToken);
        useStore.getState().resetForUser(localUser.id || localUser._id || localUser.email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  // Step 1: Send OTP to Email
  const sendOtp = async (email) => {
    try {
      const res = await axiosInstance.post("/auth/send-otp", { email });
      return res.data;
    } catch (err) {
      if (err.response) throw err;
      return await authService.sendOtp(email);
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async (email, otp) => {
    try {
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
      const { token: jwtToken, user: userObj } = res.data;

      if (jwtToken && userObj) {
        setToken(jwtToken);
        setUser(userObj);
        localStorage.setItem(SESSION_TOKEN_KEY, jwtToken);
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userObj));
        useStore.getState().resetForUser(userObj.id || userObj._id || userObj.email);
      }
      return res.data;
    } catch (err) {
      if (err.response) throw err;
      const res = await authService.verifyOtp(email, otp);
      if (res && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        useStore.getState().resetForUser(res.user.id || res.user._id || res.user.email);
      }
      return res;
    }
  };

  // Resend OTP
  const resendOtp = async (email) => {
    try {
      const res = await axiosInstance.post("/auth/resend-otp", { email });
      return res.data;
    } catch (err) {
      if (err.response) throw err;
      return await authService.resendOtp(email);
    }
  };

  // Instant non-blocking Logout
  const logout = () => {
    // Notify API in background without blocking local logout execution
    axiosInstance.post("/auth/logout").catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(ACTIVE_USER_KEY);
    useStore.getState().clearStore();
  };

  // Direct Username/Password Login
  const loginWithPassword = async (identifier, password) => {
    const res = await authService.login(identifier, password);
    if (res && res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(SESSION_TOKEN_KEY, res.token);
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(res.user));
      useStore.getState().resetForUser(res.user.id || res.user._id || res.user.email);
    }
    return res;
  };

  // Google Login (Email Verification handled by Google)
  const loginWithGoogle = async (email, name) => {
    const res = await authService.loginWithGoogle(email, name);
    if (res && res.user && res.token) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(SESSION_TOKEN_KEY, res.token);
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(res.user));
      useStore.getState().resetForUser(res.user.id || res.user._id || res.user.email);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        sendOtp,
        verifyOtp,
        resendOtp,
        loginWithPassword,
        loginWithGoogle,
        logout,
        fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
