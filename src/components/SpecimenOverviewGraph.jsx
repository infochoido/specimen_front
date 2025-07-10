const SpecimenOverviewGraph = () => {
  return (
    <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#d3e4d3] p-6">
      <p className="text-[#101910] text-base font-medium leading-normal">Specimen Processing Trend</p>
      <p className="text-[#101910] tracking-light text-[32px] font-bold leading-tight truncate">+15%</p>
      <div className="flex gap-1">
        <p className="text-[#578e58] text-base font-normal leading-normal">Last 30 Days</p>
        <p className="text-[#078823] text-base font-medium leading-normal">+15%</p>
      </div>
      <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
        <svg width="100%" height="148" viewBox="-3 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
            fill="url(#paint0_linear_1131_5935)"
          ></path>
          <path
            d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
            stroke="#578e58"
            strokeWidth="3"
            strokeLinecap="round"
          ></path>
          <defs>
            <linearGradient id="paint0_linear_1131_5935" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e9f1e9"></stop>
              <stop offset="1" stopColor="#e9f1e9" stopOpacity="0"></stop>
            </linearGradient>
          </defs>
        </svg>
        <div className="flex justify-around">
          <p className="text-[#578e58] text-[13px] font-bold">Week 1</p>
          <p className="text-[#578e58] text-[13px] font-bold">Week 2</p>
          <p className="text-[#578e58] text-[13px] font-bold">Week 3</p>
          <p className="text-[#578e58] text-[13px] font-bold">Week 4</p>
        </div>
      </div>
    </div>
  );
};

export default SpecimenOverviewGraph;
