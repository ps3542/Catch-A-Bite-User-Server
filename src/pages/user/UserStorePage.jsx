import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiStar, HiOutlineClock, HiHeart, HiOutlineHeart, HiExclamationCircle } from "react-icons/hi";
import KakaoAddressMap from '../../components/KakaoAddressMap';

// Swiper 컴포넌트 및 필수 스타일
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

import { appUserStoreService } from "../../api/appuser/StoreService";
import { appUserFavoriteService } from "../../api/appuser/FavoriteService";
import { appUserReviewService } from "../../api/appuser/ReviewService"; 

import "./UserStorePage.css";
import MenuCard from "../../components/appuser/MenuCard";
import Modal from "../../components/common/Modal"; 

export default function UserStorePage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); 
  const [favoriteId, setFavoriteId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const categoryRefs = useRef([]); 
  const tabsContainerRef = useRef(null); 

  useEffect(() => {
    loadStoreData();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const data = await appUserStoreService.getStoreDetails(storeId);
      setStore(data);
      setFavoriteId(data.favoriteId);
      
      const reviewData = await appUserReviewService.getStoreReviews(Number(storeId), 0, 10);
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

  const handleScroll = () => {
    if (!categoryRefs.current.length) return;
    const scrollPosition = window.scrollY + 180; 
    categoryRefs.current.forEach((ref, index) => {
      if (ref && ref.offsetTop <= scrollPosition && (ref.offsetTop + ref.offsetHeight) > scrollPosition) {
        setActiveTab(index);
      }
    });
  };

  const scrollToCategory = (index) => {
    setActiveTab(index);
    const ref = categoryRefs.current[index];
    if (ref) {
      const y = ref.getBoundingClientRect().top + window.scrollY - 120; 
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      if (favoriteId) {
        await appUserFavoriteService.removeFavorite(favoriteId);
        setFavoriteId(null);
      } else {
        const result = await appUserFavoriteService.addFavorite(storeId);
        if (result && result.favoriteId) {
          setFavoriteId(result.favoriteId);
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const openReviewModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  const reviewSwiperBreakpoints = {
    320: { slidesPerView: 1.2, spaceBetween: 12 },
    480: { slidesPerView: 1.5, spaceBetween: 16 },
    768: { slidesPerView: 2.2, spaceBetween: 16 },
    1024: { slidesPerView: 3.2, spaceBetween: 16 },
  };

  if (loading) return <div className="page-loading-state"><div className="loading-spinner"></div></div>;
  if (!store) return <div className="page-error-state">가게 정보를 찾을 수 없습니다.</div>;

  const isClosed = store.storeOpenStatus && store.storeOpenStatus.toUpperCase() === 'CLOSE';

  const handleMenuClick = (menuId) => {
    if (isClosed) return; 
    navigate(`/user/menu/${menuId}`);
  };

  return (
    <div className={`user-store-page-wrapper ${isClosed ? "mode-store-closed" : ""}`}>
      
      {/* ----------------------------------------------------------------------
          [SECTION 1] 헤더 영역 (Hero Image)
          클래스명 변경: store-header -> store-hero-header
      ---------------------------------------------------------------------- */}
      <header className="store-hero-header">
        <div className="hero-gradient-overlay">
            <div className="hero-action-buttons">
                <button className="circle-icon-btn" onClick={toggleFavorite} disabled={isClosed}>
                    {favoriteId ? (
                        <HiHeart size={24} style={{ color: '#ef4444' }} /> 
                    ) : (
                        <HiOutlineHeart size={24} />
                    )}
                </button>
            </div>
        </div>
        
        {/* 영업 종료 오버레이 */}
        {isClosed && (
            <div className="closed-overlay-backdrop">
                <div className="closed-status-badge">
                    <HiExclamationCircle className="badge-icon"/>
                    <span>지금은 준비중입니다</span>
                </div>
            </div>
        )}

        {store.storeImageUrl ? (
          <img src={store.storeImageUrl} alt={store.storeName} className="hero-bg-image" />
        ) : (
          <div className="hero-image-placeholder">Catch-A-Bite</div>
        )}
      </header>

      {/* ----------------------------------------------------------------------
          [SECTION 2] 가게 상세 정보 카드 (Store Info Card)
          클래스명 변경: store-info-section -> store-details-card
      ---------------------------------------------------------------------- */}
      <section className="store-details-card">
        <h1 className="details-store-title">
            {store.storeName}
            {isClosed && <span className="text-closed-label"> (준비중)</span>}
        </h1>
        
        <div className="details-meta-row">
          <div className="meta-rating-box">
            <HiStar className="icon-star" />
            <span className="text-score">{store.rating ? Number(store.rating).toFixed(1) : "0.0"}</span>
            <span className="text-count">({store.reviewCount || 0})</span>
          </div>
          <div className="meta-delivery-time">
             <HiOutlineClock className="icon-clock" /> 
             {store.estimatedDeliveryTime || "30-45분"}
          </div>
        </div>

        <p className="details-intro-text">{store.storeIntro}</p>
        
        {store.storeOriginLabel && (
          <div className="details-origin-info">
            <p><strong>[원산지 정보]</strong></p>
            <span>{store.storeOriginLabel}</span>
          </div>
        )}

        {/* 배달비/최소주문 통계 박스 */}
        <div className="details-order-stats-box">
            <div className="stats-item">
                <span className="stats-label">배달비</span>
                <span className="stats-value">{store.deliveryFee?.toLocaleString()}원</span>
            </div>
            <div className="stats-divider"></div>
            <div className="stats-item">
                <span className="stats-label">최소주문</span>
                <span className="stats-value">{store.minOrderPrice?.toLocaleString()}원</span>
            </div>
        </div>

        {/* ----------------------------------------------------------------------
            [SECTION 2.1] 주소 및 지도 영역 (Address & Map)
            클래스명 변경: store-stats(중복) -> details-location-section
        ---------------------------------------------------------------------- */}
        <div className="details-location-section">
          <div className="location-address-text">{store.storeAddress}</div>
          <div className="location-map-frame" onClick={() => setIsMapModalOpen(true)}>
            <KakaoAddressMap address={store.storeAddress} />
          </div>
        </div>

        {/* ----------------------------------------------------------------------
            [SECTION 2.2] 리뷰 카러셀 (Review Carousel)
            클래스명 변경: store-reviews-section -> details-reviews-carousel
        ---------------------------------------------------------------------- */}
        {reviews.length > 0 && (
          <div className="details-reviews-carousel">
            <div className="carousel-header">
                <h3 className="header-title">최근 리뷰</h3>
                <span className="header-count">전체 {store.reviewCount}개</span>
            </div>
            
            <Swiper
              modules={[FreeMode, Pagination]}
              breakpoints={reviewSwiperBreakpoints}
              freeMode={true}
              pagination={{ clickable: true, dynamicBullets: true }}
              className="custom-swiper-container"
              touchStartPreventDefault={false}
            >
              {reviews.map((review) => (
                <SwiperSlide key={review.reviewId} className="custom-swiper-slide">
                  <div className="carousel-review-card" onClick={() => openReviewModal(review)}>
                    <div className="card-header">
                      <div className="stars-wrapper">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= review.reviewRating ? "star-fill" : "star-empty"}>★</span>
                        ))}
                      </div>
                      <span className="score-number">{review.reviewRating}</span>
                    </div>

                    <div className="card-body-text">
                      {review.reviewContent}
                    </div>

                    <div className="card-footer">
                      <span className="nickname">{review.authorNickname || "익명"}</span>
                      <span className="date">{new Date(review.reviewCreatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------------
          [SECTION 3] 메뉴 카테고리 탭 (Sticky Tabs)
          클래스명 변경: sticky-tabs-container -> menu-category-sticky-nav
      ---------------------------------------------------------------------- */}
      <div className="menu-category-sticky-nav" ref={tabsContainerRef}>
        {store.menuCategories?.map((cat, index) => (
          <button 
            key={cat.menuCategoryId}
            className={`nav-tab-btn ${activeTab === index ? "active" : ""}`}
            onClick={() => !isClosed && scrollToCategory(index)} 
            disabled={isClosed}
          >
            {cat.menuCategoryName}
          </button>
        ))}
      </div>

      {/* ----------------------------------------------------------------------
          [SECTION 4] 메뉴 리스트 영역 (Menu List)
          클래스명 변경: menu-sections -> menu-list-container
      ---------------------------------------------------------------------- */}
      <div className="menu-list-container">
        {store.menuCategories?.map((cat, index) => (
          <div 
            key={cat.menuCategoryId} 
            className="menu-category-group"
            ref={(el) => (categoryRefs.current[index] = el)}
          >
            <h3 className="group-title">{cat.menuCategoryName}</h3>
            
            <div className="group-items-list">
                {cat.menus?.map((menu) => (
                  <MenuCard 
                    key={menu.menuId} 
                    menu={menu}
                    onClick={() => handleMenuClick(menu.menuId)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* 리뷰 상세 모달 */}
      <Modal isOpen={isModalOpen} onClose={closeReviewModal} title="리뷰 상세">
        {selectedReview && (
          <div className="review-modal-content">
            <div className="modal-header-row" style={{ marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedReview.authorNickname || "익명"}</span>
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>{new Date(selectedReview.reviewCreatedAt).toLocaleDateString()}</span>
                </div>
                <div className="modal-stars" style={{ color: '#FFD700', fontSize: '1.2rem', marginTop: '5px' }}>
                    {'★'.repeat(Math.round(selectedReview.reviewRating))}
                    <span style={{ color: '#ccc' }}>{'★'.repeat(5 - Math.round(selectedReview.reviewRating))}</span>
                    <span style={{ color: '#333', fontSize: '1rem', marginLeft: '5px' }}>{selectedReview.reviewRating}</span>
                </div>
            </div>

            <div className="modal-body-text" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '20px' }}>
                {selectedReview.reviewContent}
            </div>

            {selectedReview.ownerReplyContent ? (
                <div className="modal-owner-reply" style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
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
                <div style={{ padding: '10px', textAlign: 'center', color: '#999', fontSize: '0.9rem', backgroundColor: '#fdfdfd', borderRadius: '5px' }}>
                    아직 답글이 달리지 않았습니다.
                </div>
            )}
          </div>
        )}
      </Modal>

      {/* 지도 확대 모달 (Map Modal)
         - 이곳의 지도는 .location-map-frame 으로 감싸지 않았기 때문에
         - 투명 막이 없어 드래그와 줌이 가능합니다.
      */}
      <Modal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} title="위치 상세">
        <div className="modal-map-container">
          <KakaoAddressMap address={store.storeAddress} />
        </div>
      </Modal>
    </div>
  );
}