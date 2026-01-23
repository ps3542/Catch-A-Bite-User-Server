import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout.jsx";
import useRoleGuard from "../../hooks/useRoleGuard.js";
import { loadActiveStoreId } from "../../components/owner/OwnerStoreContextBar.jsx";

const fallbackUser = { name: "Owner" };

export default function OwnerMainPage() {
  const navigate = useNavigate();
  const { user, loading } = useRoleGuard("OWNER", fallbackUser);

  const dateText = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const storeId = loadActiveStoreId();

  const quickActions = [
    { label: "리뷰 관리", hint: "답글/문의 처리", to: "/owner/reviews" },
    { label: "결제 내역", hint: "기간별 결제 조회", to: "/owner/payments" },
    { label: "정산 내역", hint: "정산 진행 상황 확인", to: "/owner/transactions" },
    { label: "매장 관리", hint: "매장 정보/상태 관리", to: "/owner/stores" },
  ];

  const summaryCards = [
    {
      title: "현재 매장",
      value: storeId ? String(storeId) : "미설정",
      meta: "상단에서 storeId를 적용하세요",
    },
    { title: "운영 상태", value: "-", meta: "매장 상태 API 연동 예정" },
  ];

  const activities = [{ title: "대시보드 진입", time: "방금", status: "OK" }];

  const notices = [
    {
      title: "연동 안내",
      detail:
        "리뷰/결제/정산은 storeId가 필요합니다. 상단에서 storeId를 적용하세요.",
    },
  ];

  const handleAction = (action) => {
    // action.to가 있으면 그 경로로 이동
    if (action?.to) navigate(action.to);
  };

  return (
    <DashboardLayout
      roleLabel="Owner"
      userName={user?.name ?? fallbackUser.name}
      dateText={dateText}
      quickActions={quickActions}
      summaryCards={summaryCards}
      activities={activities}
      notices={notices}
      isLoading={loading}
      onAction={handleAction}
    />
  );
}
