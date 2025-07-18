import React, { useEffect, useState } from "react";
import API_BASE_URL from "../services/api";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLabId, setUserLabId] = useState(null);

  const [actionFilter, setActionFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

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

  // 필터/페이지 변경 시 로그 데이터 요청
  useEffect(() => {
    if (!userLabId) return;

    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          limit: pageSize,
          skip: (page - 1) * pageSize,
          ...(actionFilter && { action: actionFilter }),
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
        });

        const res = await fetch(
          `${API_BASE_URL}/api/v1/logs/lab/${userLabId}?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        if (!res.ok) throw new Error("로그 데이터를 불러오지 못했습니다.");

        // 응답 헤더에서 총 개수 가져오기
        const total = res.headers.get("X-Total-Count");
        setTotalCount(total ? parseInt(total, 10) : 0);

        const data = await res.json();
        setLogs(data);

        // 고유한 카테고리 목록 추출 (전체 로그 기준)
        const uniqueCategories = Array.from(
          new Set(data.map(log => log.sample?.category).filter(Boolean))
        );
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [userLabId, actionFilter, startDate, endDate, page]);

  // 필터 변경 시 페이지 초기화
  useEffect(() => {
    setPage(1);
  }, [actionFilter, startDate, endDate]);

  // 카테고리 필터링 (클라이언트에서)
  const filteredLogs = logs.filter(log =>
    !categoryFilter || log.sample?.category === categoryFilter
  );

  const downloadCSV = () => {
    const header = ["ID", "샘플 번호", "사용자 이름", "행동", "기타", "시간"];
    const rows = filteredLogs.map(log => [
      log.id,
      log.sample?.sample_number,
      log.user?.name,
      log.action,
      log.etc,
      new Date(log.timestamp).toLocaleString("ko-KR"),
    ]);

    const csvContent = [header, ...rows]
      .map(e => e.map(v => `"${v ?? ""}"`).join(","))
      .join("\n");

      const bom = "\uFEFF";

    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logs-${new Date().toISOString()}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-1 justify-center py-5 bg-[#f8fbf8] min-h-screen">
      <div className="min-w-[600px] max-w-[960px] w-full rounded-lg ">
        <div className="p-4">
          <h2 className="text-[32px] font-bold text-[#101910]">로그 관리</h2>
          <p className="text-sm text-[#578e58]">검체 관리 시스템 로그 추적 및 분석</p>
        </div>

        <div className="flex gap-3 flex-wrap p-3">
          <select
            className="rounded-full h-8 bg-[#e9f1e9] px-4 text-sm"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
          >
            <option value="">Action</option>
            <option value="사용">사용</option>
            <option value="반납">반납</option>
            <option value="폐기">폐기</option>
          </select>

          <select
            className="rounded-full h-8 bg-[#e9f1e9] px-4 text-sm"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">카테고리</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="rounded-full h-8 bg-[#e9f1e9] px-4 text-sm"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <p>-</p>
          <input
            type="date"
            className="rounded-full h-8 bg-[#e9f1e9] px-4 text-sm"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-sm text-red-500">{error}</p>
        ) : (
          <>
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full">
                <thead className="bg-[#f9fbf9] text-sm text-[#101910]">
                  <tr>
                    <th className="px-4 py-3 text-left">검체</th>
                    <th className="px-4 py-3 text-left">샘플 번호</th>
                    <th className="px-4 py-3 text-left">사용자 이름</th>
                    <th className="px-4 py-3 text-left">행동</th>
                    <th className="px-4 py-3 text-left">기타</th>
                    <th className="px-4 py-3 text-left">시간</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-t">
                      <td className="px-4 py-2 text-sm text-[#578e58]">{log.sample?.category || "-"}</td>
                      <td className="px-4 py-2 text-sm text-[#578e58]">{log.sample?.sample_number || "-"}</td>
                      <td className="px-4 py-2 text-sm text-[#578e58]">{log.user?.name || "-"}</td>
                      <td className="px-4 py-2 text-sm text-[#578e58]">{log.action}</td>
                      <td className="px-4 py-2 text-sm text-[#578e58]">{log.etc || "-"}</td>
                      <td className="px-4 py-2 text-sm text-[#578e58]">{new Date(log.timestamp).toLocaleString("ko-KR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center gap-3 py-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`rounded px-3 py-1 border ${page === 1 ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-[#578e58] border-[#578e58] hover:bg-[#e9f1e9]"}`}
              >
                이전
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setPage(pageNum)}
                    className={`rounded px-3 py-1 border ${page === pageNum ? "bg-[#578e58] text-white" : "text-[#578e58] border-[#578e58] hover:bg-[#e9f1e9]"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`rounded px-3 py-1 border ${page === totalPages ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-[#578e58] border-[#578e58] hover:bg-[#e9f1e9]"}`}
              >
                다음
              </button>
            </div>
          </>
        )}

        <div className="flex justify-end px-4 py-3">
          <button
            onClick={downloadCSV}
            className="rounded-full h-10 px-4 bg-[#e9f1e9] text-sm font-bold text-[#101910]"
          >
            CSV Download
          </button>
        </div>
      </div>
    </div>
  );
}
