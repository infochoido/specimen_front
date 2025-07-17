// src/pages/StorageSamples.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

export default function StorageSamples() {
  const { storageId } = useParams();
  const [samples, setSamples] = useState([]);
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [sampleRes, storageRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/case-samples/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }),
        fetch(`${API_BASE_URL}/api/v1/storages/${storageId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }),
      ]);

      if (!sampleRes.ok || !storageRes.ok) throw new Error("데이터 불러오기 실패");

      const sampleData = await sampleRes.json();
      const storageData = await storageRes.json();

      // 폐기 상태 제외 필터 추가
      setSamples(sampleData.filter((s) => s.storage_id === storageId && s.status !== "폐기"));
      setStorage(storageData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [storageId]);

  if (loading) {
    return (
      <div className="px-40 py-10 text-[#0e1a0f] text-lg font-medium">
        로딩 중...
      </div>
    );
  }

  return (
    <div
      className="px-40 flex flex-1 justify-center py-5 bg-[#f8fbf8] min-h-screen"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <main className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* 제목 */}
            <div className="flex justify-between items-center px-4 mb-4">
              <div>
                <h1 className="text-[#0e1a0f] text-[28px] font-bold leading-tight">
                  {storage?.name}
                </h1>
                <p className="text-sm text-[#519453] mt-1">위치: {storage?.location}</p>
              </div>
            </div>

            {/* 데이터 */}
            {samples.length === 0 ? (
              <p className="px-4 py-10 text-[#0e1a0f] text-sm">보관 중인 검체가 없습니다.</p>
            ) : (
              <div className="overflow-auto rounded-xl border border-[#e8f2e8] bg-white">
                <table className="min-w-full table-fixed border-collapse border border-[#e8f2e8]">
                  <thead className="bg-[#f0f6f0]">
                    <tr>
                      <th className="border px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">검체 이름</th>
                      <th className="border px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">검체 번호</th>
                      <th className="border px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">잔여용량</th>
                      <th className="border px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">검체</th>
                      <th className="border px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samples.map((sample) => (
                      <tr
                        key={sample.id}
                        className="hover:bg-[#e8f2e8] cursor-pointer"
                        onClick={() => navigate(`/specimen/${sample.id}`)}
                      >
                        <td className="border px-4 py-2 text-sm text-[#0e1a0f]">{sample.species || "-"}</td>
                        <td className="border px-4 py-2 text-sm text-[#0e1a0f] whitespace-nowrap">{sample.sample_number || sample.id}</td>
                        <td className="border px-4 py-2 text-sm text-[#0e1a0f]">{sample.volume_remaining || "-"} ml</td>
                        <td className="border px-4 py-2 text-sm text-[#0e1a0f]">{sample.category || "-"}</td>
                        <td className="border px-4 py-2 text-sm text-[#0e1a0f]">{sample.status || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
