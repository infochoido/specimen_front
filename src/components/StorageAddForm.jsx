import { useState } from "react";

function StorageAddForm({ onStorageAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    photo_url: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 토큰 가져오기 (쿠키 기반 인증이면 필요없음)
      const token = localStorage.getItem("access_token");

      const res = await fetch("https://specimenmanage.fly.dev/api/v1/storages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
        credentials: "include", // 쿠키 인증용 옵션 (필요하면)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "저장소 추가 실패");
      }

      const newStorage = await res.json();

      alert("저장소가 성공적으로 추가되었습니다!");
      setFormData({ name: "", location: "", photo_url: "" });

      if (onStorageAdded) onStorageAdded(newStorage);

    } catch (err) {
      console.log(formData)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto space-y-4 border rounded">
      <input
        name="name"
        placeholder="저장소 이름"
        value={formData.name}
        onChange={handleChange}
        required
        className="border p-2 w-full"
        disabled={loading}
      />
      <input
        name="location"
        placeholder="저장소 위치"
        value={formData.location}
        onChange={handleChange}
        className="border p-2 w-full"
        disabled={loading}
      />
      <input
        name="photo_url"
        placeholder="사진 URL"
        value={formData.photo_url}
        onChange={handleChange}
        className="border p-2 w-full"
        disabled={loading}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white p-2 rounded w-full"
      >
        {loading ? "추가 중..." : "저장소 추가"}
      </button>
    </form>
  );
}

export default StorageAddForm;
