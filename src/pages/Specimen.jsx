import React, { useEffect, useState } from "react";
import API_BASE_URL from "../services/api";
import { useNavigate } from "react-router-dom";
import ExcelUploadModal from "../components/ExcelUploadModal";
//전체 사용가능 사용중 폐기  분류 

export default function Specimen() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLabId, setUserLabId] = useState(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  
  const [filterStatus, setFilterStatus] = useState("전체");
  const navigate = useNavigate();

  const handleFilterClick = (status) => {
  setFilterStatus(status);
  };

const filteredSamples = samples.filter((sample) => {
  if (filterStatus === "전체") {
    return sample.status !== "폐기"; // 폐기 상태 제외
  }
  return sample.status === filterStatus;
});


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
      className=" flex flex-1 justify-center py-5 bg-[#f8fbf8] min-h-screen"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* 상단 타이틀 + 버튼 */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0e1a0f] tracking-light text-[32px] font-bold leading-tight min-w-72">
                가검물
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
            <div className="px-4 py-3 flex gap-2">
                {["전체", "사용가능", "사용중", "폐기"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleFilterClick(status)}
                    className={`px-4 py-1 rounded-full text-sm font-medium border ${
                      filterStatus === status
                        ? "bg-[#519453] text-white"
                        : "bg-white text-[#0e1a0f] border-[#c9e1c9]"
                    }`}
                  >
                    {status}
                  </button>
                ))}
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
                      <th className="border border-[#e8f2e8] px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">검체 이름</th>
                      <th className="border border-[#e8f2e8] px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">검체 번호</th>
                      <th className="border border-[#e8f2e8] px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">잔여용량</th>
                      <th className="border border-[#e8f2e8] px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">검체</th>
                      <th className="border border-[#e8f2e8] px-4 py-2 text-left text-sm font-semibold text-[#0e1a0f]">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSamples.map((sample) => (
                      <tr
                        key={sample.id}
                        className="hover:bg-[#e8f2e8] cursor-pointer"
                        onClick={() => navigate(`/specimen/${sample.id}`)}
                      >
                        <td className="border border-[#e8f2e8] px-4 py-2 text-sm text-[#0e1a0f]">
                          {sample.sample_name || "-"}
                        </td>
                        <td className="border border-[#e8f2e8] px-4 py-2 text-sm text-[#0e1a0f] whitespace-nowrap">
                          {sample.sample_number || sample.id}
                        </td>

                        <td className="border border-[#e8f2e8] px-4 py-2 text-sm text-[#0e1a0f]">
                          {sample.volume_remaining || "-"} ml
                        </td>
                        <td className="border border-[#e8f2e8] px-4 py-2 text-sm text-[#0e1a0f]">
                          {sample.category || "-"}
                        </td>
                        <td className="border border-[#e8f2e8] px-4 py-2 text-sm text-[#0e1a0f]">
                          {sample.status || "-"}
                        </td>
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

