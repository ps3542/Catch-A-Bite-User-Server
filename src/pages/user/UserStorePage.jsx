/* src/pages/user/UserStorePage.jsx */
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiStar, HiOutlineClock, HiOutlineShoppingBag, HiHeart, HiOutlineHeart } from "react-icons/hi";
import { appUserStoreService } from "../../api/appuser/StoreService";
import { appUserFavoriteService } from "../../api/appuser/FavoriteService"; // Import FavoriteService
import "./UserStorePage.css";

export default function UserStorePage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); 
  const [favoriteId, setFavoriteId] = useState(null); // Changed boolean to favoriteId (ID or null)

  const categoryRefs = useRef([]);
  const tabsContainerRef = useRef(null);

  useEffect(() => {
    loadStoreData();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [storeId]);

  const loadStoreData = async () => {
    try {
      const data = await appUserStoreService.getStoreDetails(storeId);
      setStore(data);
      // Backend now returns 'favoriteId' if it is a favorite, else null
      setFavoriteId(data.favoriteId);
    } catch (error) {
      console.error("Store Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (!categoryRefs.current.length) return;
    const scrollPosition = window.scrollY + 150; 
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
      const y = ref.getBoundingClientRect().top + window.scrollY - 110; 
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    
    try {
      if (favoriteId) {
        // Remove Favorite
        await appUserFavoriteService.removeFavorite(favoriteId);
        setFavoriteId(null);
      } else {
        // Add Favorite
        const result = await appUserFavoriteService.addFavorite(storeId);
        if (result && result.favoriteId) {
          setFavoriteId(result.favoriteId);
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      // Optional: Show toast message here
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!store) return <div className="error-screen">가게 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="store-page pb-24">
      
      {/* --- 1. Header Image Area --- */}
      <header className="store-header">
        <div className="header-overlay">
            <div className="header-actions">
                <button className="icon-btn" onClick={toggleFavorite}>
                    {/* Render solid heart if favoriteId exists, else outline */}
                    {favoriteId ? <HiHeart className="text-red-500" size={24}/> : <HiOutlineHeart size={24}/>}
                </button>
            </div>
        </div>
        {store.storeImageUrl ? (
          <img src={store.storeImageUrl} alt={store.storeName} className="store-img" />
        ) : (
          <div className="store-img-placeholder">Catch-A-Bite</div>
        )}
      </header>

      {/* --- 2. Store Info Card --- */}
      <section className="store-info-section">
        <h1 className="store-name">{store.storeName}</h1>
        
        <div className="store-meta">
          <div className="rating">
            <HiStar className="star-icon" />
            <span className="score">{store.rating || "0.0"}</span>
            <span className="count">({store.reviewCount || 0})</span>
          </div>
          <div className="delivery-time">
             <HiOutlineClock className="clock-icon" /> 
             {store.estimatedDeliveryTime || "30-45분"}
          </div>
        </div>

        <p className="store-intro">{store.storeIntro}</p>

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
      </section>

      {/* --- 3. Sticky Category Tabs --- */}
      <div className="sticky-tabs-container" ref={tabsContainerRef}>
        {store.menuCategories?.map((cat, index) => (
          <button 
            key={cat.menuCategoryId}
            className={`tab-btn ${activeTab === index ? "active" : ""}`}
            onClick={() => scrollToCategory(index)}
          >
            {cat.menuCategoryName}
          </button>
        ))}
      </div>

      {/* --- 4. Menu Lists --- */}
      <div className="menu-sections">
        {store.menuCategories?.map((cat, index) => (
          <div 
            key={cat.menuCategoryId} 
            className="menu-category"
            ref={(el) => (categoryRefs.current[index] = el)}
          >
            <h3 className="category-title">{cat.menuCategoryName}</h3>
            
            <div className="menu-list">
                {cat.menus?.map((menu) => (
                <div 
                    key={menu.menuId} 
                    className={`menu-item ${!menu.menuIsAvailable ? 'sold-out' : ''}`}
                    onClick={() => menu.menuIsAvailable && navigate(`/user/menu/${menu.menuId}`)}
                >
                    <div className="menu-info">
                        <h4 className="menu-name">
                            {menu.menuName} 
                            {!menu.menuIsAvailable && <span className="sold-out-badge">품절</span>}
                        </h4>
                        <p className="menu-desc">{menu.menuDescription}</p>
                        <p className="menu-price">{menu.menuPrice?.toLocaleString()}원</p>
                    </div>
                    <div className="menu-thumb"></div> 
                </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- 5. Floating Action Button (Cart) --- */}
      <div className="fab-container">
        <button className="cart-fab" onClick={() => navigate('/user/cart')}>
            <span className="cart-count-badge">1</span> 
            <HiOutlineShoppingBag size={20} />
            <span>장바구니 보기</span>
            <span className="cart-total">23,000원</span> 
        </button>
      </div>
    </div>
  );
}