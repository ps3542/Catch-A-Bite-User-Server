import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // [ADDED] For navigation
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, FreeMode } from 'swiper/modules'; // Added FreeMode just in case
import { HiStar } from 'react-icons/hi';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './StoreCarousel.css';

/**
 * StoreCarousel Component
 * 
 */
const StoreCarousel = ({ title, stores, pages = 4.2, limit = 10 }) => {
  const navigate = useNavigate(); 

  // =========================================================================
  // [LOGIC] 10개 한계 및 랜덤화
  // =========================================================================
  const displayStores = useMemo(() => {
    if (!stores || stores.length === 0) return [];

    let processedData = [...stores];
    // Random Shuffle
    processedData.sort(() => 0.5 - Math.random());
    
    // Slice limit
    return processedData.slice(0, limit);
  }, [stores, limit]);

  // =========================================================================
  // [LOGIC] 작성하지 않으면 자동으로 보이는 카드 수 변경
  // =========================================================================
  const dynamicBreakpoints = {
    320: { 
      slidesPerView: Math.min(1.2, pages), // Slightly >1 to show scroll hint
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

  // Helper to handle click
  const handleCardClick = (storeId) => {
    navigate(`/user/store/${storeId}`);
  };

  if (displayStores.length === 0) return null;

  return (
    <section className="store-section">
      <h2 className="section-title">{title}</h2>
      
      <Swiper
        modules={[Navigation, Pagination, FreeMode]}
        spaceBetween={16}
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
              onClick={() => handleCardClick(store.storeId || store.id)} // [ADDED] Click Event
              style={{ cursor: 'pointer' }}
            >
              {/* Image Logic: Real Image OR Placeholder */}
              <div 
                className="store-image-placeholder" 
                style={
                  !store.storeImageUrl 
                    ? { backgroundColor: getRandomColor(store.storeId) } 
                    : {}
                }
              >
                {store.storeImageUrl ? (
                  // [ADDED] Real Image
                  <img 
                    src={store.storeImageUrl} 
                    alt={store.storeName} 
                    className="store-img-real"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  // [ADDED] Fallback Letter
                  <span>{store.storeName?.charAt(0)}</span>
                )}
              </div>
              
              {/* Info Overlay */}
              <div className="store-info">
                <h3 className="store-name">{store.storeName}</h3>
                
                <div className="store-meta">
                  <HiStar className="star-icon" />
                  <span className="rating">
                    {store.storeRating ? store.storeRating.toFixed(1) : '0.0'}
                  </span> 
                  <span className="dot">·</span>
                  
                  {/* Status */}
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

// =========================================================================
// Helper Functions
// =========================================================================

const getRandomColor = (id) => {
  const colors = ['#FFEBEE', '#E8F5E9', '#E3F2FD', '#FFF3E0', '#F3E5F5', '#E0F2F1'];
  return colors[(id || 0) % colors.length];
};

const isStoreOpen = (status) => {
  if (!status) return false;
  const s = status.toString().trim().toUpperCase();
  return s === 'OPEN' || s === 'TRUE';
};

export default StoreCarousel;