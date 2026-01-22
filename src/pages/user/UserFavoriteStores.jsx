/* src/pages/user/UserFavoriteStores.jsx */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiStar, HiHeart, HiArrowLeft, HiOutlineHeart } from "react-icons/hi";
import { MdStorefront } from "react-icons/md";
import { appUserFavoriteService } from "../../api/appuser/FavoriteService"; // Use new service
import "./UserFavoriteStores.css";

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
      const data = await appUserFavoriteService.getMyFavorites();
      setStores(data);
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

  // New handler to remove favorite
  const handleRemoveFavorite = async (e, favoriteId) => {
    e.stopPropagation(); // Prevent navigating to store
    if (!window.confirm("즐겨찾기를 해제하시겠습니까?")) return;

    try {
      await appUserFavoriteService.removeFavorite(favoriteId);
      // Remove from UI immediately
      setStores(prev => prev.filter(s => s.favoriteId !== favoriteId));
    } catch (err) {
      alert("즐겨찾기 해제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 bg-white">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-800 hover:bg-gray-100 p-1 rounded-full transition-colors">
          <HiArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">즐겨찾기</h1>
      </div>

      <div className="px-4 py-4 flex-1">
        {error && (
           <div className="p-4 bg-red-50 text-red-500 rounded-lg text-sm text-center mb-4">
             {error}
           </div>
        )}

        {!error && stores.length === 0 ? (
          <div className="trendy-empty-state">
            <div className="icon-container">
              <HiOutlineHeart size={48} className="text-green-600" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              아직 찜한 가게가 없어요
            </h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              자주 가는 맛집을 찜해보세요.<br/>
              주문이 훨씬 편리해집니다!
            </p>
            
            <button 
                onClick={() => navigate('/user/main')}
                className="trendy-btn"
            >
                맛집 찾아보기
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
                <span className="font-bold text-gray-800">총 </span>
                <span className="font-bold text-green-600">{stores.length}</span>
                <span className="font-bold text-gray-800">개</span>
            </div>
            
            <div className="space-y-4">
              {stores.map((fav) => (
                <div 
                  key={fav.favoriteId} 
                  onClick={() => handleStoreClick(fav.storeId)}
                  className="flex bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow active:bg-gray-50 group"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-300 group-hover:bg-gray-100 transition-colors">
                      <MdStorefront  size={32} />
                  </div>

                  <div className="ml-4 flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-green-700 transition-colors">
                      {fav.storeName}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <HiStar className="text-yellow-400 mr-1" />
                      <span className="font-bold text-gray-900">{fav.rating || "0.0"}</span>
                    </div>
                  </div>
                  
                  <div className="ml-2 flex flex-col justify-start pt-1">
                      {/* Heart Icon handles removal */}
                      <button 
                        onClick={(e) => handleRemoveFavorite(e, fav.favoriteId)}
                        className="p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <HiHeart className="text-red-500 drop-shadow-sm" size={24} />
                      </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}