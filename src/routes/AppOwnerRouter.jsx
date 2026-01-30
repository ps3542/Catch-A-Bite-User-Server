import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import OwnerLayout from "../layout/owner/OwnerLayout";

import OwnerMainPage from "../pages/owner/OwnerMainPage.jsx";

import OwnerStoreListPage from "../pages/owner/store/OwnerStoreListPage.jsx";
import OwnerStoreCreatePage from "../pages/owner/store/OwnerStoreCreatePage.jsx";
import OwnerStoreEditPage from "../pages/owner/store/OwnerStoreEditPage.jsx";
import OwnerStoreImagePage from "../pages/owner/storeImage/OwnerStoreImagePage.jsx";

import OwnerMenuPage from "../pages/owner/menu/OwnerMenuPage.jsx";
import OwnerMenuEditPage from "../pages/owner/menu/OwnerMenuEditPage.jsx";
import OwnerMenuCategoryPage from "../pages/owner/menu/OwnerMenuCategoryPage.jsx";
import OwnerMenuOptionPage from "../pages/owner/menu/OwnerMenuOptionPage.jsx";

import OwnerOrderListPage from "../pages/owner/order/OwnerOrderListPage.jsx";
import OwnerOrderDetailPage from "../pages/owner/order/OwnerOrderDetailPage.jsx";

import OwnerReviewPage from "../pages/owner/review/OwnerReviewPage.jsx";
import OwnerPaymentPage from "../pages/owner/payment/OwnerPaymentPage.jsx";
import OwnerTransactionPage from "../pages/owner/transaction/OwnerTransactionPage.jsx";

import OwnerDeliveryListPage from "../pages/owner/delivery/OwnerDeliveryListPage.jsx";
import OwnerDeliveryDetailPage from "../pages/owner/delivery/OwnerDeliveryDetailPage.jsx";

export default function AppOwnerRouter() {

  return (
    <Routes>
      {/* 보호 라우트 */}
      <Route
        element={<ProtectedRoute expectedRole="OWNER" redirectTo="/owner/login" />}
      >
        {/* /owner 하위는 OwnerLayout */}
        <Route path="/" element={<OwnerLayout />}>
          <Route index element={<Navigate to="main" replace />} />
          <Route path="main" element={<OwnerMainPage />} />

          {/* 사이드바 링크와 매칭 */}
          <Route path="stores" element={<OwnerStoreListPage />} />
          <Route path="stores/new" element={<OwnerStoreCreatePage />} />
          <Route path="stores/:storeId/edit" element={<OwnerStoreEditPage />} />
          <Route path="stores/:storeId/images" element={<OwnerStoreImagePage />} />

          <Route path="stores/:storeId/menus" element={<OwnerMenuPage />} />
          <Route path="stores/:storeId/menus/new" element={<OwnerMenuEditPage />} />
          <Route path="stores/:storeId/menus/:menuId/edit" element={<OwnerMenuEditPage />} />
          <Route path="stores/:storeId/menus/categories" element={<OwnerMenuCategoryPage />} />
          <Route path="stores/:storeId/menus/options" element={<OwnerMenuOptionPage />} />

          <Route path="stores/:storeId/orders" element={<OwnerOrderListPage />} />
          <Route path="stores/:storeId/orders/:orderId" element={<OwnerOrderDetailPage />} />

          <Route path="stores/:storeId/reviews" element={<OwnerReviewPage />} />
          <Route path="stores/:storeId/payments" element={<OwnerPaymentPage />} />
          <Route path="stores/:storeId/transactions" element={<OwnerTransactionPage />} />

          <Route path="deliveries" element={<OwnerDeliveryListPage />} />
          <Route path="deliveries/:deliveryId" element={<OwnerDeliveryDetailPage />} />

          {/* backward-compatible routes */}
          <Route path="reviews" element={<OwnerReviewPage />} />
          <Route path="payments" element={<OwnerPaymentPage />} />
          <Route path="transactions" element={<OwnerTransactionPage />} />
        </Route>
      </Route>

      {/* /owner 진입 시 main으로 */}
      <Route path="*" element={<Navigate to="main" replace />} />
    </Routes>
  );
}
