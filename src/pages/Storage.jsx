import React, { useEffect, useState } from "react";
import API_BASE_URL from "../services/api";
import { useNavigate } from 'react-router-dom';

export default function Storage() {
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLabId, setUserLabId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [sampleCounts, setSampleCounts] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("사용자 정보 불러오기 실패");
        const userData = await res.json();
        setUserLabId(userData.lab_id);
      } catch (err) {
        setError("사용자 정보를 불러오지 못했습니다.");
        console.error(err);
      }
    };
    fetchUser();
  }, []);

useEffect(() => {
  if (!userLabId) return;

  const fetchStorages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/storages/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error(`보관소 목록 불러오기 실패: ${res.status}`);
      const data = await res.json();
      const filtered = data.filter((storage) => storage.lab_id === userLabId);
      setStorages(filtered);

      const countsMap = {};
      for (const storage of filtered) {
        try {
          let url = `${API_BASE_URL}/api/v1/storages/sample-counts/${storage.id}`;
          const countRes = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          if (!countRes.ok) throw new Error();
          const countData = await countRes.json();
          countsMap[storage.id] = countData[0]?.sample_count || 0;
        } catch (err) {
          console.warn("샘플 개수 조회 실패", err);
          countsMap[storage.id] = 0;
        }
      }
      setSampleCounts(countsMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchStorages();
}, [userLabId]);

  const handleAddStorage = async () => {
    if (!newName.trim() || !newLocation.trim()) {
      alert("이름과 위치를 입력해주세요.");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/storages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          name: newName,
          location: newLocation,
          photo_url: newPhotoUrl.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("보관소 생성 실패");
      const createdStorage = await res.json();
      setStorages((prev) => [...prev, createdStorage]);
      setShowAddModal(false);
      setNewName("");
      setNewLocation("");
      setNewPhotoUrl("");
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-1 justify-center py-5 bg-[#f8fbf8] min-h-screen">
      <div className="layout-content-container flex flex-col min-w-[600px] max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <p className="text-[#0e1a0f] tracking-light text-[32px] font-bold leading-tight min-w-72">보관함</p>
        </div>

        {loading && <p className="text-gray-500 px-4">로딩 중...</p>}
        {error && <p className="text-red-500 px-4">에러 발생: {error}</p>}

        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {storages.map((storage) => {
            const isEtc = storage.name === "기타 보관함";
            const cardStyle = isEtc
              ? "border-[#7C9F7C] bg-[#f8fbf8] hover:shadow-gray-200"
              : "border-[#d1e6d1] bg-[#f8fbf8] hover:shadow-md";
            return (
              <div
                key={storage.id}
                onClick={() =>
                  navigate(isEtc ? `/storage/etc/${storage.id}` : `/storage/${storage.id}`)
                }
                className={`flex flex-1 gap-3 rounded-lg border p-4 flex-col cursor-pointer transition ${cardStyle}`}
              >
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-10 shrink-0"
                  style={{ backgroundImage: `url(${storage.photo_url})` }}
                ></div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[#0e1a0f] text-base font-bold leading-tight">{storage.name}</h2>
                  <p className="text-[#519453] text-sm font-normal leading-normal">{storage.location}</p>
                  <p className="text-gray-500 text-sm">
                    샘플: {(sampleCounts[storage.id] ?? 0).toLocaleString()}개
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 추가 버튼 */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-10 right-8 w-14 h-14 rounded-full bg-[#578e58] text-white text-3xl font-bold shadow-lg hover:bg-[#456e45] flex items-center justify-center leading-none"
          aria-label="Add Storage"
        >
          <span className="translate-y-[-3px]">+</span>
        </button>

        {/* 추가 모달 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 w-96 max-w-full shadow-lg">
              <h2 className="text-xl font-bold mb-4">새 보관소 추가</h2>
              <input
                type="text"
                placeholder="이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full mb-3 px-3 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="위치"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full mb-3 px-3 py-2 border rounded"
              />
              <div className="flex justify-between">
                <button
                  onClick={handleAddStorage}
                  disabled={adding}
                  className="bg-[#578e58] hover:bg-[#456e45] text-white py-2 px-4 rounded font-semibold disabled:opacity-50"
                >
                  추가
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="border border-gray-300 py-2 px-4 rounded hover:bg-gray-100"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
