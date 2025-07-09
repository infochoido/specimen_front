import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LogInForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

   const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  try {
    const response = await axios.post(
      "https://specimenmanage.fly.dev/api/v1/auth/login",
      new URLSearchParams({
        grant_type: "password",
        username: formData.username,
        password: formData.password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: false, // 쿠키 안씀
      }
    );

    console.log("로그인 성공:", response.data);
    const token = response.data.access_token;
    console.log("토큰:", token);
    // 토큰을 상태와 로컬스토리지에 저장
    setToken(token);
    localStorage.setItem("access_token", token); // 토큰 저장
    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.detail || "로그인 실패");
  }
};


  return (
    <div className="login-form">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>아이디</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">로그인</button>
      </form>

      {token && (
        <div style={{ marginTop: '1rem', color: 'green' }}>
          ✅ 로그인 성공! 토큰: {token.access_token || JSON.stringify(token)}
        </div>
      )}
      {error && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          ❌ {Array.isArray(error) ? error[0]?.msg : error}
        </div>
      )}
    </div>
  );
};

export default LogInForm;
