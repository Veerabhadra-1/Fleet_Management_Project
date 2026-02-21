import React, { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getStorage = () => {
    try {
      if (localStorage.getItem("fleetflow_token")) return localStorage;
      if (sessionStorage.getItem("fleetflow_token")) return sessionStorage;
    } catch (e) {}
    return null;
  };

  useEffect(() => {
    const storage = getStorage();
    const token = storage?.getItem("fleetflow_token");
    if (!token) {
      setLoading(false);
      return;
    }
    client
      .get("/api/auth/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("fleetflow_token");
        localStorage.removeItem("fleetflow_user");
        sessionStorage.removeItem("fleetflow_token");
        sessionStorage.removeItem("fleetflow_user");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("fleetflow_unauthorized", handler);
    return () => window.removeEventListener("fleetflow_unauthorized", handler);
  }, []);

  const login = async (email, password, remember = true) => {
    const res = await client.post("/api/auth/login", { email, password });
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("fleetflow_token", res.data.token);
    storage.setItem("fleetflow_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("fleetflow_token");
    localStorage.removeItem("fleetflow_user");
    sessionStorage.removeItem("fleetflow_token");
    sessionStorage.removeItem("fleetflow_user");
    setUser(null);
  };

  const hasRole = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
