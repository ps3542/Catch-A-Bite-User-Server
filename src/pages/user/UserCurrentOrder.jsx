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

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Fetch data using the service
                const response = await appUserStoreOrderService.getOrderDetails(orderId);
                
                console.log("UserCurrentOrder");
                console.log(response);
                // Check if response has 'data' property or is the data itself
                // Adjust this based on your API's standard response wrapper
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

    // Helper to determine active step
    // Backend Statuses assumed: PAYMENTCONFIRMED, ORDER_ACCEPTED, PREPARING, DELIVERING, DELIVERY_COMPLETED
    const getStepStatus = (currentStatus) => {
        const steps = ['Pending', 'Cooking','Cooked', "Delivering","Delivered"];
        const labels = ['접수대기', '조리중','조리완료', '배달중', '배달완료'];
        
        let currentIndex = steps.indexOf(currentStatus);
        
        // Handle initial state: PAYMENTCONFIRMED means the order is placed but not yet accepted
        // We set index 0 ('수락') as 'current' (waiting) or 'active' depending on preference.
        // Here we treat it as the start of the '수락' phase.
        if (currentIndex === -1) {
            if (currentStatus === 'PAYMENTCONFIRMED' || currentStatus === 'ORDER_RECEIVED') {
                currentIndex = 0; 
            } else {
                currentIndex = 0; // Default fallback
            }
        }

        return labels.map((label, index) => ({
            label,
            // Active means this step has been passed or is in progress
            active: index <= currentIndex,
            // Current means this is the exact step we are on
            current: index === currentIndex
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
                            {/* Line connector logic */}
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
                    {/* Fixed: using orderAddressSnapshot */}
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
                            {/* Fixed: orderTotalPrice - orderDeliveryFee */}
                            <span>{(order.orderTotalPrice - order.orderDeliveryFee).toLocaleString()}원</span>
                        </div>
                        <div className="price-row">
                            <span>배달팁</span>
                            {/* Fixed: orderDeliveryFee */}
                            <span>{order.orderDeliveryFee.toLocaleString()}원</span>
                        </div>
                        <div className="divider"></div>
                        <div className="price-row total">
                            <span>총 결제 금액</span>
                            {/* Fixed: orderTotalPrice */}
                            <span className="total-price">{order.orderTotalPrice.toLocaleString()}원</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default UserCurrentOrder;