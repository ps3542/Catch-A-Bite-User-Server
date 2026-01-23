// src/layout/owner/OwnerLayout.jsx
import { Outlet } from "react-router-dom";
import OwnerSidebar from "./OwnerSidebar";
import OwnerHeader from "./OwnerHeader";

const OwnerLayout = () => {
  return (
    <div className="owner-layout" style={{ display: "flex", minHeight: "100vh" }}>
      <OwnerSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <OwnerHeader />
        <main style={{ flex: 1, padding: "24px", backgroundColor: "#f8f9fa" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
