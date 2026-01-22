import DashboardLayout from "../../components/DashboardLayout.jsx";
import useRoleGuard from "../../hooks/useRoleGuard.js";

const fallbackUser = {
  name: "샘플 사용자",
};

export default function UserCart() {
  const { user, loading } = useRoleGuard("USER", fallbackUser);

  return (
    <DashboardLayout
      roleLabel="사용자"
      userName={user.name}
      dateText="장바구니"
      isLoading={loading}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">장바구니</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">장바구니에 담긴 상품이 없습니다.</p>
        <p className="text-gray-600">원하는 메뉴를 담아보세요!</p>
      </div>
    </DashboardLayout>
  );
}
