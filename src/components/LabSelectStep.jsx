import React, { useEffect, useState } from "react";
import API_BASE_URL from "../services/api";

export default function LabSelectStep({ onClose }) {
  const [labs, setLabs] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState(null);
  const [newLabName, setNewLabName] = useState("");
  const [loading, setLoading] = useState(false);
  const [newLabLocation, setNewLabLocation] = useState("");

  // 실험실 목록 불러오기
  useEffect(() => {
    const fetchLabs = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/labs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("실험실 목록 조회 실패");
        const data = await res.json();
        setLabs(data);
      } catch (err) {
        console.error("Failed to fetch labs", err);
      }
    };
    fetchLabs();
  }, []);

  // 기존 실험실 참여
  const joinLab = async () => {
    if (!selectedLabId) {
      alert("실험실을 선택해주세요.");
      return;
    }
    setLoading(true);

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/users/labs/${selectedLabId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to join lab");
      alert("실험실에 성공적으로 참여했습니다.");
      if (onClose) onClose();
    } catch (err) {
      alert("실험실 참여 실패");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 새 실험실 생성 및 관리자 지정
  const createLab = async () => {
    if (!newLabName.trim()) {
      alert("실험실 이름을 입력해주세요.");
      return;
    }
    if (!newLabLocation.trim()) {
      alert("실험실 위치를 입력해주세요.");
      return;
    }
    setLoading(true);

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/labs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newLabName,
          location: newLabLocation,
          // userId는 서버가 토큰에서 현재 유저 정보 추출하므로 필요 없을 수 있음
        }),
      });
      if (!res.ok) throw new Error("Failed to create lab");
      alert("실험실이 성공적으로 생성되었습니다.");
      if (onClose) onClose();
    } catch (err) {
      alert("실험실 생성 실패");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-[#101910]">
      <h1 className="text-2xl font-bold">실험실 관리</h1>
      <p className="text-base">
        기존 실험실에 참여하거나, 새 실험실을 생성할 수 있습니다.
      </p>

      {/* 기존 실험실 선택 */}
      <div>
        <h2 className="font-semibold mb-2">기존 실험실 참여</h2>
        <select
          className="w-full border border-[#d3e4d3] rounded-md px-3 py-2"
          value={selectedLabId || ""}
          onChange={(e) => setSelectedLabId(e.target.value)}
        >
          <option value="" disabled>
            실험실 선택
          </option>
          {labs.map((lab) => (
            <option key={lab.id} value={lab.id}>
              {lab.name || lab.id}
            </option>
          ))}
        </select>
        <button
          disabled={loading}
          onClick={joinLab}
          className="mt-3 w-full bg-[#578e58] hover:bg-[#456e45] text-white py-2 rounded-md font-semibold disabled:opacity-50"
        >
          참여하기
        </button>
      </div>

      {/* 새 실험실 생성 */}
      <div>
        <h2 className="font-semibold mb-2">새 실험실 생성</h2>
        <input
          type="text"
          placeholder="실험실 이름 입력"
          value={newLabName}
          onChange={(e) => setNewLabName(e.target.value)}
          className="w-full border border-[#d3e4d3] rounded-md px-3 py-2"
        />
        <input
          type="text"
          placeholder="실험실 위치 입력"
          value={newLabLocation}
          onChange={(e) => setNewLabLocation(e.target.value)}
          className="w-full border border-[#d3e4d3] rounded-md px-3 py-2"
        />
        <button
          disabled={loading}
          onClick={createLab}
          className="mt-3 w-full bg-[#578e58] hover:bg-[#456e45] text-white py-2 rounded-md font-semibold disabled:opacity-50"
        >
          생성하기
        </button>
      </div>
    </div>
  );
}
