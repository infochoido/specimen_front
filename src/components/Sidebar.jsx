import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FlaskIcon,
  FilesIcon,
  ArchiveIcon,
  ListIcon,
  ChartIcon,
  BellIcon
} from "../assets/Icons/Icons";
import SignUpModal from "./SignUpModal";
import LoginModal from "./LoginModal";
import Alert from "./alert"; // ✅ 추가


const menu = [
  { label: "대시보드", path: "/", icon: <ChartIcon /> },
  { label: "실험실 관리", path: "/lab", icon: <FlaskIcon /> },
  { label: "전체 샘플 관리", path: "/specimen", icon: <FilesIcon /> },
  { label: "저장소 관리", path: "/storage", icon: <ArchiveIcon /> },
  { label: "로그 관리", path: "/logs", icon: <ListIcon /> },
];

const Sidebar = ({ isLoggedIn, setIsLoggedIn }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // ✅ 알림 상태

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

        <div className="pt-3 border-t mt-6">
          {isLoggedIn ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {/* ✅ 알림 버튼 */}
                <button
                  onClick={() => setShowAlert(!showAlert)}
                  className="px-4 py-2  text-sm font-medium text-[#0e1a0f] hover:bg-[#e4eee4] rounded-md flex items-center gap-2"
                >
                  <BellIcon className="w-5 h-5" />
                </button>
                {/* 로그아웃 버튼 */}
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 rounded-md bg-white border border-[#d3e4d3] text-sm font-medium text-[#0e1a0f] hover:bg-[#f4f4f4]"
                >
                  로그아웃
                </button>
              </div>

              {/* ✅ 알림 내용 표시 */}
              {showAlert && <Alert />}
            </div>
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

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showSignUpModal && (
        <SignUpModal onClose={() => setShowSignUpModal(false)} />
      )}
    </>
  );
};

export default Sidebar;
