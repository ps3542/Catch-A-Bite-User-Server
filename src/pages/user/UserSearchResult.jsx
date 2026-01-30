// Project Name: CatchaBite
// File Name: src/pages/user/UserSearchResult.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HiOutlineSearch, HiX, HiClock } from "react-icons/hi"; 
import { appUserStoreService } from "../../api/appuser/StoreService";

// CSS
import "./UserSearchResult.css";

// StoreCard
import StoreCardLean from "../../components/appuser/StoreCardLean";

export default function UserSearchResult() {
  const navigate = useNavigate();
  
  // ========================================================================================
  // [1. 상태(State) 및 훅(Hooks) 정의]
  // ========================================================================================
  
  // 검색 키워드 상태
  const [keyword, setKeyword] = useState("");
  
  // 최근 검색어 목록 (localStorage와 동기화)
  const [recentSearches, setRecentSearches] = useState([]);
  
  // 검색 결과 데이터 (가게 목록)
  const [searchResults, setSearchResults] = useState([]);
  
  // 화면 상태 관리 (history: 검색기록, loading: 로딩중, results: 결과목록, empty: 결과없음)
  const [viewState, setViewState] = useState("history"); 
  
  // 에러 메시지 상태
  const [error, setError] = useState(null);
  
  // URL 파라미터 훅 (쿼리스트링 감지)
  const [searchParams, setSearchParams] = useSearchParams();
  const urlKeyword = searchParams.get("keyword");
  const urlCategory = searchParams.get("storeCategory");

  // 카테고리 영문 -> 한글 매핑 객체 (UI 표시용)
  const categoryNames = {
    chicken: '치킨', korean: '한식', chinese: '중식', japanese: '일식',
    western: '양식', snack: '분식', pizza: '피자', cafe_dessert: '카페·디저트',
    late_night: '야식', etc: '기타'
  };

  // ========================================================================================
  // [2. 생명주기(Lifecycle) 및 초기화 로직]
  // ========================================================================================
  
  useEffect(() => {
    // 2-1. 컴포넌트 마운트 시 로컬 스토리지에서 최근 검색어 불러오기
    const saved = localStorage.getItem("search_history");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // 2-2. URL 파라미터 변경 감지 및 분기 처리
    if (urlCategory) {
      // Case A: 카테고리 검색인 경우 (예: ?storeCategory=chicken)
      setKeyword(""); // 카테고리 진입 시 검색어 입력창 비움
      executeCategorySearch(urlCategory);
    } else if (urlKeyword) {
      // Case B: 키워드 검색인 경우 (예: ?keyword=떡볶이)
      setKeyword(urlKeyword);
      executeKeywordSearch(urlKeyword);
    } else {
      // Case C: 파라미터가 없는 경우 (검색 메인 화면 - 최근 검색어 표시)
      setViewState("history");
    }
  }, [urlKeyword, urlCategory]);

  // ========================================================================================
  // [3. 검색 기록 관리 핸들러 (History Management)]
  // ========================================================================================

  /**
   * 검색어를 최근 검색 기록에 추가합니다.
   * - 중복 제거: 이미 존재하는 검색어라면 제거 후 맨 앞에 추가
   * - 최대 개수 제한: 10개까지만 저장
   * - LocalStorage 동기화
   */
  const addToHistory = (term) => {
    let updated = [term, ...recentSearches.filter((t) => t !== term)];
    if (updated.length > 10) updated = updated.slice(0, 10);
    
    setRecentSearches(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  /**
   * 특정 검색 기록 항목을 삭제합니다.
   * (이벤트 전파 중단 e.stopPropagation() 필수: 항목 클릭 시 검색 실행 방지)
   */
  const removeHistoryItem = (e, term) => {
    e.stopPropagation(); 
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  /**
   * 검색 기록 전체를 삭제합니다.
   */
  const clearAllHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem("search_history");
  };

  // ========================================================================================
  // [4. API 호출 및 검색 실행 로직]
  // ========================================================================================

  /**
   * [기능 1] 키워드 검색 실행
   * - 검색어가 유효할 때만 실행
   * - 검색 성공 시 검색 기록에 키워드 추가
   */
  const executeKeywordSearch = async (term) => {
    if (!term.trim()) return;
    
    addToHistory(term); // 검색 기록 저장
    setViewState("loading");
    setError(null);

    try {
      const response = await appUserStoreService.searchStores(term);
      const data = Array.isArray(response) ? response : (response.data || []);
      
      setSearchResults(data);
      // 데이터 유무에 따라 상태 전환 (결과 목록 vs 빈 화면)
      setViewState(data.length > 0 ? "results" : "empty");

    } catch (err) {
      console.error(err);
      setError("검색 중 오류가 발생했습니다.");
      setViewState("empty");
    }
  };

  /**
   * [기능 2] 카테고리 검색 실행
   * - 카테고리 클릭 시에는 검색 기록을 저장하지 않음
   */
  const executeCategorySearch = async (categoryKey) => {
    setViewState("loading");
    setError(null);

    try {
      const response = await appUserStoreService.getStoresByCategory(categoryKey);
      const data = response.data;

      setSearchResults(data);
      setViewState(data.length > 0 ? "results" : "empty");

    } catch (err) {
      console.error(err);
      setError("카테고리 정보를 불러오는데 실패했습니다.");
      setViewState("empty");
    }
  };

  // ========================================================================================
  // [5. 유틸리티 및 렌더링 헬퍼]
  // ========================================================================================

  /**
   * 현재 상태(키워드/카테고리)에 따라 페이지 타이틀을 동적으로 생성합니다.
   */
  const getPageTitle = () => {
    if (urlCategory) {
      const koreanName = categoryNames[urlCategory] || urlCategory;
      return <>{koreanName} <span className="title-sub">Category</span></>;
    }
    if (urlKeyword) {
        return <>'{urlKeyword}' 검색 결과</>;
    }
    return <>검색 결과 <span className="count-number">{searchResults.length}</span></>;
  };

  return (
    <div className="search-result-page">
      
      {/* 메인 컨텐츠 영역 */}
      <div className="search-content">
        
        {/* ================================================================== */}
        {/* [VIEW 1] 검색 기록 (History)                                       */}
        {/* 조건: viewState가 history이고, 카테고리 검색 상태가 아닐 때 표시          */}
        {/* ================================================================== */}
        {viewState === "history" && !urlCategory && (
          <div className="history-section">
            <div className="history-header">
              <h3 className="section-title">최근 검색어</h3>
              {recentSearches.length > 0 && (
                <button onClick={clearAllHistory} className="clear-all-btn">
                  전체 삭제
                </button>
              )}
            </div>
            
            {recentSearches.length === 0 ? (
              <div className="no-history-container">
                <p className="no-history-msg">최근 검색 기록이 없습니다.</p>
              </div>
            ) : (
              <ul className="history-list">
                {recentSearches.map((term, index) => (
                  <li 
                    key={index} 
                    onClick={() => {
                        // 항목 클릭 시 해당 검색어로 재검색
                        setKeyword(term);
                        setSearchParams({ keyword: term });
                    }}
                    className="history-item"
                  >
                    <div className="history-item-left">
                      <HiClock className="history-icon" />
                      <span className="history-text">{term}</span>
                    </div>
                    {/* 삭제 버튼 (이벤트 버블링 방지 처리됨) */}
                    <button 
                      onClick={(e) => removeHistoryItem(e, term)}
                      className="delete-history-btn"
                    >
                      <HiX />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* [VIEW 2] 로딩 상태 (Loading)                                       */}
        {/* ================================================================== */}
        {viewState === "loading" && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">맛집을 찾고 있어요...</p>
          </div>
        )}

        {/* ================================================================== */}
        {/* [VIEW 3] 결과 없음 또는 에러 (Empty / Error)                        */}
        {/* ================================================================== */}
        {(viewState === "empty" || error) && (
          <div className="empty-container">
            {error ? (
              <p className="error-msg">{error}</p>
            ) : (
              <>
                <div className="empty-icon-wrapper">
                    <HiOutlineSearch size={40} className="empty-icon" />
                </div>
                <p className="empty-title">검색 결과가 없습니다.</p>
                <p className="empty-desc">
                  {urlCategory 
                    ? "해당 카테고리의 가게를 찾을 수 없습니다." 
                    : "입력하신 검색어의 철자를 확인하거나\n다른 키워드로 검색해보세요."}
                </p>
              </>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* [VIEW 4] 검색 결과 목록 (Results)                                  */}
        {/* ================================================================== */}
        {viewState === "results" && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-count-title">
                {getPageTitle()}
              </h2>
            </div>
            
            {/* StoreCardLean 컴포넌트를 사용하여 가게 목록 렌더링 */}
            <div className="results-list">
              {searchResults.map((store) => (
                <StoreCardLean 
                  key={store.storeId} 
                  store={store} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}