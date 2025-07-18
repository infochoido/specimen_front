import React, { useEffect, useState } from "react";
import DashboardSummaryCard from "../components/DashboardSummaryCard";
import SpecimenOverviewGraph from "../components/SpecimenOverviewGraph";
import SpecimenTypeChart from "../components/SpecimenTypeChart";
import API_BASE_URL from "../services/api";
import { API_DEV_URL } from "../services/api"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [error, setError] = useState(null);
  const [labId, setLabId] = useState(null);
  const navigate = useNavigate();
   const { isLoggedIn, user, checkLogin } = useAuth();
  

  useEffect(() => {
    if (isLoggedIn !== true) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        const data = await res.json();
        setLabId(data.lab_id);
      } catch (err) {
        
        setError("사용자 정보를 불러오지 못했습니다.");
        navigate("/");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/case-samples/stats`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error("대시보드 데이터를 불러오지 못했습니다.");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const userRes = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!userRes.ok) throw new Error("사용자 정보 불러오기 실패");
      const userData = await userRes.json();
      const labId = userData.lab_id;

      const res = await fetch(`${API_BASE_URL}/api/v1/logs/lab/${labId}/recent`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error("최근 로그 불러오기 실패");
      const data = await res.json();
      setRecentLogs(data.slice(0,5));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  fetchStats();
  fetchRecentLogs();
}, []);

  if (!isLoggedIn) {
    return <div className="w-full flex min-h-screen items-center flex-col justify-center"><p className="font-bold text-xl">로그인을 해주세요</p></div>
  }


  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!stats) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#101910] text-[32px] font-bold">대시보드</p>
            </div>

            <div className="flex flex-wrap gap-4 p-4">
              <DashboardSummaryCard label="총 검체" value={stats.total} />
              <DashboardSummaryCard label="현재 저장중인 검체" value={stats.in_storage} />
              <DashboardSummaryCard label="사용중 or 폐기된 검체" value={stats.processed} />
            </div>

            <h2 className="text-[#101910] text-[22px] font-bold px-4 pb-3 pt-5">검체 개요</h2>
            <div className="flex flex-wrap gap-4 px-4 py-6">
              <SpecimenOverviewGraph trendData={stats.recent_trend} />
              <SpecimenTypeChart byType={stats.by_type} />
            </div>
            
            <h2 className="text-[#101910] text-[22px] font-bold px-4 pb-3 pt-5">
              최근 로그
            </h2>

            <div className="px-4 pb-8">
              <div
                className="overflow-x-auto rounded-xl border cursor-pointer hover:shadow-md transition"
                onClick={() => navigate("/logs")}
              >
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
                    {(recentLogs || []).map((log) => (
                      <tr key={log.id} className="border-t">
                        <td className="px-4 py-2 text-sm text-[#578e58]">
                          {log.sample?.category || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-[#578e58]">
                          {log.sample?.sample_number || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-[#578e58]">
                          {log.user?.name || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-[#578e58]">
                          {log.action}
                        </td>
                        <td className="px-4 py-2 text-sm text-[#578e58]">
                          {log.etc || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-[#578e58]">
                          {new Date(log.timestamp).toLocaleString("ko-KR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
