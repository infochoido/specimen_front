import React from "react";
import { Menu } from "lucide-react"; // 아이콘 라이브러리 설치 필요: `npm install lucide-react`

export default function Header({ toggleSidebar }) {
  return (
    <header className="bg-[#f8fbf8] shadow-md z-10">
      <div className="mx-auto px-6 py-2 flex gap-4 items-center">
        <button onClick={toggleSidebar} className="text-[#101910] focus:outline-none">
          <Menu size={28} />
        </button>
        <h1 className="text-2xl font-bold text-[#101910]">가검물 관리 프로그램</h1>
        <div className="w-7" /> 
      </div>
    </header>
  );
}
