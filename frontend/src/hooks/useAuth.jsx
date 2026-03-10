import { useState, useEffect, createContext, useContext } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("matcha_token");
    const savedUser = localStorage.getItem("matcha_user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("matcha_token", token);
    localStorage.setItem("matcha_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("matcha_token");
    localStorage.removeItem("matcha_user");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.getMe();
      const updated = { ...data.user, ticketCount: data.ticketCount, totalRewards: data.totalRewards };
      localStorage.setItem("matcha_user", JSON.stringify(updated));
      setUser(updated);
      return updated;
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
