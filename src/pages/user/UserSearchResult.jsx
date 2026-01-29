/* Project Name: CatchaBite */
/* File Name: src/pages/user/UserSearchResult.jsx */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HiOutlineSearch, HiX } from "react-icons/hi";
import { appUserStoreService } from "../../api/appuser/StoreService";

// CSS
import "./UserSearchResult.css";

// StoreCard
import StoreCardLean from "../../components/appuser/StoreCardLean";

export default function UserSearchResult() {
  const navigate = useNavigate();
  
  // State
  const [keyword, setKeyword] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [viewState, setViewState] = useState("history"); // 'history' | 'loading' | 'results' | 'empty'
  const [error, setError] = useState(null);
  
  // URL Params
  const [searchParams, setSearchParams] = useSearchParams();
  const urlKeyword = searchParams.get("keyword");
  const urlCategory = searchParams.get("storeCategory");

  // 카테고리 한글 명칭 매핑 (UI 표시용)
  const categoryNames = {
    chicken: '치킨', korean: '한식', chinese: '중식', japanese: '일식',
    western: '양식', snack: '분식', pizza: '피자', cafe_dessert: '카페·디저트',
    late_night: '야식', etc: '기타'
  };

  // --- Effects ---

  useEffect(() => {
    // 1. 최근 검색어 불러오기
    const saved = localStorage.getItem("search_history");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // 2. URL 변경 감지 (키워드 vs 카테고리)
    if (urlCategory) {
      // Case A: 카테고리 검색인 경우
      setKeyword(""); // 검색어 입력창 비움
      executeCategorySearch(urlCategory);
    } else if (urlKeyword) {
      // Case B: 키워드 검색인 경우
      setKeyword(urlKeyword);
      executeKeywordSearch(urlKeyword);
    } else {
      // Case C: 아무것도 없는 경우 (검색 기록 보여주기)
      setViewState("history");
    }
  }, [urlKeyword, urlCategory]);

  // --- Handlers ---

  const addToHistory = (term) => {
    let updated = [term, ...recentSearches.filter((t) => t !== term)];
    if (updated.length > 10) updated = updated.slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  const removeHistoryItem = (e, term) => {
    e.stopPropagation();
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  const handleSearchClick = () => {
    if (!keyword.trim()) return;
    // URL 변경 -> useEffect 발동 -> executeKeywordSearch 실행됨
    setSearchParams({ keyword: keyword.trim() });
  };

  // [기능 1] 키워드 검색 실행
  const executeKeywordSearch = async (term) => {
    if (!term.trim()) return;
    
    addToHistory(term); // 키워드 검색일 때만 기록 저장
    setViewState("loading");
    setError(null);

    try {
      const response = await appUserStoreService.searchStores(term);
      const data = Array.isArray(response) ? response : (response.data || []);
      
      setSearchResults(data);
      setViewState(data.length > 0 ? "results" : "empty");
    } catch (err) {
      console.error(err);
      setError("검색 중 오류가 발생했습니다.");
      setViewState("empty");
    }
  };

  // [기능 2] 카테고리 검색 실행
  const executeCategorySearch = async (categoryKey) => {
    setViewState("loading");
    setError(null);

    try {
      // 카테고리 검색 API 호출
      const response = await appUserStoreService.getStoresByCategory(categoryKey);
      // console.log("Response");
      // console.log(response);
      // console.log (response.data);
      const data = response.data ;

      setSearchResults(data);
      setViewState(data.length > 0 ? "results" : "empty");
    } catch (err) {
      console.error(err);
      setError("카테고리 정보를 불러오는데 실패했습니다.");
      setViewState("empty");
    }
  };

  // 동적 타이틀 생성
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
      
      {/* Main Content */}
      <div className="search-content">
        
        {/* VIEW: History (검색어가 없고, 카테고리 선택도 안 했을 때만 표시) */}
        {viewState === "history" && !urlCategory && (
          <div className="history-section">
            <h3 className="section-title">
              최근 검색어 <span className="title-sub">Recent</span>
            </h3>
            
            {recentSearches.length === 0 ? (
              <p className="no-history-msg">
                최근 검색 기록이 없습니다.
              </p>
            ) : (
              <div className="history-tags">
                {recentSearches.map((term, index) => (
                  <span 
                    key={index} 
                    onClick={() => {
                        setKeyword(term);
                        setSearchParams({ keyword: term });
                    }}
                    className="history-tag"
                  >
                    {term}
                    <button 
                      onClick={(e) => removeHistoryItem(e, term)}
                      className="delete-tag-btn"
                    >
                      <HiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: Loading */}
        {viewState === "loading" && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">맛집을 찾고 있어요...</p>
          </div>
        )}

        {/* VIEW: Empty / Error */}
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

        {/* VIEW: Results List */}
        {viewState === "results" && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-count-title">
                {getPageTitle()}
              </h2>
            </div>
            
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