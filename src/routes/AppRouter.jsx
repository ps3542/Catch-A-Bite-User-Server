import { Navigate, Route, Routes } from "react-router-dom";

// 로그인 및 회원가입 관련 페이지 목록
import RoleLoginPage from "../pages/RoleLoginPage.jsx";
import RoleSelectPage from "../pages/RoleSelectPage.jsx";
import SignupOwnerPage from "../pages/SignupOwnerPage.jsx";
import SignupRiderPage from "../pages/SignupRiderPage.jsx";
import SignupUserPage from "../pages/SignupUserPage.jsx";

import RiderMainPage from "../pages/rider/RiderMainPage.jsx";

import AppUserRouter from "./AppUserRouter.jsx";
import AppOwnerRouter from "./AppOwnerRouter.jsx";


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

      {/* 로그인 */}
      <Route
        path="/user/login"
        element={<RoleLoginPage role="USER" onAuthRefresh={onAuthRefresh} />}
      />
      <Route
        path="/owner/login"
        element={<RoleLoginPage role="OWNER" onAuthRefresh={onAuthRefresh} />}
      />
      <Route
        path="/rider/login"
        element={<RoleLoginPage role="RIDER" onAuthRefresh={onAuthRefresh} />}
      />

            {/* --- 사업자 페이지 --- */}
            <Route path="/owner/main" element={<OwnerMainPage />} />

      {/* --- 사용자 페이지 --- */}
      <Route path="/user" element={<AppUserBasicLayout />}>
        <Route index element={<Navigate to="main" replace />} />
        <Route path="main" element={<UserMainPage />} />
        <Route path="search" element={<UserSearchResult />} />
        <Route path="favorite" element={<UserFavoriteStores />} />
        <Route path="store/:storeId" element={<UserStorePage />} />
        <Route path="menu/:menuId" element={<UserMenuOption />} />
      </Route>

      {/* --- 사업자 페이지 --- */}
      <Route path="/owner/*" element={<AppOwnerRouter />} />

      {/* --- 라이더 페이지 --- */}
      <Route path="/rider/main" element={<RiderMainPage />} />
      <Route path="/rider" element={<Navigate to="/rider/main" replace />} />

            <Route path="*" element={<Navigate to="/select" replace />} />
        </Routes>
    );
}
