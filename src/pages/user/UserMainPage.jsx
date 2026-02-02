// React
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 로그인
import useRoleGuard from "../../hooks/useRoleGuard.js";
// API
import { appUserStoreService } from "../../api/appuser/StoreService";
import { appUserStoreOrderService } from "../../api/appuser/StoreOrderService";
import { appUserFavoriteService } from "../../api/appuser/FavoriteService";
// CSS
import './UserMainPage.css';

// Carousel 및 관련 스타일
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// StoreCarousel 
import StoreCarousel from "../../components/appuser/StoreCarousel.jsx";
const fallbackUser = { name: "사용자 찾기 실페"};

//디버깅
const separator = "===================================";

const storeCategory = [
  { key: 'chicken', text: '치킨', image: 'https://loremflickr.com/320/240/friedchicken' },
  { key: 'korean', text: '한식', image: 'https://loremflickr.com/320/240/bibimbap,koreanfood' },
  { key: 'chinese', text: '중식', image: 'https://loremflickr.com/320/240/jajangmyeon,chinesefood' },
  { key: 'japanese', text: '일식', image: 'https://loremflickr.com/320/240/sushi,japanesefood' },
  { key: 'western', text: '양식', image: 'https://loremflickr.com/320/240/pasta,burger' },
  { key: 'snack', text: '분식', image: 'https://loremflickr.com/320/240/tteokbokki,streetfood' },
  { key: 'pizza', text: '피자', image: 'https://loremflickr.com/320/240/pizza' },
  { key: 'cafe_dessert', text: '카페/디저트', image: 'https://loremflickr.com/320/240/cake,coffee' },
  { key: 'late_night', text: '야식', image: 'https://loremflickr.com/320/240/porkbelly,barbecue' },
  { key: 'etc', text: '기타', image: 'https://loremflickr.com/320/240/dining,buffet' }
];


export default function UserMainPage() {
  const navigate = useNavigate();
  const { user, loading } = useRoleGuard("USER", fallbackUser);
  const [randomStores, setRandomStores] = useState([]);
  const [favoriteStores, setFavoriteStores] = useState([]);
  const [frequentStores, setFrequentStores] = useState([]);

  const dateText = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  useEffect(() => {
    if (!loading && user) {
        loadData();
        loadFavorites();
    }
  }, [user, loading]);

  const loadData = async () => {
    try {
        // 랜덤 가게 10개
        const allStores = await appUserStoreService.getRandomStores();
        const shuffled = [...allStores].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);
        setRandomStores(selected);
    } catch (e) {
        console.error(separator);
        console.error("랜덤 가게 불러오기 실패");
        console.error(e);
        console.error(separator);
    }

    try{
      // 자주 주문한 가게
      if(user){
        const userId = user.appUserId;
        const frequent = await appUserStoreOrderService.getFrequentStores(userId,5);
        // console.log(separator);
        // console.log("user")
        // console.log(user);
        // console.log("UserId: ",userId);
        // console.log("자주 주문한 가게 목록")
        // console.log(frequent);
        // console.log(separator);
        setFrequentStores(frequent);
      }
    } catch(e){
      console.error(separator);
        console.error("자주 주문한 가게 불러오기 실패");
        console.error(e);
        console.error(separator);
    }
    };

    const loadFavorites = async () => {
      try {
        // 1. Get List of Favorites (IDs)
        const favData = await appUserFavoriteService.getMyFavorites();
        
        if (favData && favData.length > 0) {
          // 2. Fetch Details for each to get images/status
          const detailsPromises = favData.map(async (fav) => {
            try {
              const detail = await appUserStoreService.getStoreDetails(fav.storeId);
              return { ...detail, favoriteId: fav.favoriteId };
            } catch (e) {
              console.error(`Failed to load store ${fav.storeId}`, e);
              return null; 
            }
          });
  
          const results = await Promise.all(detailsPromises);
          setFavoriteStores(results.filter(s => s !== null));
          console
        } else {
          setFavoriteStores([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    const handleCategoryClick = (categoryKey) => {
      console.log("Selected Category:", categoryKey);
      navigate(`/user/search?storeCategory=${categoryKey}`);
    };

  return (
    <div className="user-main-container" style={{ paddingBottom: '80px' }}>
      
      {/* 1. 상단 배너 영역 */}
      <section style={{ marginBottom: '24px' }}>
         <StoreCarousel title="오늘의 추천 맛집" stores={randomStores} pages={1} />
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
          {storeCategory.map((category) => (
            <SwiperSlide key={category.key}>
              <div
                className="storeCategory"
                onClick={() => handleCategoryClick(category.key)}
                style={{
                  // 배경 이미지와 어두운 오버레이(Gradient)를 함께 적용하여 텍스트 가독성 확보
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${category.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#f0f0f0', // 이미지가 로드되지 않았을 때의 기본 색상
                  height: '80px', // 이미지가 잘 보이도록 높이를 약간 조정 (70px -> 80px)
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#fff', // 배경이 어두우므로 글자색은 흰색
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)', // 텍스트 그림자 추가
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                {category.text}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 3. 자주 주문한 곳 (StoreCarousel 활용) */}
      {frequentStores.length > 0 && (
        <div id="Frequent_Visit">
          <StoreCarousel title="자주 주문한 곳" stores={frequentStores} pages={2.2} />
        </div>
      )}

      {/* 4. 즐겨찾기 (StoreCarousel 활용) */}
      <div id="Favorite_Store">
        <StoreCarousel title="즐겨찾기" stores={favoriteStores} />
      </div>
    </div>
  );
}