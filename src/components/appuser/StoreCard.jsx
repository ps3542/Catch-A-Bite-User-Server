/* src/components/appuser/StoreCard.jsx */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { HiStar } from 'react-icons/hi';

import 'swiper/css';
import 'swiper/css/pagination';
import styles from '../..styles/StoreCard.module.css';

const StoreCard = ({ store }) => {
  const navigate = useNavigate();

  const handleInfoClick = () => {
    navigate(`/user/store/${store.storeId}`);
  };

  const images = Array.isArray(store.storeImageUrl) ? store.storeImageUrl : [];

  const isStoreOpen = (status) => {
    if (!status) return false;
    const s = status.toString().trim().toUpperCase();
    return s === 'OPEN' || s === 'TRUE';
  };

  return (
    <div className={`${styles.cardBase} ${styles.verticalCard}`}>
      
      {/* 1. Image Carousel Area */}
      <div className={styles.verticalSwiperWrapper}>
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true, dynamicBullets: true }}
          loop={true}
          className="card-swiper"
          nested={true}
        >
          {images.length > 0 ? (
            images.map((url, idx) => (
              <SwiperSlide key={idx}>
                <img src={url} alt={`store-img-${idx}`} className={styles.verticalImg} />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className={styles.placeholderVertical}>
                {store.storeName?.charAt(0)}
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* 2. Text Content */}
      <div className={styles.verticalInfo} onClick={handleInfoClick}>
        <div className={styles.verticalHeader}>
           <h3 className={styles.title}>{store.storeName}</h3>
           <div className={styles.ratingWrapper}>
              <HiStar className={styles.starIcon} />
              <span>{store.storeRating?.toFixed(1) || "0.0"}</span>
           </div>
        </div>
        
        <div className={styles.meta}>
           <span className={`${styles.statusBadge} ${isStoreOpen(store.storeOpenStatus) ? styles.statusOpen : styles.statusClosed}`}>
             {isStoreOpen(store.storeOpenStatus) ? '영업중' : '준비중'}
           </span>
           <span className={styles.divider}>·</span>
           <span className="delivery-fee">
             배달팁 {store.storeDeliveryFee > 0 ? `${store.storeDeliveryFee.toLocaleString()}원` : '무료'}
           </span>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;