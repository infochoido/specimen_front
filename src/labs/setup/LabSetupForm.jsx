import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function LabSetupForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId");

  const [formData, setFormData] = useState({
    labName: "",
    labLocation: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1) localStorage에서 토큰 가져오기
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("로그인이 필요합니다.");

      // 2) 새 실험실 생성
      const resLab = await fetch("https://specimenmanage.fly.dev/api/v1/labs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.labName,
          location: formData.labLocation,
        }),
      });

      if (!resLab.ok) {
        const errData = await resLab.json();
        throw new Error(errData.message || "실험실 생성 실패");
      }

      const newLab = await resLab.json();

      // 3) 사용자 정보에 실험실 ID 업데이트
      const resUser = await fetch(
        `https://specimenmanage.fly.dev/api/v1/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ lab_id: newLab.id,
            role:"lab_admin"
           }),
        }
      );

      if (!resUser.ok) {
        const errData = await resUser.json();
        throw new Error(errData.message || "사용자 실험실 정보 업데이트 실패");
      }

      alert("실험실 정보 등록 완료!");
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto space-y-4">
      <input
        name="labName"
        placeholder="실험실 이름"
        value={formData.labName}
        onChange={handleChange}
        required
        className="border p-2 w-full"
      />
      <input
        name="labLocation"
        placeholder="실험실 위치"
        value={formData.labLocation}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        type="submit"
        className="bg-green-600 text-white p-2 rounded w-full"
      >
        실험실 정보 등록
      </button>
    </form>
  );
}

export default LabSetupForm;
