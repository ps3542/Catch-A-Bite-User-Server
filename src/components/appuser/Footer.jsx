import { NavLink } from "react-router-dom";
import { HiOutlineHome, HiOutlineSearch, HiOutlineHeart, HiOutlineReceiptTax, HiOutlineUser } from 'react-icons/hi';
import './Footer.css';

const Footer = () => {
    return (
        <nav className='footer-nav'>
            <NavLink to='/user/main' className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <HiOutlineHome size={24} />
                <span>홈</span>
            </NavLink>
            <NavLink to='/user/search' className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <HiOutlineSearch size={24} />
                <span>검색</span>
            </NavLink>
            <NavLink to='/user/favorite' className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <HiOutlineHeart size={24} />
                <span>즐겨찾기</span>
            </NavLink>
            <NavLink to='/user/order' className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <HiOutlineReceiptTax size={24} />
                <span>주문내역</span>
            </NavLink>
            <NavLink to='/user/profile' className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <HiOutlineUser size={24} />
                <span>마이페이지</span>
            </NavLink>
        </nav>
    );
};

export default Footer;