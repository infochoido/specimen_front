import React, { useEffect, useState } from "react";
import Sidebar from  "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

function AppWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    // 예: 토큰 검증 API 호출
    fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (res) => {
      if (res.status === 401) {
        // 토큰 만료
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        alert("세션이 만료되어 로그아웃되었습니다.");
        navigate("/login"); // 로그인 페이지로 강제 이동 (필요시)
      } else {
        setIsLoggedIn(true);
      }
    }).catch(() => {
      // 네트워크 오류 등도 로그아웃 처리
      localStorage.removeItem("access_token");
      setIsLoggedIn(false);
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f9fbf9] font-sans">
      <Sidebar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}   />
      <Outlet className="flex-1 p-6 overflow-y-auto"/>
    </div>
  );
}



export default AppWrapper;