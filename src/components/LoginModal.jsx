import React, { useState } from "react";
import API_BASE_URL from "../services/api";

export default function LoginModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 const handleLogin = async () => {
  if (!email || !password) {
    alert("이메일과 비밀번호를 입력해주세요.");
    return;
  }
  setLoading(true);
  try {
    // URLSearchParams를 사용해 form data 생성
    const formData = new URLSearchParams();
    formData.append("username", email);   // FastAPI 기본은 username 필드명임
    formData.append("password", password);

    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!res.ok) throw new Error("로그인 실패");

    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);

    alert("로그인 성공!");
    if (onLoginSuccess) onLoginSuccess();
    if (onClose) onClose();
  } catch (err) {
    alert("로그인 실패");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded shadow-md w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4">로그인</h2>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#578e58] hover:bg-[#456e45] text-white py-2 rounded font-semibold disabled:opacity-50"
        >
          로그인
        </button>
        <button
          onClick={onClose}
          className="mt-3 w-full border border-gray-300 rounded py-2 hover:bg-gray-100"
        >
          취소
        </button>
      </div>
    </div>
  );
}
