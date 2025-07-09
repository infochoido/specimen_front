import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpForm from "./components/SignUpForm"
import LabSetupForm from "./labs/setup/LabSetupForm"
import Dashboard from "./components/dashboard"
import LogInForm from "./components/LogInForm";
import CaseSampleAddForm from "./components/CaseSampleAddForm";
import LogList from "./components/Log";
// import Dashboard from "./Dashboard"; // 예시, 가입 후 이동할 페이지

import StorageDetail from "./StorageDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUpForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        {/* 회원가입 후 실험실 설정 페이지로 이동 */}
        <Route path="/labs/setup" element={<LabSetupForm />} />
        <Route path="/login" element={<LogInForm />} />
        {/* 로그인 후 대시보드로 이동 */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* 필요하면 추가 라우트 더 넣기 */}
        <Route path="/storages/:storageId" element={<StorageDetail />} />
        <Route path="/casesample-add" element={<CaseSampleAddForm />} />
        <Route path="/log" element={<LogList />} />
      </Routes>
    </Router>
  );
}

export default App;
