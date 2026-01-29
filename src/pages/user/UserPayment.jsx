import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { appUserStoreOrderService } from '../../api/appuser/StoreOrderService';
import './UserPayment.css';

const UserPayment = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // State
    const [orderId, setOrderId] = useState('');
    const [currentOrder, setCurrentOrder] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [portOneConfig, setPortOneConfig] = useState({ storeId: null, channelKey: null });

    // UI State
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Loading...');
    const [result, setResult] = useState(null);

    /*
    ========================================================================================
    [1. 초기화 및 설정 로드]
    - PortOne SDK 로드
    - 백엔드 결제 설정(Store ID, Channel Key) 로드
    ========================================================================================
    */
    useEffect(() => {
        loadPortOneSDK();
        loadConfig();
        checkUrlParams();
    }, []);

    const loadPortOneSDK = () => {
        if (!window.PortOne) {
            console.log("=== [Init] Loading PortOne SDK... ===");
            const script = document.createElement("script");
            script.src = "https://cdn.portone.io/v2/browser-sdk.js";
            script.async = true;
            document.body.appendChild(script);
        }
    };

    const loadConfig = async () => {
        try {
            console.log("=== [Config] Fetching PortOne Config... ===");
            const response = await axiosInstance.get('/api/v1/config/portone');
            
            console.log("=== [Config] Response ===", response);
            console.log("=== [Config] Data ===", response.data);

            const config = response.data.data || response.data;
            setPortOneConfig({
                storeId: config.storeId || config['store-id'],
                channelKey: config.channelKey || config['channel-key']
            });
        } catch (error) {
            console.error("Config Load Error:", error);
            showResult('error', '결제 설정을 불러오지 못했습니다.');
        }
    };

    /*
    ========================================================================================
    [2. URL 파라미터 처리]
    - 일반 진입 및 모바일 리다이렉트 복귀 처리
    ========================================================================================
    */
    const checkUrlParams = async () => {
        const orderIdParam = searchParams.get('orderId');
        const paymentId = searchParams.get('paymentId');
        const merchantUid = searchParams.get('merchant_uid');
        const code = searchParams.get('code');
        const message = searchParams.get('message');

        console.log("=== https://www.merriam-webster.com/dictionary/check Params Detected ===", { 
            orderId: orderIdParam, 
            paymentId, 
            merchantUid, 
            code, 
            message 
        });

        if (paymentId && merchantUid) {
            // 모바일 결제 복귀 시나리오
            const originalOrderId = merchantUid.split('_')[1];
            if (originalOrderId) {
                setOrderId(originalOrderId);
                await fetchOrderData(originalOrderId, false); 
            }

            if (code != null) {
                console.log("=== https://www.merriam-webster.com/dictionary/check Mobile Payment Failed ===");
                showResult('error', `결제 실패: ${message} (Code: ${code})`, null, originalOrderId);
            } else {
                console.log("=== https://www.merriam-webster.com/dictionary/check Mobile Payment Success -> Verifying ===");
                await completePayment(paymentId, merchantUid);
            }
        } else if (orderIdParam) {
            // 초기 진입 시나리오
            setOrderId(orderIdParam);
            fetchOrderData(orderIdParam);
        }
    };

    const fetchOrderData = async (id, shouldResetResult = true) => {
        if (!id) return;
        setLoading(true);
        setLoadingText("주문 정보를 불러오는 중...");
        if (shouldResetResult) setResult(null);

        try {
            console.log(`=== [Fetch Order] Fetching Order ID: ${id}... ===`);
            // StoreOrderService 사용
            const orderData = await appUserStoreOrderService.getOrderDetails(id);
            
            console.log("=== [Fetch Order] Data ===", orderData);
            setCurrentOrder(orderData);

            if (orderData.appUserId) {
                await fetchUserData(orderData.appUserId);
            }
        } catch (error) {
            console.error(error);
            showResult('error', `주문을 찾을 수 없습니다: ${error.message}`);
            setCurrentOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async (userId) => {
        try {
            console.log(`=== [Fetch User] Fetching User ID: ${userId}... ===`);
            const response = await axiosInstance.get(`/api/v1/appuser/${userId}`);
            console.log("=== [Fetch User] Response ===", response);
            setCurrentUser(response.data.data || response.data);
        } catch (error) {
            console.error("User fetch error:", error);
        }
    };

    /*
    ========================================================================================
    [3. 주문 상태 변경 헬퍼]
    ========================================================================================
    */
    const updateOrderStatus = async (targetId, status) => {
        if (!targetId) return;
        try {
            console.log(`=== [Update Status] Request: Order ${targetId} -> ${status} ===`);
            const response = await axiosInstance.put(`/api/v1/appuser/store-orders/${targetId}`, {
                orderStatus: status
            });
            console.log(`=== [Update Status] Response ==-`, response);
            console.log(`=== [Update Status] Updated Data ==-`, response.data);
        } catch (error) {
            console.error(`Failed to update order status to ${status}:`, error);
        }
    };

    /*
    ========================================================================================
    [4. 결제 요청 (Request Payment)]
    ========================================================================================
    */
    const requestPayment = async () => {
        if (!currentOrder || !portOneConfig.storeId) {
            alert("주문 정보나 결제 설정이 올바르지 않습니다.");
            return;
        }

        console.log("=== [Payment Request] Start ===");

        const buyerName = currentUser?.appUserName || currentOrder.userName || "구매자";
        const buyerPhone = currentUser?.appUserMobile || currentOrder.userPhone || "010-0000-0000";
        const buyerEmail = currentUser?.appUserEmail || "test@example.com"; 

        setLoading(true);
        setLoadingText("결제 준비 중...");

        try {
            // [STEP 1] 결제 시작 상태로 변경
            await updateOrderStatus(currentOrder.orderId, 'PAYMENTINPROGRESS');

            // [STEP 2] 결제 사전 준비 (API 호출)
            const prepareData = {
                order_id: currentOrder.orderId,
                payment_amount: Number(currentOrder.orderTotalPrice),
                payment_method: "CARD", 
                buyer_name: buyerName,
                buyer_email: buyerEmail,
                buyer_tel: buyerPhone,
                buyer_addr: currentOrder.orderAddressSnapshot || "",
                name: `CatchABite 주문 #${currentOrder.orderId}`
            };

            console.log("=== [Payment Request] Prepare Data (Payload) ===", prepareData);
            
            const prepareResponse = await axiosInstance.post('/api/payments/prepare', prepareData);
            
            console.log("=== [Payment Request] Prepare Response ===", prepareResponse);
            
            const preparedData = prepareResponse.data; 
            const merchantUid = preparedData.merchant_uid;

            console.log("=== [Payment Request] Generated Merchant UID ===", merchantUid);

            // [STEP 3] PortOne SDK 호출
            const paymentId = `PAY-${currentOrder.orderId}-${Date.now()}`;
            const redirectUrl = new URL(window.location.href);
            redirectUrl.searchParams.set('merchant_uid', merchantUid);

            if (!window.PortOne) {
                throw new Error("PortOne SDK not loaded");
            }

            console.log("=== [Payment Request] Calling window.PortOne.requestPayment ===");
            
            const response = await window.PortOne.requestPayment({
                storeId: portOneConfig.storeId,
                channelKey: portOneConfig.channelKey,
                paymentId: paymentId,
                orderName: prepareData.name,
                totalAmount: prepareData.payment_amount,
                currency: "CURRENCY_KRW",
                payMethod: "CARD",
                customer: {
                    fullName: buyerName,
                    phoneNumber: buyerPhone,
                    email: buyerEmail,
                },
                redirectUrl: redirectUrl.toString(),
                windowType: {
                    pc: 'IFRAME',
                    mobile: 'REDIRECTION'
                }
            });

            console.log("=== [Payment Request] PortOne SDK Response ===", response);

            // [STEP 4] PC 결제 결과 처리
            if (response.code != null) {
                // 결제 실패
                console.log("=== [Payment Request] SDK Returned Error Code ===", response.code);
                showResult('error', `결제 실패: ${response.message} (Code: ${response.code})`);
            } else {
                // 결제 성공 (검증 진행)
                console.log("=== [Payment Request] SDK Success -> Proceeding to Complete ===");
                await completePayment(response.paymentId, merchantUid);
            }

        } catch (error) {
            console.error("Payment Process Error:", error);
            showResult('error', `결제 중 오류 발생: ${error.response?.data?.message || error.message}`);
            setLoading(false);
        }
    };

    /*
    ========================================================================================
    [5. 결제 검증 및 완료 (Complete Payment)]
    ========================================================================================
    */
    const completePayment = async (paymentId, merchantUid) => {
        setLoading(true);
        setLoadingText("결제 검증 및 완료 처리 중...");

        console.log("=== [Payment Complete] Request Params ===", { paymentId, merchantUid });

        try {
            // [STEP 1] 백엔드 검증 요청
            const response = await axiosInstance.post(`/api/payments/complete`, null, {
                params: { paymentId, merchantUid }
            });

            console.log("=== [Payment Complete] Backend Response ===", response);
            console.log("=== [Payment Complete] Final Data ===", response.data);

            // [STEP 2] 성공 시 주문 상태 확정
            const targetOrderId = response.data.orderId || currentOrder?.orderId;
            if (targetOrderId) {
                await updateOrderStatus(targetOrderId, 'PAYMENTCONFIRMED');
            }

            // [STEP 3] 성공 결과 표시
            showResult('success', "결제가 성공적으로 완료되었습니다!", response.data);
            
            setTimeout(() => {
                console.log("=== [Payment Complete] Redirecting to Order History... ===");
                window.location.replace(`/user/`);
            }, 2000); 

        } catch (error) {
            console.error("Verification Failed:", error);
            const errMsg = error.response?.data?.message || "서버 통신 중 오류가 발생했습니다.";
            const errData = error.response?.data;
            
            console.log("=== [Payment Complete] Error Response Data ===", errData);
            
            showResult('error', `검증 실패: ${errMsg}`, errData);
        } finally {
            setLoading(false);
        }
    };

    /*
    ========================================================================================
    [6. 결과 처리 및 실패 시 삭제 로직 (Show Result)]
    ========================================================================================
    */
    const showResult = async (type, message, data = null, targetOrderId = null) => {
        console.log(`=== [Show Result] Type: ${type} ===`);
        console.log(`=== [Show Result] Message: ${message} ===`);
        console.log(`=== [Show Result] Data:`, data);
        
        setResult({ type, message, data });

        if (type === 'error') {
            const idToDelete = targetOrderId || orderId || (currentOrder && currentOrder.orderId);
            
            if (idToDelete) {
                try {
                    setLoadingText("결제 실패로 주문을 취소하는 중...");
                    setLoading(true);

                    // 1. 상태 REJECTED 변경
                    await updateOrderStatus(idToDelete, 'REJECTED');

                    // 2. 서비스 모듈을 통한 주문 삭제
                    console.log(`=== [Delete Order] Deleting Order ID: ${idToDelete}... ===`);
                    
                    const deleteResult = await appUserStoreOrderService.cancelOrder(idToDelete);
                    
                    console.log(`=== [Delete Order] Success Response ===`, deleteResult);
                    
                } catch (deleteError) {
                    console.error("=== [Delete Order] Failed ===", deleteError);
                } finally {
                    setLoading(false);
                }
            } else {
                console.warn("=== [Delete Order] Cannot delete: No Order ID available ===");
            }
        }
    };

    const handleReset = () => {
        setOrderId('');
        setCurrentOrder(null);
        setResult(null);
        navigate(window.location.pathname);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') fetchOrderData(orderId);
    };

    return (
        <div className="payment-page-body">
            <div className="payment-container">
                <h1>🛒 CatchABite</h1>
                <p className="payment-subtitle">PortOne V2 안전 결제</p>

                <div className="info-box">
                    <strong>테스트 정보:</strong><br />
                    Store ID 및 Channel Key는 서버 설정에서 자동으로 로드됩니다.
                </div>

                {/* Input Section */}
                <div className="form-group">
                    <label>주문 ID (Order ID)</label>
                    <input 
                        type="number" 
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="주문 ID를 입력하세요"
                        readOnly={loading || (currentOrder && result?.type === 'success')}
                    />
                </div>

                {/* Order Details Section */}
                {currentOrder && (
                    <div className="order-section">
                        <h3>주문 상세</h3>
                        <div className="order-details">
                            <div className="detail-item">
                                <div className="detail-label">구매자</div>
                                <div className="detail-value">
                                    {currentUser ? currentUser.appUserName : (currentOrder.userName || "비회원")}
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">결제 금액</div>
                                <div className="detail-value highlight">
                                    {(currentOrder.orderTotalPrice || 0).toLocaleString()}원
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                            이메일: {currentUser ? currentUser.appUserEmail : "-"}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="button-group">
                    <button 
                        className="payment-btn btn-secondary" 
                        onClick={handleReset}
                        disabled={loading}
                    >
                        초기화
                    </button>
                    <button 
                        className="payment-btn btn-primary" 
                        onClick={requestPayment} 
                        disabled={!currentOrder || loading || (result?.type === 'success')}
                    >
                        {loading ? '처리 중...' : '결제하기 (V2)'}
                    </button>
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>{loadingText}</p>
                    </div>
                )}

                {/* Result Display */}
                {result && (
                    <div className={`result-box ${result.type}`}>
                        <h3>{result.type === 'success' ? '성공' : '오류'}</h3>
                        <p>{result.message}</p>
                        {result.data && (
                            <pre>{JSON.stringify(result.data, null, 2)}</pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPayment;