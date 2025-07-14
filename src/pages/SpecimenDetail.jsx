// src/pages/SpecimenDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../services/api";

export default function SpecimenDetail() {
  const { id } = useParams();
  const [sample, setSample] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const createLog = async (action) => {
fetch(`${API_BASE_URL}/api/v1/logs`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
  body: JSON.stringify({
    sample_id: sample.id,
    user_id: sample.current_user_id,
    lab_id: sample.lab_id,
    action,
    etc: "",
  }),
}).catch((err) => console.error("로그 기록 실패:", err));

};

  // ───────────────────────────────── fetch one
  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE_URL}/api/v1/case-samples/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSample(data);
        setForm(data); // 👉 폼 초기화
      } else {
        alert("샘플 정보를 불러오지 못했습니다.");
      }
    })();
  }, [id]);

  // ───────────────────────────────── 수정 저장
  const saveChanges = async () => {
    setSaving(true);
    const res = await fetch(`${API_BASE_URL}/api/v1/case-samples/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(form),
    });
    setSaving(false);

    if (res.ok) {
      const updated = await res.json();
      setSample(updated);
      setEditMode(false);
      alert("수정 완료!");
    } else {
      const err = await res.json();
      alert(`수정 실패: ${err.detail ?? res.status}`);
    }
  };

  // ───────────────────────────────── 핸들러
  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  if (!sample) return <p className="p-8">로딩 중...</p>;

  // label, key 매핑
  const fields = [
    ["Category", "category"],
    ["Sample Number", "sample_number"],
    ["Collected Date", "collected_date"],
    ["Species", "species"],
    ["Volume Remaining", "volume_remaining"],
    ["Collected Place", "collected_place"],
    ["Test Institution", "test_institution"],
    ["Test Type", "test_type"],
    ["Detected Bacteria", "detected_bacteria"],
    ["Detected Date", "detected_date"],
    ["Legal Disease", "legal_disease"],
    ["Legal Group", "legal_group"],
  ];



  const updateStatus = async (newStatus) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/case-samples/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (res.ok) {
    const updated = await res.json();
    setSample(updated);

    // 상태 변경 로그 기록
    let action = "";
    if (newStatus === "사용중") action = "사용";
    else if (newStatus === "사용가능") action = "반납";
    else if (newStatus === "폐기") action = "폐기";

    if (action) await createLog(action);
  } else {
    alert("상태 변경 실패");
  }
};


  return (
    <div className="px-40 py-6 flex justify-center">
      <div className="max-w-[960px] w-full bg-[#f8fbf8]">
        {/* 헤더 */}
        <div className="px-4 pb-4">
          <h1 className="text-[28px] font-bold text-[#0e1a0f]">검체 상세</h1>
          <p className="text-sm text-[#519453]">View and manage specimen information</p>
        </div>

        {/* 정보 그리드 */}
        <div className="grid grid-cols-2 gap-x-2">
          {fields.map(([label, key], idx) => (
            <div
              key={key}
              className={`flex flex-col gap-1 border-t border-[#d1e6d1] py-4 ${
                idx % 2 === 0 ? "pr-2" : "pl-2"
              }`}
            >
              <p className="text-[#519453] text-sm">{label}</p>
              {editMode ? (
                <input
                  className="h-10 rounded border px-2 text-sm"
                  value={form[key] ?? ""}
                  onChange={handleChange(key)}
                />
              ) : (
                <p className="text-sm text-[#0e1a0f]">{sample[key] ?? "-"}</p>
              )}
            </div>
          ))}
        </div>

        {/* 상태 표시 */}
        <div className="px-4 pt-6">
          <p className="text-sm font-medium mb-2 text-[#0e1a0f]">Status</p>
          {editMode ? (
            <select
              className="w-full h-12 rounded border px-3"
              value={form.status}
              onChange={handleChange("status")}
            >
              <option value="사용가능">사용가능</option>
              <option value="사용중">사용중</option>
              <option value="폐기">폐기</option>
            </select>
          ) : (
            <div className="h-12 flex items-center rounded border px-3 bg-[#f8fbf8]">
              {sample.status}
            </div>
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-3 justify-end px-4 py-6">
        {editMode ? (
            <>
            <button
                onClick={() => setEditMode(false)}
                className="h-10 px-4 rounded-full bg-transparent border font-bold"
            >
                취소
            </button>
            <button
                disabled={saving}
                onClick={saveChanges}
                className="h-10 px-4 rounded-full bg-[#4ee350] text-[#0e1a0f] font-bold disabled:opacity-50"
            >
                {saving ? "저장 중..." : "저장"}
            </button>
            </>
        ) : (
            <>
            {sample.status === "사용가능" && (
                <button
                onClick={() => updateStatus("사용중")}
                className="h-10 px-4 rounded-full bg-[#e8f2e8] text-[#0e1a0f] font-bold"
                >
                사용
                </button>
            )}
            {sample.status === "사용중" && (
                <button
                onClick={() => updateStatus("사용가능")}
                className="h-10 px-4 rounded-full bg-[#e8f2e8] text-[#0e1a0f] font-bold"
                >
                반납
                </button>
            )}
            <button
                onClick={() => setEditMode(true)}
                className="h-10 px-4 rounded-full bg-[#4ee350] text-[#0e1a0f] font-bold"
            >
                수정
            </button>
            <button
                onClick={() => updateStatus("폐기")}
                className="h-10 px-4 rounded-full bg-transparent text-[#0e1a0f] font-bold border border-[#0e1a0f]"
            >
                폐기
            </button>
            </>
        )}
        </div>

      </div>
    </div>
  );
}
