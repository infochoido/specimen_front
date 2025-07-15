import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

export default function SpecimenAddPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sample_number: "",
    category: "",
    collected_date: "",
    species: "",
    volume_remaining: 0,
    collected_place: "",
    status: "",
    storage_id: ""
  });

  const [storages, setStorages] = useState([]);
  const [labId, setLabId] = useState(null);
  const [userId, setUserId] = useState(null);

useEffect(() => {
  const fetchUser = async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (res.ok) {
      const user = await res.json();
      console.log("✅ 유저 정보", user); // ← 여기 확인
      setLabId(user.lab_id);
      setUserId(user.id);
    } else {
      console.error("❌ 유저 정보 불러오기 실패");
    }
  };
  fetchUser();
}, []);

useEffect(() => {
  if (!labId) return;

  const fetchStorages = async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/storages/`, {  // 전체 목록 API 호출
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const filteredStorages = data.filter(storage => storage.lab_id === labId);  // labId 필터링
      setStorages(filteredStorages);
    } else {
      console.error("❌ 저장소 목록 불러오기 실패");
    }
  };

  fetchStorages();
}, [labId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async () => {
  let selectedStorageId = formData.storage_id;

  const payload = {
    ...formData,
    collected_date: formData.collected_date === "" ? null : formData.collected_date,
    storage_id: selectedStorageId,
    volume_remaining: Number(formData.volume_remaining),
    lab_id: labId,
    current_user_id: userId,
  };

  const res = await fetch(`${API_BASE_URL}/api/v1/case-samples/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    alert("샘플이 성공적으로 추가되었습니다.");
    navigate("/specimen");
  } else {
    const error = await res.json();
    alert("샘플 추가에 실패했습니다.", error);
    alert("샘플 추가 실패: " + JSON.stringify(error));
    
  }
};


  return (
    <div className="px-40 flex flex-1 justify-center py-5 bg-[#f8fbf8] min-h-screen">
      <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <p className="text-[#101910] tracking-light text-[32px] font-bold leading-tight min-w-72">
            샘플 추가
          </p>
        </div>

        {[
                ["sample_number", "샘플 번호", "샘플 번호 입력", true],
                ["category", "카테고리", "카테고리 입력", true],
                ["collected_date", "채취일자", "YYYY-MM-DD", false],
                ["species", "종", "종 입력", false],
                ["volume_remaining", "잔량", "잔량 입력", false],
                ["collected_place", "채취 장소", "채취 장소 입력", false],
                ].map(([name, label, placeholder, required]) => (
                <div key={name} className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#101910] text-base font-medium leading-normal pb-2">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <input
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101910] focus:outline-0 focus:ring-0 border border-[#d3e4d3] bg-[#f9fbf9] focus:border-[#d3e4d3] h-14 placeholder:text-[#578e58] p-[15px] text-base font-normal leading-normal"
                    />
                    </label>
                </div>
                ))}

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#101910] text-base font-medium leading-normal pb-2">상태<span className="text-red-500 ml-1">*</span></p>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101910] focus:outline-0 focus:ring-0 border border-[#d3e4d3] bg-[#f9fbf9] h-14 p-[15px] text-base font-normal leading-normal"
            >
              <option value="사용가능">사용가능</option>
              <option value="사용중">사용중</option>
            
            </select>
          </label>
        </div>

        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#101910] text-base font-medium leading-normal pb-2">저장소</p>
            <select
              name="storage_id"
              value={formData.storage_id}
              onChange={handleChange}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101910] focus:outline-0 focus:ring-0 border border-[#d3e4d3] bg-[#f9fbf9] h-14 p-[15px] text-base font-normal leading-normal"
            >
              <option value="">저장소 선택</option>
              {storages.map((storage) => (
                <option key={storage.id} value={storage.id}>{storage.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex px-4 py-3 justify-end">
          <button
            onClick={handleSubmit}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#90e391] text-[#101910] text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">저장</span>
          </button>
        </div>
      </div>
    </div>
  );
}
