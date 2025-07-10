import Sidebar from "../components/Sidebar";
import DashboardSummaryCard from "../components/DashboardSummaryCard";
import SpecimenOverviewGraph from "../components/SpecimenOverviewGraph";
import SpecimenTypeChart from "../components/SpecimenTypeChart";

const Dashboard = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#101910] text-[32px] font-bold">Dashboard</p>
            </div>
            <div className="flex flex-wrap gap-4 p-4">
              <DashboardSummaryCard label="Total Specimens" value="1,250" />
              <DashboardSummaryCard label="Specimens in Storage" value="875" />
              <DashboardSummaryCard label="Specimens Processed" value="375" />
            </div>
            <h2 className="text-[#101910] text-[22px] font-bold px-4 pb-3 pt-5">Specimen Overview</h2>
            <div className="flex flex-wrap gap-4 px-4 py-6">
              <SpecimenOverviewGraph />
              <SpecimenTypeChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
