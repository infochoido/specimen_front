import React, { useEffect, useState } from "react";
import API_BASE_URL from "../services/api";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLabId, setUserLabId] = useState(null);

  const [actionFilter, setActionFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          limit: 100,
          ...(actionFilter && { action: actionFilter }),
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
        });

        const res = await fetch(
          `${API_BASE_URL}/api/v1/logs/lab/${userLabId}?${queryParams}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (!res.ok) throw new Error("로그 데이터를 불러오지 못했습니다.");
        const data = await res.json();
        setLogs(data);

        // 고유한 카테고리 목록 추출
        const uniqueCategories = Array.from(
          new Set(
            data
              .map(log => log.sample?.category)
              .filter(category => category)
          )
        );
        setCategories(uniqueCategories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [userLabId, actionFilter, startDate, endDate]);

  // 필터링된 로그 계산
  useEffect(() => {
    const filtered = logs.filter(log =>
      !categoryFilter || log.sample?.category === categoryFilter
    );
    setFilteredLogs(filtered);
  }, [logs, categoryFilter]);

  const downloadCSV = () => {
    const header = ["ID", "샘플 번호", "사용자 이름", "행동", "기타", "시간"];
    const rows = filteredLogs.map(log => [
      log.id,
      log.sample?.sample_number,
      log.user?.name,
      log.action,
      log.etc,
      log.timestamp,
    ]);

    const csvContent = [header, ...rows]
      .map(e => e.map(v => `"${v ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logs-${new Date().toISOString()}.csv`;
    link.click();
  };

  return (
    <div className="px-40 py-5">
      <div className="max-w-[960px] mx-auto">
        <div className="p-4">
          <h2 className="text-[32px] font-bold text-[#101910]">Log Management</h2>
          <p className="text-sm text-[#578e58]">View and manage all system logs</p>
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
