import { Navigate, Route, Routes } from "react-router-dom";

import UserMainPage from "../pages/user/UserMainPage.jsx";        //홈페이지
import UserSearchResult from "../pages/user/UserSearchResult.jsx";//주소 검색
import UserProfile from "../pages/user/UserProfile.jsx";          //마이페이지
import UserStorePage from"../pages/user/UserStorePage.jsx";       //가게 페이지
import UserMenuOption from "../pages/user/UserMenuOption.jsx";    //메뉴 추가 옵션
import UserCart from "../pages/user/UserCart.jsx";                //카트
import UserOrder from "../pages/user/UserOrder.jsx";              // 주문 (최신 주문내역)
import UserReview from "../pages/user/UserReview.jsx";            // Review
import UserOrderHistory from"../pages/user/UserOrderHistory.jsx"; // 주문내역
import UserFavoriteStores from "../pages/user/UserFavoriteStores.jsx";
import UserPayment from "../pages/user/UserPayment.jsx";
import UserCurrentOrder from "../pages/user/UserCurrentOrder.jsx";// 주문 메뉴 정보

// 사용자 기초 Layout
import AppUserBasicLayout from "../layout/appuser/BasicLayout.jsx";

export default function AppUserRouter() {
    return (
        <Routes>
            <Route path="/" element={<AppUserBasicLayout />}>
                <Route index element={<Navigate to="main" replace />} />
                <Route path="main" element={<UserMainPage />} />
                <Route path="search" element={<UserSearchResult />} />
                <Route path="favorite" element={<UserFavoriteStores />} />
                <Route path="store/:storeId" element={<UserStorePage />} />
                <Route path="menu/:menuId" element={<UserMenuOption />} />
                {/* 주문내역 */}
                <Route path="orderHistory" element={<UserOrderHistory />} /> 
                <Route path="cart" element={<UserCart />} />
                {/* 카트를 주문하는 페이지 */}
                <Route path="order" element={<UserOrder />} /> 
                {/* 결제 */}
                <Route path="payment" element={<UserPayment />} />
                {/* 결제 후 페이지 */}
                <Route path="currentOrder/:orderId" element={<UserCurrentOrder />} />
                <Route path="review/:orderId" element={<UserReview />} />

                {/* 
                <Route path="profile" element={<UserProfile />} />
                */}
            </Route>
            
        </Routes>
    );
}