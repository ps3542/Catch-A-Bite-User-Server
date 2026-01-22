import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
// 사용자 기초 Layout
import AppUserBasicLayout from "../layout/appuser/BasicLayout.jsx";

import RoleLoginPage from "../pages/RoleLoginPage.jsx";
import RoleSelectPage from "../pages/RoleSelectPage.jsx";
import SignupOwnerPage from "../pages/SignupOwnerPage.jsx";
import SignupRiderPage from "../pages/SignupRiderPage.jsx";
import SignupUserPage from "../pages/SignupUserPage.jsx";
import OwnerMainPage from "../pages/owner/OwnerMainPage.jsx";
import RiderMainPage from "../pages/rider/RiderMainPage.jsx";
//import UserMainPage from "../pages/user/UserMainPage.jsx";

import UserMainPage from "../pages/user/UserMainPage.jsx";        //홈페이지
import UserSearchResult from "../pages/user/UserSearchResult.jsx";//주소 검색
import UserProfile from "../pages/user/UserProfile.jsx";          //마이페이지
import UserStorePage from"../pages/user/UserStorePage.jsx";       //가게 페이지
import UserMenuOption from "../pages/user/UserMenuOption.jsx";    //메뉴 추가 옵션
import UserCart from "../pages/user/UserCart.jsx";                //카트
import UserOrder from "../pages/user/UserOrder.jsx";              // 주문 (최신 주문내역)
import UserOrderDetail from "../pages/user/UserOrderDetail.jsx";  // 주문 메뉴 정보
import UserReview from "../pages/user/UserReview.jsx";            // Review
import UserOrderHistory from"../pages/user/UserOrderHistory.jsx"; // 주문내역
import UserFavoriteStores from "../pages/user/UserFavoriteStores.jsx";

export default function AppRouter({ onAuthRefresh }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/select" replace />} />
      <Route path="/select" element={<RoleSelectPage />} />

      {/* 로그인 */}
      <Route path="/user/login" element={<RoleLoginPage role="USER" onAuthRefresh={onAuthRefresh} />} />
      <Route path="/owner/login" element={<RoleLoginPage role="OWNER" onAuthRefresh={onAuthRefresh} />} />
      <Route path="/rider/login" element={<RoleLoginPage role="RIDER" onAuthRefresh={onAuthRefresh} />} />

      {/* 회원가입 */}
      <Route path="/user/signup" element={<SignupUserPage />} />
      <Route path="/owner/signup" element={<SignupOwnerPage />} />
      <Route path="/rider/signup" element={<SignupRiderPage />} />

      {/* --- 사용자 페이지 --- */}
      <Route path="/user" element={<AppUserBasicLayout />}>
        <Route index element={<Navigate to="main" replace />} />
        <Route path="main" element={<UserMainPage />} />
        <Route path="search" element={<UserSearchResult />} />
        <Route path="favorite" element={<UserFavoriteStores />} />
        <Route path="store/:storeId" element={<UserStorePage />} />
        <Route path="menu/:menuId" element={<UserMenuOption />} />
        {/* 
        <Route path="profile" element={<UserProfile />} />
        <Route path="cart" element={<UserCart />} />
        <Route path="order" element={<UserOrder />} />
        <Route path="orderDetail" element={<UserOrderDetail />} />
        <Route path="review" element={<UserReview />} />
        <Route path="orderHistory" element={<UserOrderHistory />} /> */}
      </Route>
        
      <Route path="/owner/main" element={<OwnerMainPage />} />
      <Route path="/rider/main" element={<RiderMainPage />} />

      <Route path="/owner" element={<Navigate to="/owner/main" replace />} />
      <Route path="/rider" element={<Navigate to="/rider/main" replace />} />

      <Route path="*" element={<Navigate to="/select" replace />} />
    </Routes>
  );
}
