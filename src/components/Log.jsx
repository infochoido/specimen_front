import { useEffect, useState } from "react";

export default function LogList() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    user_id: "",
    action: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("access_token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });
      query.append("limit", 100);

      const res = await fetch(
        `https://specimenmanage.fly.dev/api/v1/logs?${query.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("로그 불러오기 실패");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">로그 목록</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <input
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={handleChange}
          className="border p-2"
          placeholder="시작 날짜"
        />
        <input
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={handleChange}
          className="border p-2"
          placeholder="종료 날짜"
        />
        <select
          name="action"
          value={filters.action}
          onChange={handleChange}
          className="border p-2"
        >
          <option value="">-- 사용 목적 --</option>
          <option value="사용">사용</option>
          <option value="반납">반납</option>
          <option value="폐기">폐기</option>
        </select>
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="border p-2"
        >
          <option value="">-- 샘플 종류 --</option>
          <option value="분변">분변</option>
          <option value="혈액">혈액</option>
          <option value="피부">피부</option>
          <option value="땀">땀</option>
          <option value="침">침</option>
          <option value="기타">기타</option>
          <option value="직접입력">직접입력</option>
        </select>
      </div>

      <button
        onClick={fetchLogs}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        필터 적용
      </button>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">사용자</th>
            <th className="border p-2">샘플 ID</th>
            <th className="border p-2">동작</th>
            <th className="border p-2">비고</th>
            <th className="border p-2">시간</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="border p-2">{log.id}</td>
              <td className="border p-2">{log.user_id}</td>
              <td className="border p-2">{log.sample_id}</td>
              <td className="border p-2">{log.action}</td>
              <td className="border p-2">{log.etc}</td>
              <td className="border p-2">{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
