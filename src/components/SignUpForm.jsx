import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUpForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  try {
    const resSignUp = await fetch("https://specimenmanage.fly.dev/api/v1/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!resSignUp.ok) {
      const errData = await resSignUp.json();
      throw new Error(errData.message || "회원가입 실패");
    }

    const loginFormData = new URLSearchParams();
    loginFormData.append("username", formData.email);
    loginFormData.append("password", formData.password);

    const resLogin = await fetch("https://specimenmanage.fly.dev/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: loginFormData.toString(),
      credentials: "include",
    });

    if (!resLogin.ok) {
      const errData = await resLogin.json();
      throw new Error(errData.message || "로그인 실패");
    }

    const loginData = await resLogin.json();

    // ✅ 토큰 저장
    localStorage.setItem("access_token", loginData.access_token);
    localStorage.setItem("user_id", loginData.user.id);

    alert(`회원가입 및 로그인 성공! 환영합니다, ${formData.name}님.`);
    navigate(`/labs/setup?userId=${loginData.user.id}`);
  } catch (err) {
    setError(err.message);
  }
};


  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-md mx-auto">
      <input
        name="name"
        placeholder="이름"
        value={formData.name}
        onChange={handleChange}
        required
        className="border p-2 w-full"
      />
      <input
        name="email"
        type="email"
        placeholder="이메일"
        value={formData.email}
        onChange={handleChange}
        required
        className="border p-2 w-full"
      />
      <input
        type="password"
        name="password"
        placeholder="비밀번호"
        value={formData.password}
        onChange={handleChange}
        required
        className="border p-2 w-full"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded w-full"
      >
        회원가입
      </button>
    </form>
  );
}

export default SignUpForm;
