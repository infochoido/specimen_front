import { useState, useEffect } from "react";

export default function CaseSampleAddForm() {
  const [storages, setStorages] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    sample_number: "",
    collected_date: "",
    species: "",
    volume_remaining: 0,
    collected_place: "",
    test_institution: "",
    test_type: "",
    detected_bacteria: "",
    detected_date: "",
    legal_disease: "",
    legal_group: "",
    status: "사용가능",
    current_user_id: "",  // 토큰에서 따로 세팅 예정
    storage_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);




  // 토큰과 사용자 정보 로컬스토리지에서 가져오기 (또는 context 등)
  const token = localStorage.getItem("access_token");
  // user_id는 별도 API 호출하거나, 토큰 디코딩으로 가져올 수 있음.
  // 여기서는 예시로 임시 하드코딩 (실제는 로그인 후 상태에서 받아오기)


  useEffect(() => {
  if (token) {
    fetch("https://specimenmanage.fly.dev/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("user_id", data.id);
      });
  }
}, [token]);

  const currentUserId = localStorage.getItem("user_id") || "";

  useEffect(() => {
    const fetchStorages = async () => {
      try {
        const res = await fetch("https://specimenmanage.fly.dev/api/v1/storages/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("저장소 정보를 불러오지 못했습니다.");
        const data = await res.json();
        setStorages(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchStorages();
  }, [token]);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "volume_remaining" ? Number(value) : value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    if (!formData.storage_id) {
      throw new Error("저장소를 선택하세요.");
    }
    if (!currentUserId) {
      throw new Error("사용자 정보가 없습니다.");
    }

    // 빈 문자열 값을 null로 변환
    const postData = { ...formData, current_user_id: currentUserId };
    Object.keys(postData).forEach((key) => {
      if (postData[key] === "") {
        postData[key] = null;
      }
    });

    const res = await fetch("https://specimenmanage.fly.dev/api/v1/case-samples/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "가검물 등록 실패");
    }
     const createdSample = await res.json(); 

    const logData = {
      sample_id: createdSample.id,
      user_id: currentUserId,
      action: "등록", // 또는 "등록", "추가", "생성" 등으로 명확히 지정
      etc: "신규 가검물 등록",
    };

    const logRes = await fetch("https://specimenmanage.fly.dev/api/v1/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(logData),
    });

    if (!logRes.ok) {
      console.warn("로그 생성 실패");
    }

    alert("가검물이 성공적으로 등록되었습니다!");
    // 초기화
    setFormData({
      category: "",
      sample_number: "",
      collected_date: "",
      species: "",
      volume_remaining: 0,
      collected_place: "",
      test_institution: "",
      test_type: "",
      detected_bacteria: "",
      detected_date: "",
      legal_disease: "",
      legal_group: "",
      status: "사용가능",
      storage_id: "",
      current_user_id: "",
    });
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  return (
<form onSubmit={handleSubmit} className="p-4 max-w-lg mx-auto space-y-4 border rounded bg-white">
  <h2 className="text-xl font-semibold mb-4">가검물 등록</h2>

  <label>
    저장소 선택 <span className="text-red-600">*</span>
    <select
      name="storage_id"
      value={formData.storage_id}
      onChange={handleChange}
      required
      className="border p-2 w-full"
      disabled={loading}
    >
      <option value="">-- 저장소 선택 --</option>
      {storages.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} ({s.location})
        </option>
      ))}
    </select>
  </label>

<label>
  카테고리 <span className="text-red-600">*</span>
  <select
    name="category"
    value={formData.category}
    onChange={handleChange}
    required
    className="border p-2 w-full"
    disabled={loading}
  >
    <option value="">-- 선택 --</option>
    <option value="분변">분변</option>
    <option value="혈액">혈액</option>
    <option value="피부">피부</option>
    <option value="땀">땀</option>
    <option value="침">침</option>
    <option value="기타">기타</option>
    <option value="직접입력">직접입력</option>
  </select>
</label>

  <label>
    샘플 번호 <span className="text-red-600">*</span>
    <input
      type="text"
      name="sample_number"
      value={formData.sample_number}
      onChange={handleChange}
      required
      className="border p-2 w-full"
      disabled={loading}
    />
  </label>

<label>
  상태 <span className="text-red-600">*</span>
  <select
    name="status"
    value={formData.status}
    onChange={handleChange}
    required
    className="border p-2 w-full"
    disabled={loading}
  >
    <option value="사용가능">사용가능</option>
    <option value="사용중">사용중</option>
  </select>
</label>

  {/* 아래는 필수가 아니므로 별 없음 */}
  <label>
    채취 날짜
    <input
      type="date"
      name="collected_date"
      value={formData.collected_date}
      onChange={handleChange}
      className="border p-2 w-full"
      disabled={loading}
    />
  </label>

      <label>
        종(species)
        <input
          type="text"
          name="species"
          value={formData.species}
          onChange={handleChange}
          className="border p-2 w-full"
          disabled={loading}
        />
      </label>

      <label>
        남은 양(숫자)
        <input
          type="number"
          name="volume_remaining"
          value={formData.volume_remaining}
          onChange={handleChange}
          className="border p-2 w-full"
          disabled={loading}
          min={0}
        />
      </label>

      <label>
        채취 장소
        <input
          type="text"
          name="collected_place"
          value={formData.collected_place}
          onChange={handleChange}
          className="border p-2 w-full"
          disabled={loading}
        />
      </label>

      <label>
        검사 기관
        <input
          type="text"
          name="test_institution"
          value={formData.test_institution}
          onChange={handleChange}
          className="border p-2 w-full"
          disabled={loading}
        />
      </label>

      <label>
        검사 종류
        <input
          type="text"
          name="test_type"
          value={formData.test_type}
          onChange={handleChange}
          className="border p-2 w-full"
          disabled={loading}
        />
      </label>

      <label>
        검출된 세균
        <input
          type="text"
          name="detected_bacteria"
          value={formData.detected_bacteria}
          onChange={handleChange}
          className="border p-2 w-full"
          disabled={loading}
        />
      </label>

      <label>
        검출 날짜
        <input
          type="date"
          name="detected_date"
          value={formData.detected_date}
          onChange={handleChange}
          className="border p-2 w-full"
          disabled={loading}
        />
      </label>

      <label>
        법정 전염병
        <input
          type="text"
          name="legal_disease"
          value={formData.legal_disease}
          onChange={handleChange}
          className="border p-2 w-full"
          disabled={loading}
        />
      </label>

      <label>
        법정 그룹
        <input
          type="text"
          name="legal_group"
          value={formData.legal_group}
          onChange={handleChange}
          className="border p-2 w-full"
          disabled={loading}
        />
      </label>

      {error && <p className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white p-2 rounded w-full"
      >
        {loading ? "등록 중..." : "가검물 등록"}
      </button>
    </form>
  );
}
