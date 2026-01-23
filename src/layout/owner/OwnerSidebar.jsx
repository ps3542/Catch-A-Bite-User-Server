// src/layout/owner/OwnerSidebar.jsx
import { NavLink } from "react-router-dom";

const OwnerSidebar = () => {
  return (
    <aside
      style={{
        width: "220px",
        backgroundColor: "#212529",
        color: "#fff",
        padding: "16px",
      }}
    >
      <h2 style={{ color: "#fff", marginBottom: "24px" }}>사장님</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <NavLink to="/owner/main" style={linkStyle}>
          대시보드
        </NavLink>
        <NavLink to="/owner/stores" style={linkStyle}>
          매장 관리
        </NavLink>
        <NavLink to="/owner/stores/1/menus" style={linkStyle}>
          메뉴 관리
        </NavLink>
        <NavLink to="/owner/stores/1/orders" style={linkStyle}>
          주문 관리
        </NavLink>
        <NavLink to="/owner/reviews" style={linkStyle}>
          리뷰 관리
        </NavLink>
        <NavLink to="/owner/payments" style={linkStyle}>
          결제 내역
        </NavLink>
        <NavLink to="/owner/transactions" style={linkStyle}>
          정산 내역
        </NavLink>
      </nav>
    </aside>
  );
};

const linkStyle = ({ isActive }) => ({
  color: isActive ? "#0d6efd" : "#dee2e6",
  textDecoration: "none",
  fontWeight: isActive ? "bold" : "normal",
});

export default OwnerSidebar;
