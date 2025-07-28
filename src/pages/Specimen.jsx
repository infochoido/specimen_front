import React, { useEffect, useState, useCallback } from "react";
import API_BASE_URL from "../services/api";
import { useNavigate } from "react-router-dom";
import ExcelUploadModal from "../components/ExcelUploadModal";

export default function Specimen() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLabId, setUserLabId] = useState(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState("전체");
  const navigate = useNavigate();
  const limit = 30;

  // 사용자 정보 가져오기
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

  const fetchTotalCount = useCallback(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/case-samples/stats`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (!res.ok) throw new Error("샘플 통계 불러오기 실패");
    const data = await res.json();
    setTotalCount(data.total || 0);
    console.log("총 샘플 개수:", data.total);
  } catch (err) {
    console.error("샘플 통계 가져오기 오류:", err);
  }
}, []);

// useEffect에서 총 개수 먼저 가져오기
useEffect(() => {
  fetchTotalCount();
}, [fetchTotalCount]);

  // 샘플 조회 함수
  const fetchSamples = useCallback(async () => {
  if (!userLabId) return;

  setLoading(true);
  setError(null);

  try {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit.toString());
    queryParams.append("skip", ((page - 1) * limit).toString());
    

    if (filterStatus !== "전체") {
      queryParams.append("status", filterStatus);
    } else {
      queryParams.append("exclude_discarded", "true");
    }

    const res = await fetch(
      `${API_BASE_URL}/api/v1/case-samples/lab/${userLabId}?${queryParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("샘플 목록 불러오기 실패");
    }

    const data = await res.json(); // data는 배열

    console.log("API 응답 배열 길이:", data.length);
    console.log("첫번째 샘플:", data[0]);
    setSamples(data);
    

  } catch (err) {
    console.error("샘플 가져오기 오류:", err);
    setError(err.message || "에러 발생");
  } finally {
    setLoading(false);
  }
}, [userLabId, page, filterStatus]);


  const handleFilterClick = (status) => {
    setPage(1); // 필터 변경 시 첫 페이지로 초기화
    setFilterStatus(status);
  };

  // 엑셀 저장 핸들러
  const handleSaveExcelData = async (mappedData) => {
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < mappedData.length; i++) {
        const item = { ...mappedData[i], lab_id: userLabId };
        const statusText = `저장 중 (${i + 1}/${mappedData.length})`;
        setUploadProgress(statusText);
        document.title = statusText;

        const res = await fetch(`${API_BASE_URL}/api/v1/case-samples/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(item),
        });

        if (!res.ok) {
          failCount++;
          const errorData = await res.json();
          console.error("저장 실패:", item, "에러:", errorData);
        } else {
          successCount++;
        }
      }

      document.title = "샘플 저장 완료";
      alert(`저장 완료\n성공: ${successCount}개\n실패: ${failCount}개`);
      setIsExcelModalOpen(false);
      fetchSamples(); // 저장 후 다시 조회
    } catch (err) {
      alert(`엑셀 데이터 저장 중 오류: ${err.message}`);
    }
  };

  useEffect(() => {
  fetchSamples();
  }, [fetchSamples]);

  return (
    <div className="flex flex-1 justify-center py-5 bg-[#f8fbf8] min-h-screen" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0e1a0f] text-[32px] font-bold leading-tight min-w-72">가검물</p>
              <div className="flex gap-2">
                <button className="px-4 h-8 rounded-full bg-[#e8f2e8] text-sm font-medium" onClick={() => navigate("/specimen/add")}>
                  샘플 개별 추가
                </button>
                <button className="px-4 h-8 rounded-full bg-[#e8f2e8] text-sm font-medium" onClick={() => setIsExcelModalOpen(true)}>
                  샘플 Excel 추가
                </button>
              </div>
            </div>

            <ExcelUploadModal
              isOpen={isExcelModalOpen}
              onClose={() => setIsExcelModalOpen(false)}
              onSave={handleSaveExcelData}
              labId={userLabId}
              uploadProgress={uploadProgress}
            />

            <div className="px-4 py-3 flex gap-2">
              {["전체", "사용가능", "사용중", "폐기"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterClick(status)}
                  className={`px-4 py-1 rounded-full text-sm font-medium border ${
                    filterStatus === status ? "bg-[#519453] text-white" : "bg-white text-[#0e1a0f] border-[#c9e1c9]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="px-4 py-6">로딩 중...</p>
            ) : error ? (
              <p className="px-4 py-6 text-red-600 font-bold">에러 발생: {error}</p>
            ) : samples?.length === 0 ? (
              <p className="px-4 py-10 text-sm">샘플이 없습니다.</p>
            ) : (
              <div className="overflow-auto rounded-xl border border-[#e8f2e8] bg-white">
                <table className="min-w-full table-fixed border-collapse">
                  <thead className="bg-[#f0f6f0]">
                    <tr>
                      {["검체 이름", "검체 번호", "잔여용량", "검체", "상태"].map((col) => (
                        <th key={col} className="border px-4 py-2 text-left text-sm font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {samples &&samples.map((sample) => (
                      <tr
                        key={sample.id}
                        className="hover:bg-[#e8f2e8] cursor-pointer"
                        onClick={() => navigate(`/specimen/${sample.id}`)}
                      >
                        <td className="border px-4 py-2 text-sm">{sample.sample_name || "-"}</td>
                        <td className="border px-4 py-2 text-sm">{sample.sample_number || sample.id}</td>
                        <td className="border px-4 py-2 text-sm">{sample.volume_remaining || "-"} ml</td>
                        <td className="border px-4 py-2 text-sm">{sample.category || "-"}</td>
                        <td className="border px-4 py-2 text-sm">{sample.status || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-center mt-6 space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                이전
              </button>
              <span className="text-sm text-gray-700">
                페이지 {page} / {Math.max(1, Math.ceil(totalCount / limit))}
              </span>
              <button
                disabled={page * limit >= totalCount}
                onClick={() => setPage(page + 1)}
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
