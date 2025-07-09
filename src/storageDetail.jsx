import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function StorageDetail() {
  const { storageId } = useParams();
  const [storage, setStorage] = useState(null);
  const [specimens, setSpecimens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const fetchStorageAndSpecimens = async () => {
      setLoading(true);
      setError(null);
      try {
        // 저장소 정보 가져오기
        const storageRes = await fetch(
          `https://specimenmanage.fly.dev/api/v1/storages/${storageId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!storageRes.ok) throw new Error("저장소 정보를 불러오지 못했습니다.");
        const storageData = await storageRes.json();
        setStorage(storageData);

        // 가검물 목록 가져오기: URL 정확히 확인 필요!
        const specimensRes = await fetch(
          `https://specimenmanage.fly.dev/api/v1/storages/${storageId}/case-samples`, // case-samples로 수정
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!specimensRes.ok) throw new Error("가검물 정보를 불러오지 못했습니다.");
        const specimensData = await specimensRes.json();
        setSpecimens(specimensData);
        console.log("가검물 데이터:", specimensData);
      } catch (err) {
        setError(err.message);
        setStorage(null);
        setSpecimens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStorageAndSpecimens();
  }, [storageId]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p style={{ color: "red" }}>❌ 오류: {error}</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">저장소 상세 정보</h1>
      {storage && (
        <div className="mb-6 border p-4 rounded bg-gray-50">
          <h2 className="text-xl font-semibold">{storage.name}</h2>
          <p>위치: {storage.location}</p>
          <p>설명: {storage.description || "-"}</p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">가검물 목록</h2>
      {specimens.length === 0 ? (
        <p>등록된 가검물이 없습니다.</p>
      ) : (
        <ul>
          {specimens.map((specimen) => (
            <li
              key={specimen.id}
              className="border p-2 rounded mb-2 bg-white shadow-sm"
            >
                <h3 className="font-semibold">{specimen.category}</h3>
                <p>샘플 번호: {specimen.sample_number}</p>
                <p>수집 날짜: {new Date(specimen.collected_date).toLocaleDateString()}</p>
                <p>종: {specimen.species}</p>
                <p>남은 양: {specimen.volume_remaining} ml</p>
                <p>수집 장소: {specimen.collected_place}</p>
                <p>검사 기관: {specimen.test_institution}</p>
                <p>검사 종류: {specimen.test_type}</p>
                <p>검출된 세균: {specimen.detected_bacteria || "-"}</p>
                <p>검출 날짜: {new Date(specimen.detected_date).toLocaleDateString() || "-"}</p>
                <p>법적 질병: {specimen.legal_disease || "-"}</p>
                <p>법적 그룹: {specimen.legal_group || "-"}</p>
                <p>상태: {specimen.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
