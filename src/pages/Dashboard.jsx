import React, { useEffect, useState } from "react";
import DashboardSummaryCard from "../components/DashboardSummaryCard";
import SpecimenOverviewGraph from "../components/SpecimenOverviewGraph";
import SpecimenTypeChart from "../components/SpecimenTypeChart";
import API_BASE_URL from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

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

    fetchStats();
  }, []);

  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!stats) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#101910] text-[32px] font-bold">대쉬보드</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
