// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

// Simple mock authentication context – stores a dummy user object.
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // In a real app you would check a token; here we just simulate a login.
  const login = (username) => {
    const mockUser = { id: "user-1", name: username };
    setUser(mockUser);
    localStorage.setItem("mockUser", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mockUser");
  };

  // Load persisted mock user on mount
  useEffect(() => {
    const stored = localStorage.getItem("mockUser");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
