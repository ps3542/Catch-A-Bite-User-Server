import { useEffect, useState } from 'react';
import DashboardLayout from "../../components/DashboardLayout.jsx";
import useRoleGuard from "../../hooks/useRoleGuard.js";
import { appUserStoreService } from "../../api/appuser/StoreService";
import './UserMainPage.css';
// Carousel 및 관련 스타일
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// 새로 만든 StoreCarousel 컴포넌트 임포트 (경로 확인 필요)
import StoreCarousel from "../../components/appuser/StoreCarousel.jsx";

const fallbackUser = {
  name: "샘플 사용자",
};

// --- 더미 데이터 영역 ---

const storeCategory = [
  { id: 1, color: '#FFEBEE', text: '치킨' },
  { id: 2, color: '#E8F5E9', text: '한식' },
  { id: 3, color: '#E3F2FD', text: '양식' },
  { id: 4, color: '#FFF3E0', text: '일식' },
  { id: 5, color: '#F3E5F5', text: '중식' },
  { id: 6, color: '#E1F5FE', text: '분식' },
  { id: 7, color: '#FAFAFA', text: '카페' },
  { id: 8, color: '#FCE4EC', text: '디저트' },
  { id: 9, color: '#E0F2F1', text: '기타' }
];

// 즐겨찾기 매장 더미 데이터
const FAVORITE_STORES = [
  { storeId: 1, storeName: '버거킹 서울점', storeRating: 4.8, storeDeliveryFee: 0, storeOpenStatus: 'OPEN' },
  { storeId: 2, storeName: '교촌치킨 강남점', storeRating: 4.9, storeDeliveryFee: 3000, storeOpenStatus: 'OPEN' },
  { storeId: 3, storeName: '스타벅스 리저브', storeRating: 4.7, storeDeliveryFee: 2000, storeOpenStatus: 'CLOSE' },
  { storeId: 4, storeName: '써브웨이', storeRating: 4.5, storeDeliveryFee: 1500, storeOpenStatus: 'OPEN' },
  { storeId: 5, storeName: '도미노피자', storeRating: 4.6, storeDeliveryFee: 0, storeOpenStatus: 'OPEN' },
];

// 자주 주문한 매장 더미 데이터
const FREQUENT_STORES = [
  { storeId: 10, storeName: '김밥천국', storeRating: 4.3, storeDeliveryFee: 1000, storeOpenStatus: 'OPEN' },
  { storeId: 11, storeName: '맥도날드', storeRating: 4.6, storeDeliveryFee: 2500, storeOpenStatus: 'OPEN' },
  { storeId: 12, storeName: '공차', storeRating: 4.8, storeDeliveryFee: 0, storeOpenStatus: 'CLOSE' },
  { storeId: 13, storeName: '배스킨라빈스', storeRating: 4.7, storeDeliveryFee: 2000, storeOpenStatus: 'OPEN' },
  { storeId: 14, storeName: '엽기떡볶이', storeRating: 4.5, storeDeliveryFee: 3500, storeOpenStatus: 'OPEN' },
];

// (기존 DashboardLayout용 데이터 - 필요 없다면 삭제 가능)
const quickActions = [
  { label: "주문하기", hint: "가까운 맛집 둘러보기" },
  { label: "즐겨찾기", hint: "자주 찾는 가게 모아보기" },
  { label: "리뷰 작성", hint: "최근 주문 리뷰 남기기" },
];
const summaryCards = [
  { title: "이번 달 주문", value: "8건", meta: "지난달 대비 +2건" },
  { title: "보유 포인트", value: "12,500P", meta: "이번 주 +1,200P" },
];
const activities = [
  { title: "치킨플레이스 주문 완료", time: "오늘 10:24", status: "완료" },
  { title: "카페라떼 주문 접수", time: "어제 19:12", status: "접수" },
];
const notices = [
  { title: "주말 주문 프로모션", detail: "금요일 오후 6시부터 적용됩니다." },
];

// --- 컴포넌트 시작 ---

export default function UserMainPage() {
  const { user, loading } = useRoleGuard("USER", fallbackUser);
  const [randomStores, setRandomStores] = useState([]);
  const dateText = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const allStores = await appUserStoreService.getRandomStores();
        
        const shuffled = [...allStores].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);

        setRandomStores(selected);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  return (
    <div className="user-main-container" style={{ paddingBottom: '80px' }}>
      
      {/* 1. 상단 배너 영역 */}
      <section style={{ marginBottom: '24px' }}>
         <StoreCarousel title="오늘의 추천 맛집 " stores={randomStores} pages={1} />
      </section>

      {/* 2. 카테고리 아이콘 영역 (Swiper) */}
      <section style={{ padding: '0 16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>어떤 음식을 찾으세요?</h3>
        <Swiper
          modules={[Navigation, Pagination]}
          slidesPerView={4.5} // 한 화면에 4.5개 정도 보이게
          spaceBetween={12}
          navigation={false} 
          id="storeCategories"
        >
          {/* banners.map 대신 storeCategory.map으로 수정 */}
          {storeCategory.map((category) => (
            <SwiperSlide key={category.id}>
              <div
                className="storeCategory"
                style={{
                  backgroundColor: category.color,
                  height: '70px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                {category.text}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 3. 자주 주문한 곳 (StoreCarousel 활용) */}
      <div id="Frequent_Visit">
        <StoreCarousel title="자주 주문한 곳" stores={FREQUENT_STORES} pages={2.2} />
      </div>

      {/* 4. 즐겨찾기 (StoreCarousel 활용) */}
      <div id="Favorite_Store">
        <StoreCarousel title="즐겨찾기" stores={FAVORITE_STORES} />
      </div>

      {/* (참고) 기존 대시보드 레이아웃을 사용하고 싶다면 주석 해제하여 하단에 배치 가능 */}
      <div style={{ marginTop: '30px', padding: '0 16px' }}>
        <DashboardLayout
           roleLabel="사용자"
           userName={user.name}
           dateText={dateText}
           quickActions={quickActions}
           summaryCards={summaryCards}
           activities={activities}
           notices={notices}
           isLoading={loading}
         />
      </div>
    </div>
  );
}