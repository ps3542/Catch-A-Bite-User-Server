import DashboardLayout from "../../components/DashboardLayout.jsx";
import useRoleGuard from "../../hooks/useRoleGuard.js";

const fallbackUser = {
  name: "샘플 사용자",
};

export default function UserOrderDetail() {
  const { user, loading } = useRoleGuard("USER", fallbackUser);

  return (
    <DashboardLayout
      roleLabel="사용자"
      userName={user.name}
      dateText="주문 상세"
      isLoading={loading}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">주문 상세 내역</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">주문 상세 내역 페이지입니다.</p>
      </div>
    </DashboardLayout>
  );
}
