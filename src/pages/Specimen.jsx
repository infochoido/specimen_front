import React, { useEffect, useState } from "react";
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

    const fetchSamples = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/case-samples/lab/${userLabId}?limit=100`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (!res.ok) throw new Error("샘플 목록 불러오기 실패");
        const data = await res.json();
        setSamples(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, [userLabId]);

   const handleSaveExcelData = async (mappedData) => {
  let successCount = 0;
  let failCount = 0;

  try {
    for (let i = 0; i < mappedData.length; i++) {
      const item = mappedData[i];
      item.lab_id = userLabId;

      // 저장 중 상태 콘솔 및 브라우저 title로 표시
      const statusText = `저장 중 (${i + 1}/${mappedData.length})`;
      setUploadProgress(statusText); 
      console.log(statusText);
      document.title = statusText; // 브라우저 탭에 진행률 표시

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
        console.error("저장 실패 아이템:", item, "에러:", errorData);
      } else {
        successCount++;
      }
    }

    document.title = "샘플 저장 완료"; // 저장 완료 후 탭 타이틀 복구
    alert(`저장 완료\n성공: ${successCount}개\n실패: ${failCount}개`);
    setIsExcelModalOpen(false);

    // 저장 후 리스트 재조회
    if (userLabId) {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/case-samples/lab/${userLabId}?limit=100`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (!res.ok) throw new Error("샘플 목록 불러오기 실패");
        const data = await res.json();
        setSamples(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  } catch (err) {
    alert(`엑셀 데이터 저장 중 오류: ${err.message}`);
  }
};

  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#f8fbf8] overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <main className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* 상단 타이틀 + 버튼 */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0e1a0f] tracking-light text-[32px] font-bold leading-tight min-w-72">
                Specimens
              </p>
              <div className="flex flex-wrap gap-2">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center rounded-full h-8 px-4 bg-[#e8f2e8] text-[#0e1a0f] text-sm font-medium leading-normal"
                onClick={() => navigate("/specimen/add")}
              >
                <span className="truncate">샘플 개별 추가</span>
              </button>
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center rounded-full h-8 px-4 bg-[#e8f2e8] text-[#0e1a0f] text-sm font-medium leading-normal"
                onClick={()=>setIsExcelModalOpen(true)}
              >
                <span className="truncate"  >샘플 excel 추가</span>
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

            {/* 검색 입력창 */}
            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                  <div className="text-[#519453] flex border-none bg-[#e8f2e8] items-center justify-center pl-4 rounded-l-xl border-r-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                    </svg>
                  </div>
                  <input
                    placeholder="Search by sample number, species, or location"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e1a0f] focus:outline-0 focus:ring-0 border-none bg-[#e8f2e8] focus:border-none h-full placeholder:text-[#519453] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value=""
                    readOnly
                  />
                </div>
              </label>
            </div>

            {/* 로딩 또는 에러 처리 */}
            {loading ? (
              <p className="px-4 py-6 text-[#0e1a0f]">로딩 중...</p>
            ) : error ? (
              <p className="px-4 py-6 text-red-600 font-bold">에러 발생: {error}</p>
            ) : samples.length === 0 ? (
              <p className="px-4 py-10 text-[#0e1a0f] text-sm">샘플이 없습니다.</p>
            ) : (
              <div className="overflow-auto rounded-xl border border-[#e8f2e8] bg-white">
                <table className="min-w-full table-fixed border-collapse border border-[#e8f2e8]">
                  <thead className="bg-[#f0f6f0]">
                    <tr>
                      <th className="border border-[#e8f2e8] px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">샘플번호</th>
                      <th className="border border-[#e8f2e8] px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">종</th>
                      <th className="border border-[#e8f2e8] px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">장소</th>
                      <th className="border border-[#e8f2e8] px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">잔여용량</th>
                      <th className="border border-[#e8f2e8] px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">검체</th>
                      <th className="border border-[#e8f2e8] px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samples.map((sample) => (
                      <tr
                        key={sample.id}
                        className="hover:bg-[#e8f2e8] cursor-pointer"
                      >
                        <td className="border border-[#e8f2e8] px-4 py-2 text-sm text-[#0e1a0f] whitespace-nowrap">{sample.sample_number || sample.id}</td>
                        <td className="border border-[#e8f2e8] px-4 py-2 text-sm text-[#0e1a0f]">{sample.species || "-"}</td>
                        <td className="border border-[#e8f2e8] px-4 py-2 text-sm text-[#0e1a0f]">{sample.location || "-"}</td>
                        <td className="border border-[#e8f2e8] px-4 py-2 text-sm text-[#0e1a0f]">{sample.volume_remaining || "-"}</td>
                        <td className="border border-[#e8f2e8] px-4 py-2 text-sm text-[#0e1a0f]">{sample.category || "-"}</td>
                        <td className="border border-[#e8f2e8] px-4 py-2 text-sm text-[#0e1a0f]">{sample.status || "-"}</td>
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
