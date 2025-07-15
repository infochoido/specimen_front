import React, { useEffect, useState } from "react";
import API_BASE_URL from "../services/api";
import { useNavigate } from "react-router-dom";

const Alert = () => {
  const [etcCount, setEtcCount] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [error, setError] = useState(null);
  const [labId, setLabId] = useState(null);
  const [etcStorage, setEtcStorage] = useState(null);
  const token = localStorage.getItem("access_token");
    const navigate = useNavigate();

  // 1. lab_id 없으면 /users/me로 가져오기
  useEffect(() => {
    if (!token) return;

    const fetchLabId = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("사용자 정보를 불러올 수 없습니다");

        const data = await res.json();
        if (!data.lab_id) throw new Error("실험실 정보가 없습니다");
        setLabId(data.lab_id);
      } catch (err) {
        console.error(err);
        setError("실험실 정보를 불러오는 데 실패했습니다.");
        setLoading(false); // 에러 시에도 로딩 종료
      }
    };

    fetchLabId();
  }, [token]);

  // 2. labId가 준비되면 기타 보관함 조회 및 샘플 수 필터링
  useEffect(() => {
    if (!labId || !token) return;

    const fetchEtcSampleCount = async () => {
      try {
        setLoading(true); // 데이터 요청 전 로딩 시작

        // 1) 기타 보관함 찾기
        const storRes = await fetch(`${API_BASE_URL}/api/v1/storages/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!storRes.ok) throw new Error(`보관함 조회 실패(${storRes.status})`);
        const storages = await storRes.json();
        const filtered = storages.filter((storage) => storage.lab_id === labId);
        const etc = filtered.find((s) => s.name === "기타 보관함");

        if (!etc) throw new Error("⚠️ '기타 보관함'이 없습니다.");
        const etcId = String(etc.id);
        setEtcStorage(etcId);

        // 2) 샘플 가져오기
        const sampRes = await fetch(
          `${API_BASE_URL}/api/v1/case-samples/lab/${labId}?limit=1000`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!sampRes.ok) throw new Error(`샘플 조회 실패(${sampRes.status})`);
        const samples = await sampRes.json();

        // 3) 기타 보관함 샘플 개수
        const count = samples.filter((s) => String(s.storage_id) === etcId).length;
        setEtcCount(count);
      } catch (err) {
        console.error(err);
        setError(err.message || "알림 불러오기 실패");
      } finally {
        setLoading(false); // 요청 완료 후 로딩 종료
      }
    };

    fetchEtcSampleCount();
  }, [labId, token]);

  // UI 렌더링
  if (loading)
    return <div className="mt-2 text-sm text-gray-500">알림 불러오는 중...</div>;

  if (error)
    return <div className="mt-2 text-sm text-red-600">{error}</div>;

  if (etcCount === 0)
    return null;

  return (
    <button
        type="button"
        onClick={() => navigate(`/storage/${etcStorage}`)} // 클릭 시 navigate 호출
        className="mt-2 p-3 text-sm text-[#0e1a0f] bg-[#f0f6f0] rounded-lg border border-[#d3e4d3] w-full text-left"
        aria-label={`기타 보관함에 검체 ${etcCount}개 있음. 클릭해서 이동`}
        >
        <strong>기타 보관함</strong>에 검체가{" "}
        <strong>{etcCount}</strong>개 있습니다.<br />
        보관함 이동이 필요합니다.
        </button>
    );
    };

export default Alert;
