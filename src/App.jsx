import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Specimen from "./pages/Specimen";
import Storage from "./pages/Storage";
import Logs from "./pages/Logs";
import Lab from "./pages/Lab";
import SpecimenAdd from "./pages/SpecimenAdd";
import SpecimenDetail from "./pages/SpecimenDetail";
import StoragesSamples from "./pages/StoragesSamples";
import AppWrapper from "./api/AppWrapper";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppWrapper />}>
          <Route index element={<Dashboard />} />
          <Route path="specimen" element={<Specimen />} />
          <Route path="storage" element={<Storage />} />
          <Route path="logs" element={<Logs />} />
          <Route path="lab" element={<Lab />} />
          <Route path="specimen/add" element={<SpecimenAdd />} />
          <Route path="specimen/:id" element={<SpecimenDetail />} />
          <Route path="storage/:storageId" element={<StoragesSamples />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
