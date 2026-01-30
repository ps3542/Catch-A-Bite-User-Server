import react from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// 로그인 및 회원가입 관련 페이지 목록
import RoleLoginPage from "../pages/RoleLoginPage.jsx";
import RoleSelectPage from "../pages/RoleSelectPage.jsx";
import SignupOwnerPage from "../pages/SignupOwnerPage.jsx";
import SignupRiderPage from "../pages/SignupRiderPage.jsx";
import SignupUserPage from "../pages/SignupUserPage.jsx";
import OwnerMainPage from "../pages/owner/OwnerMainPage.jsx";
import RiderMainPage from "../pages/rider/RiderMainPage.jsx";

import AppUserRouter from "./AppUserRouter.jsx";


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
            <Route path="/user/*" element={<AppUserRouter />} />

            {/* --- 사업자 페이지 --- */}
            <Route path="/owner/main" element={<OwnerMainPage />} />

            {/* --- 라이더 페이지 --- */}
            <Route path="/rider/main" element={<RiderMainPage />} />

            {/* 리다이렉트 */}
            <Route path="/owner" element={<Navigate to="/owner/main" replace />} />
            <Route path="/rider" element={<Navigate to="/rider/main" replace />} />

            <Route path="*" element={<Navigate to="/select" replace />} />
        </Routes>
    );
}
