/* src/components/appuser/StoreCardLean.jsx */
import React from 'react';
import { HiStar, HiHeart, HiOutlineHeart } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/StoreCard.module.css';

const StoreCardLean = ({ store, onClick, onRemove }) => {
  const navigate = useNavigate();

  // 이미지 추출 헬퍼
  const getStoreImage = (storeData) => {
    if (!storeData) return null;
    if (Array.isArray(storeData.storeImageUrl) && storeData.storeImageUrl.length > 0) return storeData.storeImageUrl[0];
    if (Array.isArray(storeData.storeImageUrls) && storeData.storeImageUrls.length > 0) return storeData.storeImageUrls[0];
    if (typeof storeData.storeImageUrl === 'string') return storeData.storeImageUrl;
    return null;
  };

  const imageUrl = getStoreImage(store);
  
  // 즐겨찾기 여부 확인
  const isFavorite = !!(store.favoriteId || store.isFavorite);

  // 카드 클릭 핸들러
  const handleCardClick = () => {
    if (onClick) {
      onClick(store.storeId);
    } else {
      navigate(`/user/store/${store.storeId}`);
    }
  };

  // 하트 클릭 핸들러
  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (isFavorite && onRemove) {
      onRemove(store.favoriteId);
    } else {
      // 차후 검색 페이지에서 찜하기 토글 기능 구현 시 사용
      console.log("Toggle favorite logic needed for:", store.storeId);
    }
  };

  return (
    // [CSS] cardBase + horizontalCard 조합
    <div className={`${styles.cardBase} ${styles.horizontalCard}`} onClick={handleCardClick}>
      
      {/* 1. 이미지 영역 */}
      <div className={styles.horizontalImageWrapper}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={store.storeName} 
              className={styles.horizontalImg}
            />
          ) : (
            <div className={styles.placeholderHorizontal}>
               {store.storeName?.charAt(0)}
            </div>
          )}
      </div>

      {/* 2. 정보 영역 */}
      <div className={styles.horizontalInfo}>
        <h3 className={styles.title}>
          {store.storeName}
        </h3>
        
        <div className={styles.meta}>
          <div className={styles.ratingWrapper}>
             <HiStar className={styles.starIcon} />
             <span>{store.storeRating?.toFixed(1) || store.rating?.toFixed(1) || "0.0"}</span>
          </div>
          
          {store.storeDeliveryFee !== undefined && (
            <>
               <span className={styles.divider}>|</span>
               <span>
                 배달팁 {store.storeDeliveryFee > 0 ? `${store.storeDeliveryFee.toLocaleString()}원` : "무료"}
               </span>
            </>
          )}
        </div>
      </div>
      
      {/* 3. 액션 영역 (하트 버튼) */}
      <div className={styles.actionWrapper}>
          <button 
            onClick={handleHeartClick}
            className={styles.heartBtn}
            aria-label="즐겨찾기"
          >
            {isFavorite ? (
              <HiHeart size={24} color="#ef4444" />
            ) : (
              <HiOutlineHeart size={24} color="#9ca3af" />
            )}
          </button>
      </div>
    </div>
  );
};

export default StoreCardLean;