import React, { useEffect, useState } from "react";
import Sidebar from  "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/Header";



function AppWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null: 확인 중, true: 로그인, false: 비로그인
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <div className="flex flex-col min-h-screen bg-[#f9fbf9] font-sans">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 h-screen overflow-hidden">
          {/* 사이드바: width transition 적용, overflow-hidden으로 내용 숨김 */}
          <div
            className={`flex flex-col bg-white shadow-md overflow-hidden
              transition-[width] duration-300 ease-in-out
              ${sidebarOpen ? "w-80" : "w-0"}`}
          >
            {/* 사이드바 내용, width가 0일 때 안 보이도록 */}
            {sidebarOpen && (
              <Sidebar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            )}
          </div>

          {/* 메인 영역 */}
          <main className="flex-1 px-6 overflow-y-auto h-full">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

export default AppWrapper;