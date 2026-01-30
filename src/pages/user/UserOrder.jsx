import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiLocationMarker } from "react-icons/hi"; // [변경] 아이콘 변경 (Outline -> Solid)
import { AppUserCartService } from '../../api/appuser/CartService';
import { appUserStoreOrderService } from '../../api/appuser/StoreOrderService';
import { AppUserAddressService } from '../../api/appuser/AddressService';
import useRoleGuard from '../../hooks/useRoleGuard';
import Modal from '../../components/common/Modal';
import './UserOrder.css';

const UserOrder = () => {
    const { user, loading: authLoading } = useRoleGuard('USER');
    const navigate = useNavigate();

    // --------------------------------------------------------------------------
    // 데이터 상태 관리
    // --------------------------------------------------------------------------
    const [cartData, setCartData] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    // --------------------------------------------------------------------------
    // 폼 입력 상태 관리
    // --------------------------------------------------------------------------
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [storeRequest, setStoreRequest] = useState('');
    const [riderRequest, setRiderRequest] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CARD');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    // --------------------------------------------------------------------------
    // 1. 초기 데이터 로드 (장바구니 및 주소 목록)
    // --------------------------------------------------------------------------
    useEffect(() => {
        if (!authLoading && user) {
            fetchInitialData();
        }
    }, [authLoading, user]);

    const fetchInitialData = async () => {
        try {
            if (!user || !user.appUserId) {
                console.warn("User ID missing, skipping address fetch.");
                return;
            }

            setLoading(true);

            // 장바구니와 주소 목록 병렬 요청
            const [cartResp, addrResp] = await Promise.all([
                AppUserCartService.getMyCart(),
                AppUserAddressService.getMyAddresses(user.appUserId)
            ]);

            // 장바구니 검증
            if (!cartResp.data || cartResp.data.items.length === 0) {
                alert("장바구니가 비어있습니다.");
                navigate('/user/cart');
                return;
            }
            setCartData(cartResp.data);

            // 주소 목록 설정
            const addrList = addrResp.data || [];
            setAddresses(addrList);

            // 기본 주소 선택 로직
            if (addrList.length > 0) {
                const defaultAddr = addrList.find(a => a.isDefault === 'Y') || addrList[0];
                setSelectedAddressId(defaultAddr.addressId);
            }
        } catch (error) {
            console.error("Order Page Load Error:", error);
            alert("주문 정보를 불러오는데 실패했습니다.");
            navigate('/user/main');
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------------------------------
    // 2. 주문 생성 핸들러
    // --------------------------------------------------------------------------
    // 2-1. 주문 버튼 클릭 시 (검증 후 모달 열기)
    const handleCreateOrderClick = () => {
        if (!selectedAddressId) {
            // 주소 미선택은 여전히 alert 혹은 별도 모달로 처리가능 (여기선 alert 유지)
            alert("배달 받으실 주소를 선택해주세요.");
            return;
        }
        
        setIsOrderModalOpen(true);
    };

    // 2-2. 실제 주문 처리 로직 (모달에서 '결제하기' 클릭 시 실행)
    const processOrder = async () => {
        setIsOrderModalOpen(false); // 모달 닫기
        setIsSubmitting(true);      // 로딩 시작

        try {
            const orderData = {
                appUserId: user.appUserId,
                storeId: cartData.storeId,
                addressId: Number(selectedAddressId),
                storeRequest: storeRequest,
                riderRequest: riderRequest,
                paymentMethod: paymentMethod
            };

            const result = await appUserStoreOrderService.createOrder(orderData);

            if (result && result.orderId) {
                navigate(`/user/payment?orderId=${result.orderId}`);
            } else {
                throw new Error("주문 ID를 반환받지 못했습니다.");
            }
        } catch (error) {
            console.error("Order Creation Failed:", error);
            alert(`주문 생성 실패: ${error.message}`);
            setIsSubmitting(false);
        }
    };

    if (authLoading || loading) return <div className="loading-screen">Loading...</div>;
    if (!cartData) return null;

    const totalAmount = cartData.totalFoodPrice + cartData.deliveryCost;

    // 현재 선택된 주소 객체 찾기
    const selectedAddress = addresses.find(a => a.addressId == selectedAddressId);

    return (
        <div className="user-order-container">
            {/* 배달 주소 섹션 */}
            <section className="delivery-address-section">
                <div className="address-header-styled">
                    <div className="icon-wrapper">
                        <HiLocationMarker className="location-icon" />
                    </div>
                    <div className="text-wrapper">
                        <div className="main-row">
                            <span className="address-name">
                                {selectedAddress?.addressName || '주소 선택'}
                            </span>
                            <span className="suffix-text"> 로 배달</span>
                        </div>
                        <div className="sub-row">
                            <span className="address-detail-text">
                                {selectedAddress?.addressDetail || '상세주소를 선택해주세요'}
                            </span>
                        </div>
                    </div>
                </div>

                {addresses.length > 0 && (
                    <div className="address-select-wrapper">
                        <select
                            className="address-select"
                            value={selectedAddressId}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                        >
                            {addresses.map(addr => (
                                <option key={addr.addressId} value={addr.addressId}>
                                    {addr.addressName} - {addr.addressDetail}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </section>

            {/* 가게명 섹션 */}
            <section className="store-name-section">
                <div className="store-name">{cartData.storeName}</div>
            </section>

            {/* 메뉴 아이템들 */}
            <section className="menu-items-section">
                {cartData.items.map(item => (
                    <div key={item.cartItemId} className="menu-item">
                        <div className="menu-item-name">{item.menuName}</div>
                        <div className="menu-item-footer">
                            <div className="quantity-display">
                                <span className="qty-label">수량:</span>
                                <span className="qty-value">{item.cartItemQuantity}개</span>
                            </div>
                            <div className="menu-item-price">
                                {item.totalItemPrice.toLocaleString()}원
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* 배달비 섹션 */}
            <section className="delivery-fee-section">
                <div className="fee-row">
                    <div className="fee-label">배달비</div>
                    <div className="fee-amount">
                        {cartData.deliveryCost.toLocaleString()}원
                    </div>
                </div>
            </section>

            {/* 요청 사항 섹션 */}
            <section className="requests-section">
                <div className="request-group">
                    <label className="request-label">가게 사장님께</label>
                    <input
                        type="text"
                        className="request-input"
                        placeholder="예: 맵지 않게 해주세요."
                        value={storeRequest}
                        onChange={(e) => setStoreRequest(e.target.value)}
                    />
                </div>

                <div className="request-group">
                    <label className="request-label">배달 기사님께</label>
                    <input
                        type="text"
                        className="request-input"
                        placeholder="예: 문 앞에 두고 가주세요."
                        value={riderRequest}
                        onChange={(e) => setRiderRequest(e.target.value)}
                    />
                </div>
            </section>

            {/* 결제 수단 섹션 */}
            <section className="payment-method-section">
                <h3 className="section-label">결제 수단</h3>
                <div className="payment-options">
                    <button
                        className={`payment-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('CARD')}
                    >
                        카드 결제
                    </button>
                    <button
                        className={`payment-btn ${paymentMethod === 'CASH' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('CASH')}
                    >
                        현장 결제
                    </button>
                </div>
            </section>

            {/* 결제 금액 섹션 */}
            <section className="payment-summary-section">
                <div className="summary-row">
                    <span className="summary-label">주문금액</span>
                    <span className="summary-value">
                        {cartData.totalFoodPrice.toLocaleString()}원
                    </span>
                </div>
                <div className="summary-row">
                    <span className="summary-label">배달비</span>
                    <span className="summary-value">
                        {cartData.deliveryCost.toLocaleString()}원
                    </span>
                </div>
                <div className="summary-divider"></div>
                <div className="total-row">
                    <span className="total-label">총 결제금액</span>
                    <span className="total-amount">
                        {totalAmount.toLocaleString()}원
                    </span>
                </div>
            </section>

            {/* 결제 버튼 */}
            <section className="checkout-button-section">
                <button
                    className="checkout-btn"
                    onClick={handleCreateOrderClick} // [변경] 핸들러 변경
                    disabled={isSubmitting || !selectedAddressId}
                >
                    {isSubmitting ? '처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
                </button>
            </section>

            {/* [추가] 주문 확인 모달 */}
            <Modal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                title="주문 확인"
                footer={
                    <>
                        <button 
                            className="modal-btn-cancel"
                            onClick={() => setIsOrderModalOpen(false)}
                            style={{ 
                                padding: '10px 16px', 
                                border: '1px solid #ddd', 
                                borderRadius: '6px', 
                                background: '#fff',
                                cursor: 'pointer',
                                color: '#666',
                                fontWeight: '600'
                            }}
                        >
                            취소
                        </button>
                        <button 
                            className="modal-btn-confirm"
                            onClick={processOrder}
                            style={{ 
                                padding: '10px 16px', 
                                border: 'none', 
                                borderRadius: '6px', 
                                background: '#21808d', 
                                color: '#fff', 
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            결제하기
                        </button>
                    </>
                }
            >
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <p style={{ marginBottom: '8px', fontSize: '16px' }}>총 결제금액 <strong>{totalAmount.toLocaleString()}원</strong></p>
                    <p style={{ color: '#666' }}>주문을 진행하시겠습니까?</p>
                </div>
            </Modal>
        </div>
    );
};

export default UserOrder;