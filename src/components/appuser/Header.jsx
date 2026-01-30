// 라이브러리 및 아이콘 임포트
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, useSearchParams } from "react-router-dom";
import { HiArrowSmLeft, HiOutlineSearch, HiOutlineBell, HiOutlineShoppingCart  } from "react-icons/hi";
import './Header.css';

const Header = () => {
    // 훅 초기화 (페이지 이동, 현재 위치, URL 파라미터)
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // 현재 페이지 경로 상태 확인
    const isMainPage = location.pathname === '/user/main';
    const isSearchPage = location.pathname === '/user/search';
    
    // 주문 관련 페이지인지 확인 (가게 상세 또는 메뉴 상세 페이지일 경우 true)
    // URL에 '/user/store' 또는 '/user/menu'가 포함되어 있는지 검사합니다.
    const isOrderPage = location.pathname.includes('/user/store') || location.pathname.includes('/user/menu');

    // 검색어 상태 관리 (input 값)
    const [keyword, setKeyword] = useState("");

    // 검색 페이지 진입 시 URL의 keyword 파라미터와 입력창 동기화
    // (새로고침 하더라도 검색어가 유지되도록 함)
    useEffect(() => {
        if (isSearchPage) {
            const currentQuery = searchParams.get("keyword");
            if (currentQuery) {
                setKeyword(currentQuery);
            }
        } else {
            setKeyword(""); // 검색 페이지를 벗어나면 입력창 초기화
        }
    }, [isSearchPage, searchParams]);

    // 검색 실행 핸들러
    const handleSearch = () => {
        if (!keyword.trim()) return;
        // 검색 페이지로 이동하며 URL 쿼리 스트링에 keyword를 포함시킴
        navigate(`/user/search?keyword=${encodeURIComponent(keyword)}`);
    };

    // 엔터키 입력 핸들러 (입력창에서 엔터 누르면 검색 실행)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <header className='header-nav'>
            {/* 헤더 왼쪽 영역: 검색 모드일 땐 입력창, 아니면 로고/뒤로가기 버튼 */}
            <div className={`header-left ${isSearchPage ? 'search-mode' : ''}`}>
                {isSearchPage ? (
                    // 검색 페이지: 텍스트 입력창 렌더링
                    <input
                        type="text"
                        className="header-search-input"
                        placeholder="검색어를 입력하세요"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                ) : (
                    // 일반 페이지
                    isMainPage ? (
                        // 메인 페이지: 브랜드 로고 텍스트 표시
                        <span className="brand-title">Catch-A-Bite</span>
                    ) : (
                        // 서브 페이지: 뒤로가기 버튼 표시
                        <button
                            className="nav-btn back-btn"
                            onClick={() => navigate(-1)}
                        >
                            <HiArrowSmLeft size={24} />
                        </button>
                    )
                )}
            </div>

            {/* 헤더 오른쪽 영역: 검색 아이콘 및 기능 아이콘 (알림/장바구니) */}
            <div className="header-right">
                
                {/* 1. 검색 아이콘 버튼 */}
                {isSearchPage ? (
                    // 검색 페이지: 클릭 시 실제 검색 로직 수행
                    <button className="nav-icon-btn" onClick={handleSearch}>
                        <HiOutlineSearch size={24} />
                    </button>
                ) : (
                    // 일반 페이지: 클릭 시 검색 페이지로 이동하는 링크 역할
                    <Link to="/user/search" className="nav-icon-link">
                        <HiOutlineSearch size={24} />
                    </Link>
                )}

                {/* 2. 기능 아이콘 버튼 (페이지에 따라 다르게 표시) */}
                {isOrderPage ? (
                    // 주문 페이지 (가게/메뉴 상세): 장바구니 버튼 표시
                    <button 
                        type="button" 
                        className="nav-icon-btn" 
                        onClick={() => navigate('/user/cart')}
                    >
                        <HiOutlineShoppingCart  size={24} />
                    </button>
                ) : (
                    // 그 외 페이지 (메인, 검색 등): 알림 버튼 표시
                    <button type="button" className="nav-icon-btn">
                        <HiOutlineBell size={24} />
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;