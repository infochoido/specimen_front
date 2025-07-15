const SpecimenOverviewGraph = ({ trendData }) => {
  const trend = trendData?.map(Number) || [0, 0, 0, 0];
  const percentage =
    trend[0] === 0 ? 0 : Math.round(((trend[3] - trend[0]) / trend[0]) * 100);

  return (
    <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#d3e4d3] p-6">
      <p className="text-[#101910] text-base font-medium leading-normal">
        처리된 가검물
      </p>
      <p className="text-[#101910] tracking-light text-[32px] font-bold leading-tight truncate">
        {percentage > 0 ? `+${percentage}%` : `${percentage}%`}
      </p>
      <div className="flex gap-1">
        <p className="text-[#578e58] text-base font-normal leading-normal">
          최근 30일
        </p>
        <p className="text-[#078823] text-base font-medium leading-normal">
          {percentage > 0 ? `+${percentage}%` : `${percentage}%`}
        </p>
      </div>

      <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
        <div className="flex justify-between gap-2 items-end h-[100px]">
          {trend.map((val, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className="w-6 bg-[#578e58] rounded-t"
                style={{
                  height: `${(val / Math.max(...trend)) * 100 || 0}%`,
                }}
              />
              <p className="text-[12px] text-[#578e58] mt-1">W{idx + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecimenOverviewGraph;
