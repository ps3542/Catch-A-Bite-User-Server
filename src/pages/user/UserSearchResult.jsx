import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineSearch, HiX, HiStar, HiOutlineClock } from "react-icons/hi";
import { appUserStoreService } from "../../api/appuser/StoreService";
import { useSearchParams } from "react-router-dom";

export default function UserSearchResult() {
  const navigate = useNavigate();
  
  // State
  const [keyword, setKeyword] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [viewState, setViewState] = useState("history"); // 'history' | 'loading' | 'results' | 'empty'
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const urlKeyword = searchParams.get("keyword");

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("search_history");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    if (urlKeyword) {
    handleSearch(urlKeyword); // Trigger your API call
    }
  }, [urlKeyword]);

  // Handler: Save Search History
  const addToHistory = (term) => {
    let updated = [term, ...recentSearches.filter((t) => t !== term)];
    if (updated.length > 10) updated = updated.slice(0, 10); // Limit to 10
    setRecentSearches(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  // Handler: Delete History Item
  const removeHistoryItem = (e, term) => {
    e.stopPropagation(); // Prevent triggering the search click
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("search_history", JSON.stringify(updated));
  };

  // Handler: Execute Search
  const handleSearch = async (term) => {
    const searchTerm = term || keyword;
    if (!searchTerm.trim()) return;

    setKeyword(searchTerm);
    addToHistory(searchTerm);
    setViewState("loading");
    setError(null);

    try {
      const response = await appUserStoreService.searchStores(searchTerm);
      const data = response.data || [];
      setSearchResults(data);
      setViewState(data.length > 0 ? "results" : "empty");
    } catch (err) {
      console.error(err);
      setError("검색 중 오류가 발생했습니다.");
      setViewState("empty");
    }
  };

  // Handler: Enter Key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">

      {/* --- Main Content Area --- */}
      <div className="flex-1 overflow-y-auto">
        
        {/* VIEW: History & Categories */}
        {viewState === "history" && (
          <div className="px-4 py-4 space-y-8">
            
            {/* Recent Searches */}
            <section>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1">
                검색 기록 <span className="text-gray-400 font-normal text-xs">Recent</span>
              </h3>
              {recentSearches.length === 0 ? (
                <p className="text-gray-400 text-sm py-2">최근 검색 기록이 없습니다.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, index) => (
                    <span 
                      key={index} 
                      onClick={() => handleSearch(term)}
                      className="inline-flex items-center bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-sm cursor-pointer hover:bg-gray-100"
                    >
                      {term}
                      <button 
                        onClick={(e) => removeHistoryItem(e, term)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <HiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW: Loading */}
        {viewState === "loading" && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>가게를 찾고 있습니다...</p>
          </div>
        )}

        {/* VIEW: Empty / Error */}
        {(viewState === "empty" || error) && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 px-6 text-center">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                <HiOutlineSearch size={48} className="text-gray-300 mb-4" />
                <p className="text-lg font-semibold text-gray-700">검색 결과가 없습니다.</p>
                <p className="text-sm mt-1">다른 검색어 카테고리를 선택해보세요.</p>
              </>
            )}
          </div>
        )}

        {/* VIEW: Results List */}
        {viewState === "results" && (
          <div className="px-4 py-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">
                검색 결과 <span className="text-blue-600">{searchResults.length}</span>개
              </h2>
            </div>
            
            <div className="space-y-4">
              {searchResults.map((store) => (
                <div 
                  key={store.id} 
                  onClick={() => navigate(`/user/store/${store.id}`)}
                  className="flex bg-white rounded-lg border border-gray-100 shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow"
                >
                  {/* Store Image */}
                  <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 relative">
                    {store.storeImageUrl ? (
                       <img src={store.storeImageUrl} alt={store.storeName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        No Img
                      </div>
                    )}
                  </div>

                  {/* Store Info */}
                  <div className="ml-4 flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">
                        {store.storeName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <HiStar className="text-yellow-400 mr-1" />
                        <span className="font-bold text-gray-900 mr-1">{store.rating || "0.0"}</span>
                        <span className="text-gray-400 text-xs">({store.reviewCount || 0})</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center">
                        <HiOutlineClock className="mr-1" />
                        <span>{store.estimatedDeliveryTime || "30-40"}분</span>
                      </div>
                      <div>
                        배달비 <span className="font-medium text-gray-700">{store.deliveryFee?.toLocaleString() || 0}원</span>
                        <span className="mx-1">|</span>
                        최소주문 {store.minOrderPrice?.toLocaleString() || 0}원
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}