import React, { useEffect, useState } from "react";
import Sidebar from  "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";
import { AuthProvider } from "../context/AuthContext";



function AppWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null: 확인 중, true: 로그인, false: 비로그인
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (res) => {
      if (res.status === 401) {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        alert("세션이 만료되어 로그아웃되었습니다.");
        navigate("/dashboard"); // 로그인 팝업 유도 위치
      } else {
        setIsLoggedIn(true);
      }
    }).catch(() => {
      localStorage.removeItem("access_token");
      setIsLoggedIn(false);
    });
  }, []);

  // 로그인 여부 확인 중일 때는 아무것도 렌더링하지 않음
  if (isLoggedIn === null) {
    return <div className="w-full h-screen flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <AuthProvider>
    <div className="flex min-h-screen bg-[#f9fbf9] font-sans">
      <Sidebar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Outlet className="flex-1 p-6 overflow-y-auto" />
    </div>
    </AuthProvider>
  );
}
export default AppWrapper;