// Project Name: catchabite
// File Name: src/pages/user/UserStorePage.jsx

/* ======================================================================================
 * [1] 라이브러리 및 외부 모듈 임포트
 * - React Hooks: 상태 관리(useState), 생명주기(useEffect), DOM 참조(useRef)
 * - Router: URL 파라미터(useParams), 페이지 이동(useNavigate)
 * - Icons: UI 아이콘 (별, 시계, 하트, 경고 등)
 * - Swiper: 리뷰 가로 스크롤(Carousel) 기능
 * ======================================================================================
 */
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiStar, HiOutlineClock, HiHeart, HiOutlineHeart, HiExclamationCircle } from "react-icons/hi";

// Swiper 컴포넌트 및 필수 스타일
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

/* ======================================================================================
 * [2] API 서비스 모듈 임포트
 * - StoreService: 가게 상세 정보 조회
 * - FavoriteService: 즐겨찾기 추가/삭제
 * - ReviewService: 가게 리뷰 목록 조회
 * ======================================================================================
 */
import { appUserStoreService } from "../../api/appuser/StoreService";
import { appUserFavoriteService } from "../../api/appuser/FavoriteService";
import { appUserReviewService } from "../../api/appuser/ReviewService"; 

/* ======================================================================================
 * [3] 컴포넌트 및 스타일 임포트
 * ======================================================================================
 */
import "./UserStorePage.css";
import MenuCard from "../../components/appuser/MenuCard";
import Modal from "../../components/common/Modal"; // [추가] 모달 컴포넌트 임포트

/**
 * UserStorePage 컴포넌트
 * 설명: 사용자에게 가게의 상세 정보, 메뉴 목록, 리뷰 등을 보여주는 페이지입니다.
 * 주요 기능:
 * 1. 가게 정보 표시 (영업 상태에 따른 UI 변경 포함)
 * 2. 메뉴 카테고리 탭과 스크롤 연동 (Scroll Spy)
 * 3. 리뷰 목록 가로 스크롤 (Carousel)
 * 4. 즐겨찾기(찜하기) 토글
 */
