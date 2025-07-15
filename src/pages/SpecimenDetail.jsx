import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../services/api";

export default function SpecimenDetail() {
  const { id } = useParams();
  const [sample, setSample] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnVolume, setReturnVolume] = useState("");

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
        etc: "web record",
      }),
    }).catch((err) => console.error("로그 기록 실패:", err));
  };

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE_URL}/api/v1/case-samples/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSample(data);
        setForm(data);
      } else {
        alert("샘플 정보를 불러오지 못했습니다.");
      }
    })();
  }, [id]);

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
      return true;
    } else {
      const err = await res.json();
      alert(`수정 실패: ${err.detail ?? res.status}`);
      return false;
    }
  };

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const updateStatus = async (newStatus) => {
    if (newStatus === "사용가능") {
      // 반납 버튼 누르면 잔량 입력 팝업 보여주기
      setReturnVolume(sample.volume_remaining ?? "");
      setShowReturnModal(true);
      return;
    }

    // '사용중'이나 '폐기'는 기존 로직대로
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

      let action = "";
      if (newStatus === "사용중") action = "사용";
      else if (newStatus === "사용가능") action = "반납";
      else if (newStatus === "폐기") action = "폐기";

      if (action) await createLog(action);
    } else {
      alert("상태 변경 실패");
    }
  };

  // 반납 모달 확인
  const handleReturnConfirm = async () => {
    if (returnVolume === "" || isNaN(returnVolume) || Number(returnVolume) < 0) {
      alert("잔량을 0 이상의 숫자로 입력해주세요.");
      return;
    }

    // form 상태와 잔량, 상태 같이 PATCH
    const updatedForm = {
      ...form,
      volume_remaining: returnVolume,
      status: "사용가능",
    };
    setSaving(true);
    const res = await fetch(`${API_BASE_URL}/api/v1/case-samples/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(updatedForm),
    });
    setSaving(false);

    if (res.ok) {
      const updated = await res.json();
      setSample(updated);
      setForm(updated);
      setShowReturnModal(false);
      await createLog("반납");
      alert("반납 완료");
    } else {
      const err = await res.json();
      alert(`반납 실패: ${err.detail ?? res.status}`);
    }
  };

  if (!sample) return <p className="p-8">로딩 중...</p>;

  const fields = [
    ["검체", "category"],
    ["샘플번호", "sample_number"],
    ["채취일자", "collected_date"],
    ["종", "species"],
    ["잔량", "volume_remaining"],
    ["수집장소", "collected_place"],
    ["수집기관", "test_institution"],
    ["검사종류", "test_type"],
    ["검출균", "detected_bacteria"],
    ["검출일자", "detected_date"],
    ["법정감염병 ", "legal_disease"],
    ["법정균", "legal_group"],
  ];

  return (
    <div className="px-40 flex flex-1 justify-center py-5 bg-[#f8fbf8] min-h-screen">
      <div className="max-w-[960px] w-full bg-[#f8fbf8]">
        {/* 헤더 */}
        <div className="px-4 pb-4">
          <h1 className="text-[28px] font-bold text-[#0e1a0f]">검체 상세</h1>
          <p className="text-sm text-[#519453]">전체 검체 정보 및 관리</p>
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
          <p className="text-sm font-medium mb-2 text-[#0e1a0f]">상태</p>
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
              {sample.status !== "폐기" && (
                <button
                  onClick={() => updateStatus("폐기")}
                  className="h-10 px-4 rounded-full bg-transparent text-[#0e1a0f] font-bold"
                >
                  폐기
                </button>
              )}
              {sample.status === "폐기" && (
                <button
                  onClick={() => updateStatus("사용가능")}
                  className="h-10 px-4 rounded-full bg-transparent text-[#0e1a0f] font-bold border border-[#0e1a0f]"
                >
                  복구
                </button>
              )}
            </>
          )}
        </div>

        {/* 반납 잔량 입력 모달 */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[320px]">
              <h2 className="text-lg font-semibold mb-4">잔량을 입력하세요</h2>
              <input
                type="number"
                min="0"
                step="any"
                className="w-full border rounded px-3 py-2 mb-4"
                value={returnVolume}
                onChange={(e) => setReturnVolume(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 rounded border"
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  onClick={handleReturnConfirm}
                  className="px-4 py-2 rounded bg-[#4ee350] font-bold"
                  disabled={saving}
                >
                  {saving ? "저장 중..." : "확인"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
