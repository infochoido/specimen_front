import React, { useState,useEffect } from "react";
import API_BASE_URL from "../services/api";
import * as XLSX from "xlsx";

export default function ExcelUploadModal({ isOpen, onClose, onSave, labId, uploadProgress }) {
  const [excelData, setExcelData] = useState([]);
  const [mapping, setMapping] = useState({}); // 엑셀컬럼명 : db컬럼명 매핑
  const [storageId, setStorageId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [sampleNameFromFilename, setSampleNameFromFilename] = useState("");
  const [dbColumns] = useState([
  { key: "sample_number", label: "샘플 번호*" },
  { key: "category", label: "검체*" },
  { key: "species", label: "샘플 이름" },
  { key: "status", label: "상태" },
  { key: "collected_place", label: "채취 장소" },
  { key: "collected_date", label: "채취 날짜" },
  { key: "volume_remaining", label: "잔여 용량" },

  ]);

  useEffect(() => {
  const fetchUser = async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (res.ok) {
      const user = await res.json();
      console.log("✅ 유저 정보", user); // ← 여기 확인
      setUserId(user.id);
    } else {
      console.error("❌ 유저 정보 불러오기 실패");
    }
  };
  fetchUser();
}, []);



  const handleFileChange = (e) => {
    const f = e.target.files[0];

    const fileName = f.name;
    const sampleName = fileName.includes("_") ? fileName.split("_")[0] : "";
    setSampleNameFromFilename(sampleName);

    const reader = new FileReader();
    reader.onload = (evt) => {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        
        setExcelData(jsonData);

        // 초기 매핑 셋업: 엑셀 첫 행 키에 대해 빈값으로 매핑 세팅
        if (jsonData.length > 0) {
        const firstRow = jsonData[0];
        const initialMapping = {};
        Object.keys(firstRow).forEach((key) => {
            initialMapping[key] = ""; // 빈값: 미지정 상태
        });
        setMapping(initialMapping);
        }
    };
    reader.readAsBinaryString(f);
    };


  const handleMappingChange = (excelCol, e) => {
    setMapping((prev) => ({ ...prev, [excelCol]: e.target.value }));
  };

    useEffect(() => {
  if (!labId) return;

  const getEtcStorage = async () => {
    const id = await fetchEtcStorageId(labId);
    setStorageId(id);
  };

  getEtcStorage();
}, [labId]);

const fetchEtcStorageId = async (labId) => {
    
  try {
    
    const res = await fetch(`${API_BASE_URL}/api/v1/storages/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!res.ok) throw new Error(`보관소 목록 불러오기 실패: ${res.status}`);

    const data = await res.json();

    const etcStorage = data.find(
      (storage) => storage.lab_id === labId && storage.name === "기타 보관함"
    );

    if (!etcStorage) throw new Error("기타 보관함이 존재하지 않습니다.");
    setStorageId(etcStorage.id);
    console.log("기타 보관함 ID:", etcStorage.id); // 디버깅용 로그
    return etcStorage.id;
  } catch (err) {
    console.error("기타 보관함 ID 가져오기 실패:", err.message);
    return null;
  }
};



const handleSave = () => {
  if (!storageId) {
    alert("기타 저장소 ID를 불러오는 중입니다. 잠시만 기다려 주세요.");
    return;
  }

  const mappedData = excelData.flatMap((row) => {
    const baseData = {};
    for (const excelCol in mapping) {
      const dbCol = mapping[excelCol];
      if (dbCol && dbCol !== "category") {
        baseData[dbCol] = row[excelCol];
      }
    }
    if (!baseData.status) {
      baseData.status = "사용가능";
    }
    baseData.storage_id = storageId;
    baseData.lab_id = labId;
    baseData.current_user_id =  userId;
    baseData.sample_name = sampleNameFromFilename;

    const rawCategory = row[Object.keys(mapping).find((key) => mapping[key] === "category")];
    if (!rawCategory) return []; // category 없으면 저장 안함

    const categories = rawCategory
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (categories.length === 0) return [];

    return categories.map((catItem) => ({
      ...baseData,
      category: catItem,
    }));
  });

  onSave(mappedData);
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">엑셀 파일 업로드 및 매핑</h2>
        {sampleNameFromFilename && (
            <p className="mb-2 text-sm text-gray-700">
                검체 이름: <strong>{sampleNameFromFilename}</strong>
            </p>
            )}
        <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
       {uploadProgress && (
            <p className="text-sm text-gray-600 mt-4">{uploadProgress}</p>
            )}
        {Object.keys(mapping).length > 0 && (
          <table className="table-auto w-full mt-4 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">엑셀 컬럼명</th>
                <th className="border border-gray-300 p-2">DB 컬럼 매핑</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(mapping).map(([excelCol, dbCol]) => (
                <tr key={excelCol}>
                  <td className="border border-gray-300 p-2">{excelCol}</td>
                  <td className="border border-gray-300 p-2">
                    <select
                        value={dbCol}
                        onChange={(e) => handleMappingChange(excelCol, e)}
                        className="w-full border rounded px-2 py-1"
                        >
                        <option value="">선택 안함</option>
                        {dbColumns.map(({ key, label }) => (
                            <option key={key} value={key}>
                            {label}
                            </option>
                        ))}
                        </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}