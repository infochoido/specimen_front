import React, { useEffect, useState } from "react";
import API_BASE_URL from "../services/api";

export default function LabPage() {
  const [lab, setLab] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLabAndMembers = async () => {
      try {
        // 현재 로그인한 사용자 정보 불러오기
        const userRes = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!userRes.ok) throw new Error("사용자 정보 로드 실패");
        const userData = await userRes.json();

        const labId = userData.lab_id;
        if (!labId) throw new Error("소속된 실험실이 없습니다");

        // 실험실 정보 불러오기
        const labRes = await fetch(`${API_BASE_URL}/api/v1/labs/${labId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!labRes.ok) throw new Error("실험실 정보 로드 실패");
        const labData = await labRes.json();
        setLab(labData);

        // 실험실 멤버 불러오기
        const membersRes = await fetch(`${API_BASE_URL}/api/v1/users/by-lab/${labId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!membersRes.ok) throw new Error("실험실 멤버 정보 로드 실패");
        const memberData = await membersRes.json();
        setMembers(memberData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLabAndMembers();
  }, []);

  if (loading) return <div className="p-10 text-[#101910]">로딩 중...</div>;
  if (error) return <div className="p-10 text-red-600">에러: {error}</div>;
  if (!lab) return <div className="p-10 text-gray-600">실험실 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="px-40 flex flex-1 justify-center py-5 bg-[#f8fbf8] min-h-screen">
      <div className="min-w-[600px] max-w-[960px] w-full  rounded-lg ">
        <h1 className="text-[32px] font-bold text-[#101910] mb-2">{lab.name}</h1>
        <p className="text-[#578e58] mb-6">{lab.location || "위치 정보 없음"}</p>

        <div className="border-t border-[#d3e4d3] pt-6">
          <h3 className="text-lg font-bold text-[#101910] mb-2">실험실 멤버</h3>
          <div className="overflow-hidden rounded-xl border border-[#d3e4d3]">
            <table className="w-full">
              <thead className="bg-[#f9fbf9]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#101910]">이름</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#101910]">이메일</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[#101910]">권한</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-t border-[#d3e4d3]">
                    <td className="px-4 py-3 text-sm text-[#101910]">{member.name}</td>
                    <td className="px-4 py-3 text-sm text-[#578e58]">{member.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-block bg-[#e9f1e9] text-[#101910] rounded-full px-4 py-1">
                        {member.role === "lab_admin"
                            ? "관리자"
                            : member.role === "user"
                            ? "일반멤버"
                            : member.role}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
