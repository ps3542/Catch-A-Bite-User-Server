import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineHeart } from "react-icons/hi";
import { appUserFavoriteService } from "../../api/appuser/FavoriteService"; 
import { appUserStoreService } from "../../api/appuser/StoreService"; 
import "./UserFavoriteStores.css";
import StoreCardLean from "../../components/appuser/StoreCardLean.jsx";

export default function UserFavoriteStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // 1. Get List of Favorites (IDs)
      const favData = await appUserFavoriteService.getMyFavorites();
      
      if (favData && favData.length > 0) {
        // 2. Fetch Details for each to get images/status
        const detailsPromises = favData.map(async (fav) => {
          try {
            const detail = await appUserStoreService.getStoreDetails(fav.storeId);
            // Merge the favoriteId (from the list) with the details (from the store API)
            return { ...detail, favoriteId: fav.favoriteId };
          } catch (e) {
            console.error(`Failed to load store ${fav.storeId}`, e);
            return null; 
          }
        });

        const results = await Promise.all(detailsPromises);
        setStores(results.filter(s => s !== null));
      } else {
        setStores([]);
      }

    } catch (err) {
      console.error(err);
      setError("즐겨찾기 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStoreClick = (storeId) => {
    navigate(`/user/store/${storeId}`);
  };

  const handleRemoveFavorite = async (e, favoriteId) => {

    try {
      await appUserFavoriteService.removeFavorite(favoriteId);
      setStores(prev => prev.filter(s => s.favoriteId !== favoriteId));
    } catch (err) {
      alert("즐겨찾기 해제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="fav-loading-container">
        <div className="fav-spinner"></div>
      </div>
    );
  }

  return (
    <div className="fav-page-container">
      
      {/* Top Bar */}
      <div className="fav-content">
        {error && (
           <div className="fav-error-message">
             {error}
           </div>
        )}

        {!error && stores.length === 0 ? (
          <div className="fav-empty-state">
            <div className="fav-empty-icon-wrapper">
              <HiOutlineHeart size={48} className="fav-empty-icon" />
            </div>
            
            <h2 className="fav-empty-title">
              아직 찜한 가게가 없어요
            </h2>
            <p className="fav-empty-desc">
              자주 가는 맛집을 찜해보세요.<br/>
              주문이 훨씬 편리해집니다!
            </p>
            
            <button 
                onClick={() => navigate('/user/main')}
                className="fav-browse-btn"
            >
                맛집 찾아보기
            </button>
          </div>
        ) : (
          <>
            <div className="fav-count-header">
                <span className="fav-count-label">총 </span>
                <span className="fav-count-number">{stores.length}</span>
                <span className="fav-count-label">개</span>
            </div>
            
            <div className="fav-list">
            {stores.map((store) => (
                <StoreCardLean 
                  key={store.favoriteId}
                  store={store}
                  onClick={handleStoreClick}
                  onRemove={(e) => handleRemoveFavorite(e, store.favoriteId)} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}