const DashboardSummaryCard = ({ label, value }) => (
  <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-[#e9f1e9]">
    <p className="text-[#101910] text-base font-medium">{label}</p>
    <p className="text-[#101910] text-2xl font-bold">{value}</p>
  </div>
);

export default DashboardSummaryCard;
