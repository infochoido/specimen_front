import React, { useState } from 'react';

const SpecimenTypeChart = ({ byType }) => {
  const types = Object.entries(byType || {});
  const maxVal = Math.max(...types.map(([_, val]) => val));

  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#d3e4d3] p-6 overflow-x-auto">
      <p className="text-[#101910] text-base font-medium leading-normal">검체별 분류</p>
      <p className="text-[#101910] tracking-light text-[32px] font-bold leading-tight truncate">
        {types.reduce((acc, [, val]) => acc + val, 0).toLocaleString()}개
      </p>
      <div className="flex gap-1">
        <p className="text-[#578e58] text-base font-normal leading-normal">이번달 신규 가검물</p>
      </div>
      <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center relative">
        {types.map(([type, value], idx) => (
          <React.Fragment key={idx}>
            <div
              className="border-[#578e58] bg-[#e9f1e9] border-t-2 w-full relative cursor-pointer"
              style={{ height: `${(value / maxVal) * 100}%` }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* hover 시 value 표시 */}
              {hoveredIdx === idx && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#578e58] text-white text-xs px-2 py-1 rounded whitespace-nowrap select-none pointer-events-none z-10">
                  {value.toLocaleString()}
                </div>
              )}
            </div>
            <p className="text-[#578e58] text-[13px] font-bold">{type}</p>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SpecimenTypeChart;
