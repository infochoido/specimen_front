import React from "react";

const SpecimenTypeChart = () => {
  return (
    <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#d3e4d3] p-6">
      <p className="text-[#101910] text-base font-medium leading-normal">Specimen Types Distribution</p>
      <p className="text-[#101910] tracking-light text-[32px] font-bold leading-tight truncate">250</p>
      <div className="flex gap-1">
        <p className="text-[#578e58] text-base font-normal leading-normal">Current Month</p>
        <p className="text-[#078823] text-base font-medium leading-normal">+10%</p>
      </div>
      <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
        <div className="border-[#578e58] bg-[#e9f1e9] border-t-2 w-full" style={{ height: "60%" }}></div>
        <p className="text-[#578e58] text-[13px] font-bold">Type A</p>
        <div className="border-[#578e58] bg-[#e9f1e9] border-t-2 w-full" style={{ height: "10%" }}></div>
        <p className="text-[#578e58] text-[13px] font-bold">Type B</p>
        <div className="border-[#578e58] bg-[#e9f1e9] border-t-2 w-full" style={{ height: "10%" }}></div>
        <p className="text-[#578e58] text-[13px] font-bold">Type C</p>
        <div className="border-[#578e58] bg-[#e9f1e9] border-t-2 w-full" style={{ height: "100%" }}></div>
        <p className="text-[#578e58] text-[13px] font-bold">Type D</p>
      </div>
    </div>
  );
};

export default SpecimenTypeChart;
