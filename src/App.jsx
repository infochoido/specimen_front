import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Specimen from "./pages/Specimen";
import Storage from "./pages/Storage";
import Logs from "./pages/Logs";
import Lab from "./pages/Lab";
import SpecimenAdd from "./pages/SpecimenAdd";

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/specimen" element={<Specimen />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/lab" element={<Lab />} />
           <Route path="/specimen/add" element={<SpecimenAdd />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;