export default function UserStorePage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  
  /* ======================================================================================
   * [4] 상태 관리 (State Management)
   * - store: 가게 상세 정보 객체 (이름, 이미지, 영업상태 등)
   * - reviews: 가게 리뷰 목록 데이터
   * - loading: 데이터 로딩 상태 플래그
   * - activeTab: 현재 보고 있는 메뉴 카테고리 인덱스 (탭 활성화용)
   * - favoriteId: 찜한 경우 ID 존재, 아니면 null
   * ======================================================================================
   */
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); 
  const [favoriteId, setFavoriteId] = useState(null);

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // DOM 요소 참조 (스크롤 위치 계산용)
  const categoryRefs = useRef([]); 
  const tabsContainerRef = useRef(null); 

    /* ======================================================================================
   * [5] 생명주기 및 이벤트 리스너 (Lifecycle & Events)
   * - 마운트 시 데이터 로드
   * - 스크롤 시 탭 활성화 로직 연결
   * ======================================================================================
   */
  useEffect(() => {
    loadStoreData();
    window.addEventListener("scroll", handleScroll);
    // 언마운트 시 리스너 제거 (메모리 누수 방지)
    return () => window.removeEventListener("scroll", handleScroll);
  }, [storeId]);

  /* ======================================================================================
   * [6] 데이터 로드 함수 (API Calls)
   * - 가게 정보와 리뷰 데이터를 병렬적으로 호출하거나 순차적으로 호출하여 상태를 업데이트합니다.
   * ======================================================================================
   */
  const loadStoreData = async () => {
    try {
      setLoading(true);
      // 1. 가게 상세 정보 조회
      const data = await appUserStoreService.getStoreDetails(storeId);
      setStore(data);
      setFavoriteId(data.favoriteId);
      // 2. 리뷰 데이터 조회 (Carousel용, 최대 10개)
      const reviewData = await appUserReviewService.getStoreReviews(Number(storeId), 0, 10);
      // 응답 데이터 구조 확인 후 상태 업데이트
      if (reviewData && reviewData.data && Array.isArray(reviewData.data.content)) {
          setReviews(reviewData.data.content);
      } else {
          setReviews([]);
      }
    } catch (error) {
      console.error("Store/Review Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================================================
   * [7] 스크롤 및 탭 핸들러 (Scroll Spy Logic)
   * - 현재 스크롤 위치를 감지하여 해당하는 메뉴 카테고리 탭을 활성화합니다.
   * ======================================================================================
   */
  const handleScroll = () => {
    if (!categoryRefs.current.length) return;
    // 헤더 높이 등을 고려한 오프셋 보정 (180px)
    const scrollPosition = window.scrollY + 180; 
    categoryRefs.current.forEach((ref, index) => {
      // 해당 섹션의 범위 내에 스크롤이 위치하는지 확인
      if (ref && ref.offsetTop <= scrollPosition && (ref.offsetTop + ref.offsetHeight) > scrollPosition) {
        setActiveTab(index);
      }
    });
  };

  // 탭 클릭 시 해당 카테고리 위치로 스크롤 이동
  const scrollToCategory = (index) => {
    setActiveTab(index);
    const ref = categoryRefs.current[index];
    if (ref) {
      // 상단 고정 헤더 높이(120px)를 고려하여 위치 조정
      const y = ref.getBoundingClientRect().top + window.scrollY - 120; 
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  /* ======================================================================================
   * [8] 즐겨찾기(찜하기) 토글 로직
   * - favoriteId 유무에 따라 추가/삭제 API를 호출하고 상태를 갱신합니다.
   * ======================================================================================
   */
  const toggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      if (favoriteId) {
        // 이미 찜한 상태 -> 삭제
        await appUserFavoriteService.removeFavorite(favoriteId);
        setFavoriteId(null);
      } else {
        // 찜하지 않은 상태 -> 추가
        const result = await appUserFavoriteService.addFavorite(storeId);
        if (result && result.favoriteId) {
          setFavoriteId(result.favoriteId);
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  /* ======================================================================================
   * [9] 모달 제어 핸들러 (Modal Handlers)
   * - openReviewModal: 리뷰 카드를 클릭했을 때 호출되며, 해당 리뷰 데이터를 상태에 저장하고 모달을 엽니다.
   * - closeReviewModal: 모달을 닫고 선택된 리뷰 상태를 초기화합니다.
   * ======================================================================================
   */
  const openReviewModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  /* ======================================================================================
   * [10] Swiper 반응형 설정
   * - 화면 크기에 따라 리뷰 카드가 보이는 개수를 조정합니다.
   * ======================================================================================
   */
  const reviewSwiperBreakpoints = {
    320: { slidesPerView: 1.2, spaceBetween: 12 },
    480: { slidesPerView: 1.5, spaceBetween: 16 },
    768: { slidesPerView: 2.2, spaceBetween: 16 },
    1024: { slidesPerView: 3.2, spaceBetween: 16 },
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!store) return <div className="error-screen">가게 정보를 찾을 수 없습니다.</div>;

  /* ======================================================================================
   * [11] 영업 종료(CLOSE) 상태 체크 로직
   * - storeOpenStatus가 'CLOSE'인 경우 페이지를 회색조로 만들고 클릭을 차단합니다.
   * ======================================================================================
   */
  const isClosed = store.storeOpenStatus && store.storeOpenStatus.toUpperCase() === 'CLOSE';

  // 메뉴 클릭 핸들러 (영업 종료 시 이동 불가)
  const handleMenuClick = (menuId) => {
    if (isClosed) return; // 클릭 무시
    navigate(`/user/menu/${menuId}`);
  };

  return (
    // 영업 종료 시 'store-closed-mode' 클래스를 추가하여 CSS로 비활성화 스타일 적용
    <div className={`store-page ${isClosed ? "store-closed-mode" : ""}`}>
      
      {/* ======================================================================================
       * [UI Section 1] 헤더 영역 (이미지 + 오버레이)
       * ======================================================================================
       */}
      <header className="store-header">
        {/* 상단 그라데이션 및 즐겨찾기 버튼 */}
        <div className="header-overlay">
            <div className="header-actions">
                <button className="icon-btn" onClick={toggleFavorite} disabled={isClosed}>
                    {favoriteId ? (
                        <HiHeart size={24} style={{ color: '#ef4444' }} /> 
                    ) : (
                        <HiOutlineHeart size={24} />
                    )}
                </button>
            </div>
        </div>
        {/* [중요] 영업 종료 시 표시되는 '준비중' 오버레이 */}
        {isClosed && (
            <div className="closed-overlay-layer">
                <div className="closed-badge">
                    <HiExclamationCircle className="closed-badge-icon"/>
                    <span>지금은 준비중입니다</span>
                </div>
            </div>
        )}
        {/* 가게 대표 이미지 (없으면 플레이스홀더) */}
        {store.storeImageUrl ? (
          <img src={store.storeImageUrl} alt={store.storeName} className="store-img" />
        ) : (
          <div className="store-img-placeholder">Catch-A-Bite</div>
        )}
      </header>

      {/* ======================================================================================
       * [UI Section 2] 가게 상세 정보 영역
       * - 가게 이름, 평점, 배달 시간, 소개글, 통계 박스
       * ======================================================================================
       */}
      <section className="store-info-section">
        <h1 className="store-name">
            {store.storeName}
            {isClosed && <span className="closed-text-label"> (준비중)</span>}
        </h1>
        
        <div className="store-meta">
          <div className="rating">
            <HiStar className="star-icon" />
            <span className="score">{store.rating ? Number(store.rating).toFixed(1) : "0.0"}</span>
            <span className="count">({store.reviewCount || 0})</span>
          </div>
          <div className="delivery-time">
             <HiOutlineClock className="clock-icon" /> 
             {store.estimatedDeliveryTime || "30-45분"}
          </div>
        </div>

        <p className="store-intro">{store.storeIntro}</p>
        
        {/* 원산지 정보 (데이터 있을 때만 표시) */}
        {store.storeOriginLabel && (
          <div className="store-origin-info" style={{ marginTop: '12px', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <p><strong style={{ marginRight: '6px' }}>[원산지 정보]</strong></p>
            <span>{store.storeOriginLabel}</span>
          </div>
        )}

        {/* 통계 박스 (배달비, 최소주문) */}
        <div className="store-stats">
            <div className="stat-item">
                <span className="label">배달비</span>
                <span className="value">{store.deliveryFee?.toLocaleString()}원</span>
            </div>
            <div className="divider"></div>
            <div className="stat-item">
                <span className="label">최소주문</span>
                <span className="value">{store.minOrderPrice?.toLocaleString()}원</span>
            </div>
        </div>

        {/* ======================================================================================
         * [UI Section 2-1] 리뷰 카러셀 (Review Carousel)
         * - 리뷰 데이터가 있을 경우 Swiper를 이용해 가로 스크롤로 표시
         * ======================================================================================
         */}
        {reviews.length > 0 && (
          <div className="store-reviews-section">
            <div className="section-header-row">
                <h3 className="section-header">최근 리뷰</h3>
                <span className="review-total-count">전체 {store.reviewCount}개</span>
            </div>
            
            <Swiper
              modules={[FreeMode, Pagination]}
              breakpoints={reviewSwiperBreakpoints}
              freeMode={true}
              pagination={{ clickable: true, dynamicBullets: true }}
              className="review-swiper"
            >
              {reviews.map((review) => (
                <SwiperSlide key={review.reviewId} className="review-slide">
                  {/* onClick 이벤트 추가: 리뷰 카드 클릭 시 모달 오픈 */}
                  <div className="review-card" onClick={() => openReviewModal(review)} style={{ cursor: 'pointer' }}>
                    <div className="review-card-header">
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= review.reviewRating ? "star-filled" : "star-empty"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="review-score">{review.reviewRating}</span>
                    </div>

                    <div className="review-content">
                      {review.reviewContent}
                    </div>

                    {/* 답글 존재 여부 표시 (선택 사항) */}
                    {review.ownerReplyContent && (
                        <div className="review-reply-indicator" style={{ fontSize: '0.8rem', color: '#9900ffc9', marginTop: '8px' }}>
                            ↳ 사장님 답글
                        </div>
                    )}

                    <div className="review-footer">
                      <span className="review-nickname">
                        {review.authorNickname || "익명"}
                      </span>
                      <span className="review-date">
                        {new Date(review.reviewCreatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </section>

      {/* ======================================================================================
       * [UI Section 3] 메뉴 카테고리 탭 (Sticky Tabs)
       * - 스크롤 시 상단에 고정되는 탭 메뉴
       * ======================================================================================
       */}
      <div className="sticky-tabs-container" ref={tabsContainerRef}>
        {store.menuCategories?.map((cat, index) => (
          <button 
            key={cat.menuCategoryId}
            className={`tab-btn ${activeTab === index ? "active" : ""}`}
            onClick={() => !isClosed && scrollToCategory(index)} 
            disabled={isClosed}
          >
            {cat.menuCategoryName}
          </button>
        ))}
      </div>

      {/* ======================================================================================
       * [UI Section 4] 메뉴 리스트 영역 (Menu List)
       * - 카테고리별로 메뉴 카드를 나열
       * ======================================================================================
       */}
      <div className="menu-sections">
        {store.menuCategories?.map((cat, index) => (
          <div 
            key={cat.menuCategoryId} 
            className="menu-category"
            // 스크롤 감지를 위한 ref 할당
            ref={(el) => (categoryRefs.current[index] = el)}
          >
            <h3 className="category-title">{cat.menuCategoryName}</h3>
            
            <div className="menu-list">
                {cat.menus?.map((menu) => (
                  <MenuCard 
                    key={menu.menuId} 
                    menu={menu}
                    // 영업 종료 시 클릭 방지 핸들러 연결
                    onClick={() => handleMenuClick(menu.menuId)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* [추가] 리뷰 상세 모달 */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeReviewModal} 
        title="리뷰 상세"
      >
        {selectedReview && (
          <div className="review-modal-content">
            {/* 리뷰 작성자 정보 */}
            <div className="modal-review-header" style={{ marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedReview.authorNickname || "익명"}</span>
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>{new Date(selectedReview.reviewCreatedAt).toLocaleDateString()}</span>
                </div>
                <div className="review-stars" style={{ color: '#FFD700', fontSize: '1.2rem', marginTop: '5px' }}>
                    {'★'.repeat(Math.round(selectedReview.reviewRating))}
                    <span style={{ color: '#ccc' }}>{'★'.repeat(5 - Math.round(selectedReview.reviewRating))}</span>
                    <span style={{ color: '#333', fontSize: '1rem', marginLeft: '5px' }}>{selectedReview.reviewRating}</span>
                </div>
            </div>

            {/* 리뷰 본문 */}
            <div className="modal-review-body" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '20px' }}>
                {selectedReview.reviewContent}
            </div>

            {/* 사장님 답글 영역 */}
            {selectedReview.ownerReplyContent ? (
                <div className="owner-reply-box" style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#333' }}>사장님 답글</span>
                        {selectedReview.ownerReplyCreatedAt && (
                             <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: 'auto' }}>
                                {new Date(selectedReview.ownerReplyCreatedAt).toLocaleDateString()}
                             </span>
                        )}
                    </div>
                    <p style={{ margin: 0, color: '#555', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                        {selectedReview.ownerReplyContent}
                    </p>
                </div>
            ) : (
                // 답글이 없을 경우 (선택 사항: 아무것도 안 보이거나 안내 메시지)
                <div style={{ padding: '10px', textAlign: 'center', color: '#999', fontSize: '0.9rem', backgroundColor: '#fdfdfd', borderRadius: '5px' }}>
                    아직 답글이 달리지 않았습니다.
                </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}