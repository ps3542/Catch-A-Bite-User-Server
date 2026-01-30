// Project Name: catchabite
// File Name: src/components/appuser/StoreCarousel.jsx

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, FreeMode } from 'swiper/modules';
import { HiStar } from 'react-icons/hi';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './StoreCarousel.css';

/**
 * StoreCarousel Component
 * 설명: 상점 목록을 가로 스크롤(Swiper) 형태로 보여주는 컴포넌트
 * 주요 기능:
 * 1. 상점 목록 랜덤 셔플 및 개수 제한
 * 2. 반응형 슬라이드 개수 조정 (Breakpoints)
 * 3. 평점 및 영업 상태 표시
 */
const StoreCarousel = ({ title, stores, pages = 4.2, limit = 10 }) => {
  const navigate = useNavigate(); 

  /* * ======================================================================================
   * [Logic] 상점 목록 가공 (셔플 및 제한)
   * - 전달받은 stores 배열을 랜덤하게 섞고, limit 개수만큼만 잘라서 표시합니다.
   * - useMemo를 사용하여 stores나 limit이 변경될 때만 재연산합니다.
   * ======================================================================================
   */
  const displayStores = useMemo(() => {
    if (!stores || stores.length === 0) return [];

    let processedData = [...stores];
    // Random Shuffle
    processedData.sort(() => 0.5 - Math.random());
    
    // Slice limit
    // console.log("StoreCarouselComponent - CarouselData");
    // console.log(processedData);
    return processedData.slice(0, limit);
  }, [stores, limit]);

  /* * ======================================================================================
   * [Config] Swiper 반응형 설정 (Breakpoints)
   * - 화면 크기에 따라 보여지는 슬라이드 개수(slidesPerView)와 간격(spaceBetween)을 조정합니다.
   * ======================================================================================
   */
  const dynamicBreakpoints = {
    320: { 
      slidesPerView: Math.min(1.2, pages), // 모바일: 옆 카드가 살짝 보이도록 설정
      spaceBetween: 10 
    },
    480: { 
      slidesPerView: Math.min(2.2, pages), 
      spaceBetween: 12 
    },
    768: { 
      slidesPerView: Math.min(3.2, pages), 
      spaceBetween: 16 
    },
    1024: { 
      slidesPerView: pages, 
      spaceBetween: 16 
    },
  };

  // 카드 클릭 시 상세 페이지 이동 핸들러
  const handleCardClick = (storeId) => {
    navigate(`/user/store/${storeId}`);
  };

  // 표시할 상점이 없으면 렌더링하지 않음
  if (displayStores.length === 0) return null;

  return (
    <section className="store-section">
      <h2 className="section-title">{title}</h2>
      
      <Swiper
        modules={[Navigation, Pagination, FreeMode]}
        spaceBetween={16}
        loop={true}
        slidesPerView={pages}
        navigation
        pagination={{ clickable: true }}
        className="store-swiper"
        breakpoints={dynamicBreakpoints}
      >
        {displayStores.map((store) => (
          <SwiperSlide key={store.storeId || store.id}>
            <div 
              className="store-card"
              onClick={() => handleCardClick(store.storeId || store.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* * ======================================================================================
               * [UI] 상점 이미지 영역
               * - 이미지가 있으면 출력, 없으면 상점명 첫 글자를 딴 플레이스홀더 표시
               * ======================================================================================
               */}
              <div 
                className="store-image-placeholder" 
                style={
                  !store.storeImageUrl 
                    ? { backgroundColor: getRandomColor(store.storeId) } 
                    : {}
                }
              >
                {store.storeImageUrl ? (
                  <img 
                    src={store.storeImageUrl} 
                    alt={store.storeName} 
                    className="store-img-real"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>{store.storeName?.charAt(0)}</span>
                )}
              </div>
              
              {/* * ======================================================================================
               * [UI] 상점 정보 오버레이 (이름, 평점, 배달팁)
               * ======================================================================================
               */}
              <div className="store-info">
                <h3 className="store-name">{store.storeName}</h3>
                
                <div className="store-meta">
                  <HiStar className="star-icon" />
                  
                  {/* * ======================================================================================
                   * [수정] 평점 데이터 안전 처리
                   * - storeRating이 String으로 들어올 경우 toFixed() 호출 시 에러 발생 가능
                   * - Number()로 변환하여 안전하게 소수점 포맷팅 적용
                   * ======================================================================================
                   */}
                  <span className="rating">
                    {(() => {
                        const ratingVal = Number(store.storeRating);
                        // 값이 유효한 숫자이면 소수점 1자리, 아니면 0.0 출력
                        return (!isNaN(ratingVal) && ratingVal > 0) 
                            ? ratingVal.toFixed(1) 
                            : '0.0';
                    })()}
                  </span> 
                  
                  <span className="dot">·</span>
                  
                  {/* 영업 상태 (OPEN / CLOSE) */}
                  <span className={`delivery-time ${isStoreOpen(store.storeOpenStatus) ? 'status-open' : 'status-close'}`}>
                    {isStoreOpen(store.storeOpenStatus) ? '영업중' : '준비중'}
                  </span>
                </div>
                
                <div className="delivery-fee">
                  배달팁 {store.storeDeliveryFee > 0 
                    ? `${store.storeDeliveryFee.toLocaleString()}원` 
                    : '무료'}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

/* * ======================================================================================
 * Helper Functions
 * ======================================================================================
 */

// 상점 ID 기반으로 랜덤 파스텔톤 배경색 반환
const getRandomColor = (id) => {
  const colors = ['#FFEBEE', '#E8F5E9', '#E3F2FD', '#FFF3E0', '#F3E5F5', '#E0F2F1'];
  return colors[(id || 0) % colors.length];
};

// 영업 상태 체크 (String 'OPEN' or Boolean true 허용)
const isStoreOpen = (status) => {
  if (!status) return false;
  const s = status.toString().trim().toUpperCase();
  return s === 'OPEN' || s === 'TRUE';
};

export default StoreCarousel;