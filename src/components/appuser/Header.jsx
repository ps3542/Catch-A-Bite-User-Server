import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, useSearchParams } from "react-router-dom";
import { HiArrowSmLeft, HiOutlineSearch, HiOutlineBell } from "react-icons/hi";
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Determine current page state
    const isMainPage = location.pathname === '/user/main';
    const isSearchPage = location.pathname === '/user/search';

    // State for search input
    const [keyword, setKeyword] = useState("");

    // Sync input with URL keyword when on search page (keeps input filled if refreshing)
    useEffect(() => {
        if (isSearchPage) {
            const currentQuery = searchParams.get("keyword");
            if (currentQuery) {
                setKeyword(currentQuery);
            }
        } else {
            setKeyword(""); // Reset when leaving search page
        }
    }, [isSearchPage, searchParams]);

    // Search Action
    const handleSearch = () => {
        if (!keyword.trim()) return;
        // Update URL with keyword -> Search Page should listen to this param
        navigate(`/user/search?keyword=${encodeURIComponent(keyword)}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <header className='header-nav'>
            {/* Header Left: Search Input OR Brand/Back Button */}
            <div className={`header-left ${isSearchPage ? 'search-mode' : ''}`}>
                {isSearchPage ? (
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
                    isMainPage ? (
                        <span className="brand-title">Catch-A-Bite</span>
                    ) : (
                        <button
                            className="nav-btn back-btn"
                            onClick={() => navigate(-1)}
                        >
                            <HiArrowSmLeft size={24} />
                        </button>
                    )
                )}
            </div>

            <div className="header-right">
                {/* Search Button: Acts as Submit on Search Page, Link otherwise */}
                {isSearchPage ? (
                    <button className="nav-icon-btn" onClick={handleSearch}>
                        <HiOutlineSearch size={24} />
                    </button>
                ) : (
                    <Link to="/user/search" className="nav-icon-link">
                        <HiOutlineSearch size={24} />
                    </Link>
                )}

                {/* Notification Button */}
                <button type="button" className="nav-icon-btn">
                    <HiOutlineBell size={24} />
                </button>
            </div>
        </header>
    );
};

export default Header;