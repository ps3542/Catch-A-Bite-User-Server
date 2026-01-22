import DashboardLayout from "../../components/DashboardLayout.jsx";
import useRoleGuard from "../../hooks/useRoleGuard.js";

const fallbackUser = {
  name: "샘플 사장님",
};

const quickActions = [
  { label: "가게 관리", hint: "매장 정보 및 영업시간" },
  { label: "메뉴 등록", hint: "신규 메뉴 빠르게 추가" },
  { label: "주문 확인", hint: "대기 주문 현황 보기" },
];

const summaryCards = [
  { title: "오늘 주문", value: "23건", meta: "피크타임 12:00~13:00" },
  { title: "오늘 매출", value: "328,000원", meta: "전일 대비 +12%" },
];

const activities = [
  { title: "주문 #2314 접수 완료", time: "10분 전", status: "접수" },
  { title: "배달 픽업 요청", time: "30분 전", status: "대기" },
  { title: "리뷰 답글 작성", time: "오늘 09:20", status: "응답" },
  { title: "영업 상태 변경", time: "어제 22:10", status: "완료" },
  { title: "메뉴 품절 처리", time: "2일 전", status: "완료" },
];

const notices = [
  { title: "가게 운영 팁", detail: "이번 주 인기 메뉴 트렌드를 확인해보세요." },
  { title: "정산 안내", detail: "월말 정산 일정은 마이페이지에서 확인됩니다." },
];

export default function OwnerMainPage() {
  const { user, loading } = useRoleGuard("OWNER", fallbackUser);
  const dateText = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <DashboardLayout
      roleLabel="사장님"
      userName={user.name}
      dateText={dateText}
      quickActions={quickActions}
      summaryCards={summaryCards}
      activities={activities}
      notices={notices}
      isLoading={loading}
    />
  );
}
