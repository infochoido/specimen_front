// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import API_BASE_URL from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [user, setUser] = useState(null);

  const checkLogin = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        return;
      }

      const data = await res.json();
      setUser(data);
      setIsLoggedIn(true);
    } catch (err) {
      localStorage.removeItem("access_token");
      setIsLoggedIn(false);
      console.error("로그인 상태 확인 중 오류 발생:", err);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, checkLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
