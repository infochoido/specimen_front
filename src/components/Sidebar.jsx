import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FlaskIcon,
  FilesIcon,
  ArchiveIcon,
  ListIcon,
  ChartIcon,
} from "../assets/Icons/Icons";
import SignUpModal from "./SignUpModal";
import LoginModal from "./LoginModal";

const menu = [
  { label: "대시보드", path: "/", icon: <ChartIcon /> },
  { label: "실험실 관리", path: "/lab", icon: <FlaskIcon /> },
  { label: "가검물 관리", path: "/specimen", icon: <FilesIcon /> },
  { label: "저장소 관리", path: "/storage", icon: <ArchiveIcon /> },
  { label: "로그 관리", path: "/logs", icon: <ListIcon /> },
];

const Sidebar = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔐 초기 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
  };

  return (
    <>
      <aside className="w-80 h-[80%] flex flex-col justify-between bg-[#f9fbf9] p-4 border-r">
        <nav className="flex flex-col gap-2">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? "bg-[#e9f1e9] text-[#101910]" : "text-[#101910]"
                }`
              }
            >
              <div>{item.icon}</div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* 🔄 로그인 상태에 따른 버튼 렌더링 */}
        <div className="pt-3 border-t mt-6">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 rounded-md  text-gray text-sm font-medium"
            >
              로그아웃
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full mb-2 px-4 py-2 rounded-md bg-white border border-[#d3e4d3] text-sm font-medium text-[#101910] hover:bg-[#e9f1e9]"
              >
                로그인
              </button>
              <button
                onClick={() => setShowSignUpModal(true)}
                className="w-full px-4 py-2 rounded-md bg-[#456e45] text-white text-sm font-medium hover:bg-[#456e45]"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </aside>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* 회원가입 모달 */}
      {showSignUpModal && (
        <SignUpModal onClose={() => setShowSignUpModal(false)} />
      )}
    </>
  );
};

export default Sidebar;
