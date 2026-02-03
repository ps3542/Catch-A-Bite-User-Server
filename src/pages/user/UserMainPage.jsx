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
  { key: 'chicken', text: '치킨', image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEyMDNfMTE3%2FMDAxNzY0NzAzMTAyNTU4.n0BV5HyOdryoFC1t0dAK79HyEKOnrZJvFZGGnp__5X0g.PHF0ZKgr4-01DQla8M_riA6SXqinzQQ6t0SfurA6Miwg.JPEG%2F%25B4%25D9%25BF%25EE%25B7%25CE%25B5%25E5%25A3%25AD34.jpeg&type=sc960_832' },
  { key: 'korean', text: '한식', image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMzA2MTZfNzQg%2FMDAxNjg2OTA4NTA2OTEy.iTI0YeANW3A8GEHyCEoT8YaYuinaLYxkRungZMhQ-M0g.NZQN9qcQLXto9Bg9EyEvqXG9gMSZU8iDNSloA8VVb4cg.JPEG.sbr93000%2Fimg_%25281%2529.jpg&type=sc960_832' },
  { key: 'chinese', text: '중식', image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTAyMTRfMjIw%2FMDAxNzM5NTA2OTc1NTk2.gIS00l8kTLkuxSat92Tw6msEW1SJIXumA5TKTh4C1nog.Kx0YAo8d0iOQlPBpzBPh7OxIH01995xSGLk2Qln4gncg.JPEG%2F6.jpg&type=sc960_832' },
  { key: 'japanese', text: '일식', image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEwMTRfMjUx%2FMDAxNzYwNDMyNzMzODE2.M1xYlRmxgN9LJBr0ZucJEi4f5uC5DYhcadXLRyGTYg0g.MPajdj4VD1WMx8bb89iZoAVEdGi_sVPXVfOOwmsZl8gg.JPEG%2F900%25A3%25DF20251012%25A3%25DF122742.jpg&type=sc960_832' },
  { key: 'western', text: '양식', image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDEyMThfMTkz%2FMDAxNzM0NDk0NDM2MDg4.JqT8PrWXnr1xmS4OY0h3MDyND6tO3EZT11xjrWgRtwAg.25ZmuqEyZVX2hRTR99J5MZ37BXDtClry4gsfwg8rFzog.JPEG%2F900%25A3%25DF20241214%25A3%25DF123001.jpg&type=sc960_832' },
  { key: 'snack', text: '분식', image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEwMTNfNDkg%2FMDAxNzYwMzM5MTU1ODc3.9e8gOLQOkTIddqiIlvtP2YeWSv6NjqnlsfwnyMvWJ0kg.JRMB0SX3oT90fvLM_uM3O7J1GnDndqYnydlrY18dhKYg.PNG%2F59ccc742-7f69-419c-be73-6ae187003cee.png&type=sc960_832' },
  { key: 'pizza', text: '피자', image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTEyMjNfMTA1%2FMDAxNzY2NDUzMzgwNjc5.ZFKiuifaEsQwym30j1eDDogjE6nVZwRIAf0cK4WYDmgg.OrtlflxIcsF0PvHEBhsknbYIdSXo6jFBTuhct-w-hCMg.JPEG%2F6.jpg&type=sc960_832' },
  { key: 'cafe_dessert', text: '카페/디저트', image: 'https://media.istockphoto.com/id/1428594094/ko/%EC%82%AC%EC%A7%84/%EB%82%98%EB%AC%B4-%ED%85%8C%EC%9D%B4%EB%B8%94-%EC%BB%A4%ED%94%BC-%EB%A9%94%EC%9D%B4%EC%BB%A4-%ED%8C%A8%EC%8A%A4%ED%8A%B8%EB%A6%AC-%EB%B0%8F-%ED%8E%9C%EB%8D%98%ED%8A%B8-%EC%A1%B0%EB%AA%85%EC%9D%B4%EC%9E%88%EB%8A%94-%EB%B9%88-%EC%BB%A4%ED%94%BC-%EC%88%8D-%EC%9D%B8%ED%85%8C%EB%A6%AC%EC%96%B4.jpg?s=612x612&w=0&k=20&c=5bHJXVEZ4D9zsN_ZV-XVZsTxwxL5GdUOo5D0PPs3fsI=' },
  { key: 'late_night', text: '야식', image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDEyMDVfMjY1%2FMDAxNzMzMzk4NzgyODgz.fF7oxEhObmJzNYm1RvpQYKy7KpG0rPQCjcqcIi3LoBkg.gB8EEOi6paSAFtRPhcEcv2MA5L_bmcJGrqzfRmh035gg.PNG%2Fimage.png&type=sc960_832' },
  { key: 'etc', text: '기타', image: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fimage.msscdn.net%2Fmfile_s01%2F2023%2F01%2F29%2Ff698ec438a71ad5c0e405170a90f29d6021950.jpg&type=sc960_832' }
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