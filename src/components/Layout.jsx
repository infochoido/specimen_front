import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#f9fbf9] font-sans">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      
    </div>
  );
};

export default Layout;