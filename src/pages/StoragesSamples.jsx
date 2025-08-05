import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

export default function StorageSamples() {
  const { storageId } = useParams();
  const [samples, setSamples] = useState([]);
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [selectedSampleIds, setSelectedSampleIds] = useState([]);
  const [storages, setStorages] = useState([]);
  const [targetStorageId, setTargetStorageId] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSampleName, setFilterSampleName] = useState("");
  const [filterSampleNumber, setFilterSampleNumber] = useState("");
  const [filterCategoryInput, setFilterCategoryInput] = useState("");
  const [filterSampleNameInput, setFilterSampleNameInput] = useState("");
  const [filterSampleNumberInput, setFilterSampleNumberInput] = useState("");
  
  const navigate = useNavigate();

  const totalPages = Math.ceil(totalCount / limit);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const params = new URLSearchParams();
      params.append("limit", limit);
      params.append("offset", offset);
      if (filterCategory) params.append("category", filterCategory);
      if (filterSampleName) params.append("case_name", filterSampleName);
      if (filterSampleNumber) params.append("sample_number", filterSampleNumber);

      const [samplesRes, storageRes, countRes, storagesRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/v1/storages/${storageId}/case-samples?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        ),
        fetch(`${API_BASE_URL}/api/v1/storages/${storageId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }),
        fetch(`${API_BASE_URL}/api/v1/storages/sample-counts/${storageId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }),
        fetch(`${API_BASE_URL}/api/v1/storages/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }),
      ]);

      if (!samplesRes.ok || !storageRes.ok || !countRes.ok || !storagesRes.ok) {
        throw new Error("데이터 불러오기 실패");
      }

      const sampleData = await samplesRes.json();
      const storageData = await storageRes.json();
      const countData = await countRes.json();
      const storagesData = await storagesRes.json();

      setSamples(sampleData.filter((s) => s.status !== "폐기"));
      setStorage(storageData);
      setTotalCount(countData[0]?.sample_count || 0);
      setStorages(storagesData.filter((s) => s.id !== storageId));
      setSelectedSampleIds([]); // 페이지 변경 시 선택 초기화
      setTargetStorageId("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [storageId, page, limit, filterCategory, filterSampleName, filterSampleNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onFilterInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

    const applyFilters = () => {
    setFilterCategory(filterCategoryInput);
    setFilterSampleName(filterSampleNameInput);
    setFilterSampleNumber(filterSampleNumberInput);
    setPage(1);
  };



  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedSampleIds.length === samples.length) {
      setSelectedSampleIds([]);
    } else {
      setSelectedSampleIds(samples.map((s) => s.id));
    }
  };

  // 개별 선택/해제
  const toggleSelect = (id) => {
    setSelectedSampleIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  

const moveSamples = async () => {
  if (!targetStorageId || selectedSampleIds.length === 0) return;
  try {
  await fetch(`${API_BASE_URL}/api/v1/case-samples/move`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: JSON.stringify({
      sample_ids: selectedSampleIds,       // ⬅️ 반드시 snake_case
      target_storage_id: targetStorageId   // ⬅️ UUID 문자열
    }),
  });
    alert("선택한 검체가 이동되었습니다.");
    fetchData();
  } catch (err) {
    console.error("이동 실패:", err);
  }
};


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
                <p className="text-sm text-[#519453] mt-1">
                  위치: {storage?.location}
                </p>
              </div>
            </div>

      {/* 필터 입력창 */}
      <div className="flex gap-3 px-4 mb-4">
        
        <input
          type="text"
          placeholder="케이스 필터"
          value={filterSampleNameInput}
          onChange={onFilterInputChange(setFilterSampleNameInput)}
          className="border rounded px-3 py-1 text-sm flex-1"
        />
        <input
          type="text"
          placeholder="개체번호 필터"
          value={filterSampleNumberInput}
          onChange={onFilterInputChange(setFilterSampleNumberInput)}
          className="border rounded px-3 py-1 text-sm flex-1"
        />
        <input
          type="text"
          placeholder="가검물종류 필터"
          value={filterCategoryInput}
          onChange={onFilterInputChange(setFilterCategoryInput)}
          className="border rounded px-3 py-1 text-sm flex-1"
        />
        <button
          onClick={applyFilters}
          className="bg-[#519453] text-white px-4 py-1 rounded text-sm hover:bg-[#407e44]"
        >
          필터 적용
        </button>
      </div>

            {/* 이동 선택 바 */}
            {samples.length > 0 && (
              <div className="flex items-center justify-between mb-3 px-4">
                <div className="text-sm text-[#0e1a0f]">
                  선택된 검체: <strong>{selectedSampleIds.length}</strong>개
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={targetStorageId}
                    onChange={(e) => setTargetStorageId(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="">보관함 선택</option>
                    {storages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={moveSamples}
                    disabled={!targetStorageId || selectedSampleIds.length === 0}
                    className="bg-[#519453] text-white px-3 py-1 rounded text-sm hover:bg-[#407e44] disabled:opacity-50"
                  >
                    이동
                  </button>
                </div>
              </div>
            )}

            {/* 테이블 */}
            {samples.length === 0 ? (
              <p className="px-4 py-10 text-[#0e1a0f] text-sm">
                보관 중인 검체가 없습니다.
              </p>
            ) : (
              <div className="overflow-auto rounded-xl border border-[#e8f2e8] bg-white">
                <table className="min-w-full table-fixed border-collapse border border-[#e8f2e8]">
                  <thead className="bg-[#f0f6f0]">
                    <tr>
                      <th className="border px-2 py-2 text-left">
                        <input
                          type="checkbox"
                          checked={selectedSampleIds.length === samples.length && samples.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="border px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">케이스</th>
                      <th className="border px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">개체번호</th>
                      <th className="border px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">잔여용량</th>
                      <th className="border px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">가검물종류</th>
                      <th className="border px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samples.map((sample) => {
                      const {
                        id,
                        sample_name,
                        sample_number,
                        volume_remaining,
                        category,
                        status,
                      } = sample;

                      const isSelected = selectedSampleIds.includes(id);

                      return (
                        <tr
                          key={id}
                          className="hover:bg-[#e8f2e8] cursor-pointer"
                          onClick={() => navigate(`/specimen/${id}`)}
                        >
                          <td
                            className="border px-2 py-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelect(id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="border px-4 py-2 text-sm text-[#0e1a0f] truncate max-w-[200px]">
                            {sample_name || "-"}
                          </td>
                          <td className="border px-4 py-2 text-sm text-[#0e1a0f] whitespace-nowrap">
                            {sample_number || id}
                          </td>
                          <td className="border px-4 py-2 text-sm text-[#0e1a0f]">
                            {typeof volume_remaining === "number" ? `${volume_remaining} ml` : "-"}
                          </td>
                          <td className="border px-4 py-2 text-sm text-[#0e1a0f]">{category || "-"}</td>
                          <td className="border px-4 py-2 text-sm text-[#0e1a0f]">{status || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 페이지네이션 */}
            <div className="flex justify-center mt-6 space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                이전
              </button>
              <span className="text-sm text-gray-700">
                페이지 {page} / {totalPages || 1}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
