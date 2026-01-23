// src/layout/owner/OwnerHeader.jsx
const OwnerHeader = () => {
  return (
    <header
      style={{
        height: "56px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #dee2e6",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <span>사업자 관리 시스템</span>
      <button
        style={{
          border: "none",
          backgroundColor: "#dc3545",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        로그아웃
      </button>
    </header>
  );
};

export default OwnerHeader;
