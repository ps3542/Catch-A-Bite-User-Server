import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appUserStoreOrderService } from '../../api/appuser/StoreOrderService';
import './UserCurrentOrder.css';

const UserCurrentOrder = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* ---------------------------------------------------------
     * 함수의 목적: URL 파라미터로 전달받은 orderId를 사용하여 주문 상세 정보를 서버에서 조회합니다.
     * API 호출 구조: appUserStoreOrderService.getOrderDetails(orderId)
     * 사용 문맥: 컴포넌트가 마운트되거나 orderId가 변경될 때 실행되며, 성공 시 
     * 응답 데이터를 order 상태에 저장하여 화면에 주문 내역과 진행 상태를 표시합니다.
     * --------------------------------------------------------- */
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await appUserStoreOrderService.getOrderDetails(orderId);
                console.log("UserCurrentOrder response:", response);
                
                const data = response; 
                setOrder(data);
            } catch (err) {
                console.error("Failed to fetch order:", err);
                setError("Failed to load order details.");
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    if (loading) return <div className="loading-screen">Loading order details...</div>;
    if (error) return <div className="error-screen">{error}</div>;
    if (!order) return <div className="error-screen">Order not found.</div>;

    /* ---------------------------------------------------------
     * 함수의 목적: 백엔드에서 받은 주문 상태(OrderStatus)를 UI의 5단계 진행 바 형식에 맞게 변환합니다.
     * 사용 문맥: 주문 현황 상단의 status-tracker 섹션에서 각 단계의 활성화(active) 
     * 및 현재 위치(current)를 결정하여 사용자에게 실시간 진행 상황을 시각적으로 전달합니다.
     * --------------------------------------------------------- */
    const getStepStatus = (currentStatus) => {
        const labels = ['접수대기', '조리중', '조리완료', '배달중', '배달완료'];
        
        let currentIndex = 0;
        const status = currentStatus ? currentStatus.toUpperCase() : '';

        // 백엔드 Enum 상태값에 따른 인덱스 매핑
        switch (status) {
            case 'PAYMENTCONFIRMED':
            case 'PENDING':
                currentIndex = 0;
                break;
            case 'COOKING':
                currentIndex = 1;
                break;
            case 'COOKED':
                currentIndex = 2;
                break;
            case 'DELIVERING':
                currentIndex = 3;
                break;
            case 'DELIVERED':
                currentIndex = 4;
                break;
            default:
                currentIndex = 0; 
                break;
        }

        return labels.map((label, index) => ({
            label,
            active: index <= currentIndex, // 현재 단계 및 이전 단계는 체크 표시 및 강조
            current: index === currentIndex // 현재 진행 중인 특정 단계 강조
        }));
    };

    const steps = getStepStatus(order.orderStatus);

    return (
        <div className="current-order-container">
            <section className="status-tracker">
                <div className="status-steps">
                    {steps.map((step, index) => (
                        <div key={index} className={`step ${step.active ? 'active' : ''} ${step.current ? 'current' : ''}`}>
                            <div className="step-circle">
                                {step.active && "✓"}
                            </div>
                            <span className="step-label">{step.label}</span>
                            {index < steps.length - 1 && (
                                <div className={`step-line ${steps[index + 1].active ? 'active' : ''}`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <div className="content-scroll">
                <section className="info-card address-card">
                    <h3>배달 주소</h3>
                    <p className="address-text">{order.orderAddressSnapshot}</p>
                </section>

                <section className="info-card order-summary-card">
                    <h3>주문 내역</h3>
                    <div className="store-name">{order.storeName}</div>
                    
                    <ul className="order-items">
                        {order.orderItems?.map((item, idx) => (
                            <li key={idx} className="order-item">
                                <span className="item-name">
                                    {item.orderItemName} x {item.orderItemQuantity}
                                </span>
                                <span className="item-price">
                                    {item.orderItemPrice.toLocaleString()}원
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="price-breakdown">
                        <div className="price-row">
                            <span>주문 금액</span>
                            <span>{(order.orderTotalPrice - order.orderDeliveryFee).toLocaleString()}원</span>
                        </div>
                        <div className="price-row">
                            <span>배달팁</span>
                            <span>{order.orderDeliveryFee.toLocaleString()}원</span>
                        </div>
                        <div className="divider"></div>
                        <div className="price-row total">
                            <span>총 결제 금액</span>
                            <span className="total-price">{order.orderTotalPrice.toLocaleString()}원</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default UserCurrentOrder;