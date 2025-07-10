// hooks/useAuth.js
import { useEffect, useState } from "react";
import axios from "axios";

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 쿠키 포함 요청
    axios
      .get("/api/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  return { user, isAuthenticated: !!user };
};

export default useAuth;
