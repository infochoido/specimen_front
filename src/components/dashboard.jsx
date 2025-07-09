import { useEffect, useState } from "react";
import StorageAddForm from "./StorageAddForm";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [storages, setStorages] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleNewStorage = (newStorage) => {
    setStorages((prev) => [...prev, newStorage]);
  };

  useEffect(() => {
  setLoading(true);
  setError(null);
  setUser(null);  // 새로고침 시 상태 초기화
    const token = localStorage.getItem("access_token");
    
  const fetchUserAndStorages = async () => {
    setLoading(true);
    setError(null);
    setUser(null);
    try {
      const userRes = await fetch("https://specimenmanage.fly.dev/api/v1/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!userRes.ok) throw new Error("사용자 정보를 불러오지 못했습니다.");

      const userData = await userRes.json();
      if (!userData.lab_id) throw new Error("사용자의 실험실 ID가 없습니다.");
      setUser(userData);

      const storagesRes = await fetch(`https://specimenmanage.fly.dev/api/v1/storages/`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!storagesRes.ok) throw new Error("저장소 정보를 불러오지 못했습니다.");

      const storagesData = await storagesRes.json();
      setStorages(storagesData);
      console.log("저장소 데이터:", storagesData);
    } catch (err) {
      setError(err.message);
      setUser(null);
      setStorages([]);
    } finally {
      setLoading(false);
    }
  };

  fetchUserAndStorages();
}, []);
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">대시보드</h1>

      {loading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p className="text-red-500">❌ 오류: {error}</p>
      ) : (
        user && (
          <div className="mb-6 border p-4 rounded bg-gray-50">
            <h2 className="text-xl font-semibold">사용자 정보</h2>
            <p>이름: {user.name}</p>
            <p>이메일: {user.email}</p>
            <p>소속 실험실: {user.lab_name || user.lab_id}</p>
            <p>역할: {user.role}</p>
          </div>
        )
      )}

      <StorageAddForm onStorageAdded={handleNewStorage} />

      <ul className="mt-6 space-y-2">
        {storages.map((storage) => (
          <Link to={`/storages/${storage.id}`} className="block">
            <strong>{storage.name}</strong> - {storage.location} <br />
            <small>실험실: {storage.lab_name || storage.lab_id}</small>
          </Link>
        ))}
      </ul>
      <button className="mt-4 bg-blue-600 text-white p-2 rounded"><Link to="/casesample-add">가검물 추가</Link></button>
      <button className="mt-4 bg-blue-600 text-white p-2 rounded"><Link to="/log">로그</Link></button>
    </div>
  );
}
