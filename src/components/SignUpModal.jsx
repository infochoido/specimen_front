import React, { useState } from "react";
import LabSelectStep from "./LabSelectStep";
import API_BASE_URL from "../services/api";

const SignUpModal = ({ onClose }) => {
  const [step, setStep] = useState("signup");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });

  const [userId, setUserId] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 회원가입 + 로그인 처리 함수
  const handleSignup = async () => {
    try {
      // 1. 회원가입
      const resSignup = await fetch(`${API_BASE_URL}/api/v1/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 쿠키 포함
        body: JSON.stringify({
          ...formData,
          role: "user",
          provider: "local",
        }),
      });

      if (!resSignup.ok) throw new Error("Signup failed");

      const signupResult = await resSignup.json();
      setUserId(signupResult.id);

      // 2. 로그인
        const formBody = new URLSearchParams({
        grant_type: "password",
        username: formData.email,
        password: formData.password,
        scope: "",
        client_id: "",
        client_secret: "",
        });

        const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody.toString(),
        });

      if (!res.ok) throw new Error("로그인 실패");
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      // 로그인 성공하면 실험실 선택 단계로 이동
      setStep("lab");
    } catch (err) {
      console.error(err);
      alert(err.message || "회원가입 또는 로그인 실패!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <div className="bg-white dark:bg-[#f0f5f0] w-full max-w-md rounded-xl shadow-lg p-8 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition"
          aria-label="Close"
        >
          ✖
        </button>

        {step === "signup" ? (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-extrabold text-[#101910] mb-4 text-center">
              회원가입
            </h2>
            <input
              name="email"
              type="email"
              placeholder="이메일"
              onChange={handleChange}
              className="border border-[#d3e4d3] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#578e58] placeholder:text-[#a0a0a0]"
              autoComplete="email"
              required
            />
            <input
              name="name"
              type="text"
              placeholder="이름"
              onChange={handleChange}
              className="border border-[#d3e4d3] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#578e58] placeholder:text-[#a0a0a0]"
              autoComplete="name"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="비밀번호"
              onChange={handleChange}
              className="border border-[#d3e4d3] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#578e58] placeholder:text-[#a0a0a0]"
              autoComplete="new-password"
              required
            />
            <button
              onClick={handleSignup}
              className="bg-[#578e58] hover:bg-[#456e45] text-white font-semibold py-3 rounded-md transition-shadow shadow-md hover:shadow-lg"
            >
              회원가입
            </button>
          </div>
        ) : (
          <LabSelectStep userId={userId} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default SignUpModal;
