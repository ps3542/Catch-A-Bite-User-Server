import React, { useState, useEffect, useRef } from 'react'; // [필수] useRef 포함 확인
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import Modal from '../../components/common/Modal';
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

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    // 상태 추적용 Refs (페이지 이탈 시 로직 제어용)
    const isPaymentSuccess = useRef(false);   // 결제 성공 여부
    const isMobileRedirect = useRef(false);   // 모바일 결제 리다이렉트 중인지 여부
    const activeOrderId = useRef(null);       // 현재 활성 주문 ID (Clean-up에서 접근용)

    /*
    ========================================================================================
    [1. 초기화 및 Clean-up (주문 자동 삭제 로직)]
    ========================================================================================
    */
    useEffect(() => {
        loadPortOneSDK();
        loadConfig();
        checkUrlParams();

        // [Clean-up] 컴포넌트가 화면에서 사라질 때(페이지 이탈) 실행되는 함수
        return () => {
            const id = activeOrderId.current;
            
            // 1. 주문 ID가 있고
            // 2. 결제가 성공하지 않았으며
            // 3. 모바일 결제창으로 이동하는 상황이 아니라면 -> 주문 삭제
            if (id && !isPaymentSuccess.current && !isMobileRedirect.current) {
                console.log(`[Clean-up] Navigating away without payment. Deleting Order ID: ${id}`);
                // 비동기 호출 (결과를 기다리지 않음)
                appUserStoreOrderService.cancelOrder(id).catch(err => {
                    console.error("[Clean-up] Failed to delete incomplete order:", err);
                });
            }
        };
    }, []);

    // orderId 상태가 변경될 때마다 ref 업데이트 (Clean-up 함수에서 최신값 참조 위함)
    useEffect(() => {
        activeOrderId.current = orderId;
    }, [orderId]);

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
    ========================================================================================
    */
    const checkUrlParams = async () => {
        const orderIdParam = searchParams.get('orderId');
        const paymentId = searchParams.get('paymentId');
        const merchantUid = searchParams.get('merchant_uid');
        const code = searchParams.get('code');
        const message = searchParams.get('message');

        if (paymentId && merchantUid) {
            // 모바일 결제 복귀
            const originalOrderId = merchantUid.split('_')[1];
            if (originalOrderId) {
                setOrderId(originalOrderId);
                await fetchOrderData(originalOrderId, false); 
            }

            if (code != null) {
                // --------------------------------------------------------------------------------------
                // 모바일 결제 실패 시 리턴된 경우
                // 상태값(orderId)이 아직 업데이트되지 않았을 수 있으므로 originalOrderId를 직접 전달하여
                // showResult 내부에서 해당 주문을 삭제할 수 있도록 함
                // --------------------------------------------------------------------------------------
            } else {
                await completePayment(paymentId, merchantUid, originalOrderId);
            }
        } else if (orderIdParam) {
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
            const orderData = await appUserStoreOrderService.getOrderDetails(id);
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
            const response = await axiosInstance.get(`/api/v1/appuser/${userId}`);
            setCurrentUser(response.data.data || response.data);
        } catch (error) {
            console.error("User fetch error:", error);
        }
    };

    const updateOrderStatus = async (targetId, status) => {
        if (!targetId) return;
        try {
            console.log(`=== [Update Status] Request: Order ${targetId} -> ${status} ===`);
            await axiosInstance.put(`/api/v1/appuser/store-orders/${targetId}`, {
                orderStatus: status
            });
        } catch (error) {
            console.error(`Failed to update order status to ${status}:`, error);
        }
    };

    /*
    ========================================================================================
    [3. 결제 요청 (Request Payment)]
    ========================================================================================
    */
    const requestPayment = async () => {
        if (!currentOrder || !portOneConfig.storeId) {
            openModal('알림', '주문 정보나 결제 설정이 올바르지 않습니다.');
            return;
        }

        // [모바일 체크] 리다이렉트 발생 여부 확인
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
            // 모바일이면 리다이렉트가 발생하므로, Clean-up에서 삭제하지 않도록 플래그 설정
            isMobileRedirect.current = true;
        }

        const buyerName = currentUser?.appUserName || currentOrder.userName || "구매자";
        const buyerPhone = currentUser?.appUserMobile || currentOrder.userPhone || "010-0000-0000";
        const buyerEmail = currentUser?.appUserEmail || "test@example.com"; 

        setLoading(true);
        setLoadingText("결제 준비 중...");

        try {
            await updateOrderStatus(currentOrder.orderId, 'PAYMENTINPROGRESS');

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

            const prepareResponse = await axiosInstance.post('/api/payments/prepare', prepareData);
            const preparedData = prepareResponse.data; 
            const merchantUid = preparedData.merchant_uid;

            const paymentId = `PAY-${currentOrder.orderId}-${Date.now()}`;
            const redirectUrl = new URL(window.location.href);
            redirectUrl.searchParams.set('merchant_uid', merchantUid);

            if (!window.PortOne) {
                throw new Error("PortOne SDK not loaded");
            }

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

            // PC 결제 완료/취소 시 (모바일은 리다이렉트 되므로 여기 도달 안 함)
            if (response.code != null) {
                // PC에서 결제창 닫거나 실패함 -> 리다이렉트 플래그 해제
                isMobileRedirect.current = false;
                showResult('error', `결제 실패: ${response.message} (Code: ${response.code})`);
            } else {
                await completePayment(response.paymentId, merchantUid);
            }

        } catch (error) {
            console.error("Payment Process Error:", error);
            // 에러 발생 시 리다이렉트 안 함 -> 플래그 원복
            isMobileRedirect.current = false;
            showResult('error', `결제 중 오류 발생: ${error.response?.data?.message || error.message}`);
            setLoading(false);
        }
    };

    /*
    ========================================================================================
    [4. 결제 검증 및 완료 (Complete Payment)]
    ========================================================================================
    */
    const completePayment = async (paymentId, merchantUid, orderIdFromUrl = null) => {
        setLoading(true);
        setLoadingText("결제 확인 중...");

        try {
            const response = await axiosInstance.post(`/api/payments/complete`, null, {
                params: { paymentId, merchantUid }
            });

            // [중요] 결제 성공 플래그 설정 (페이지 이동 시 삭제 방지)
            isPaymentSuccess.current = true;

            // ID 찾기 로직 강화
            // 1. 응답 DTO에 있다면 최우선 (response.data.data.orderId - ApiResponse 구조 고려)
            // 2. 응답이 Entity라면 (response.data.data.storeOrder.orderId)
            // 3. URL에서 파싱한 값 (orderIdFromUrl)
            // 4. 현재 State (currentOrder.orderId)
            const responseData = response.data.data || response.data;
            const targetOrderId = responseData?.orderId 
                               || responseData?.storeOrder?.orderId 
                               || orderIdFromUrl 
                               || currentOrder?.orderId;
            // console.log("========================================");
            // console.log("CompletePayment");
            // console.log("ResponseData");
            // console.log(responseData);
            // console.log("ResponseData.data");
            // console.log(responseData.data);
            // console.log("targetOrderId");
            // console.log(targetOrderId);
            // console.log("========================================");
            
            showResult('success', "결제가 성공적으로 완료되었습니다!", targetOrderId);
            
            if (targetOrderId) {
                sessionStorage.setItem('orderId', targetOrderId);
                
                setTimeout(() => {
                    // /user/currentOrder/:orderId 로 이동
                    window.location.replace(`/user/currentOrder/${targetOrderId}`);
                }, 2000);
            } else {
                // 예외적으로 경우 메인으로
                setTimeout(() => {
                    window.location.replace('/user/');
                }, 2000);
            }

        } catch (error) {
            console.error("Verification Failed:", error);
            const errMsg = error.response?.data?.message || "서버 통신 중 오류가 발생했습니다.";
            showResult('error', `검증 실패: ${errMsg}`, error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    /*
    ========================================================================================
    [6. 결과 처리 (Show Result)]
    ========================================================================================
    */
    const showResult = async (type, message, data = null, targetOrderId = null) => {
        setResult({ type, message, data });

        if (type === 'error') {
            const idToDelete = targetOrderId || orderId || (currentOrder && currentOrder.orderId);
            
            if (idToDelete) {
                try {
                    setLoadingText("결제 실패로 주문을 취소하는 중...");
                    setLoading(true);

                    await updateOrderStatus(idToDelete, 'REJECTED');
                    await appUserStoreOrderService.cancelOrder(idToDelete);
                    console.log(`=== [Delete Order] Success ===`);
                    
                } catch (deleteError) {
                    console.error("=== [Delete Order] Failed ===", deleteError);
                } finally {
                    setLoading(false);
                    openModal('결제 취소', '결제가 실패(취소)되어 메인 화면으로 돌아갑니다.', () => {
                        window.location.replace('/user/');
                    });
                }
            } else {
                openModal('오류', '결제 오류가 발생하여 메인 화면으로 돌아갑니다.', () => {
                    window.location.replace('/user/');
                });
            }
        }
    };

    const openModal = (title, message, onConfirm = null) => {
        setModalConfig({ isOpen: true, title, message, onConfirm });
    };

    const closeModal = () => {
        const { onConfirm } = modalConfig;
        setModalConfig({ ...modalConfig, isOpen: false });
        if (onConfirm) onConfirm();
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
                <h1>CatchABite</h1>
                <p className="payment-subtitle">PortOne V2 안전 결제</p>

                <div className="info-box">
                    <strong>테스트 정보:</strong><br />
                    테스트 전용을 사용하고 있어서 Naver로 결제하면 23시에 결제가 취소됩니다.
                </div>

                {/* <div className="form-group">
                    <label>주문 ID (Order ID)</label>
                    <input 
                        type="number" 
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="주문 ID를 입력하세요"
                        readOnly={loading || (currentOrder && result?.type === 'success')}
                    />
                </div> */}

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

                <div className="button-group">
                    {/* <button 
                        className="payment-btn btn-secondary" 
                        onClick={handleReset}
                        disabled={loading}
                    >
                        초기화
                    </button> */}
                    <button 
                        className="payment-btn btn-primary" 
                        onClick={requestPayment} 
                        disabled={!currentOrder || loading || (result?.type === 'success')}
                    >
                        {loading ? '처리 중...' : '결제하기'}
                    </button>
                </div>

                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>{loadingText}</p>
                    </div>
                )}

                {result && (
                    <div className={`result-box ${result.type}`}>
                        <h3>{result.type === 'success' ? '성공' : '오류'}</h3>
                        <p>{result.message}</p>
                        {result.data && (
                            <pre>{JSON.stringify(result.data, null, 2)}</pre>
                        )}
                    </div>
                )}
                {/* [변경] 내부 구현 모달 제거 -> 공통 Modal 컴포넌트 사용 
                  footer prop을 사용하여 확인 버튼 커스터마이징
                */}
                <Modal
                    isOpen={modalConfig.isOpen}
                    onClose={closeModal}
                    title={modalConfig.title}
                    footer={
                        <button 
                            onClick={closeModal}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                background: '#21808d',
                                color: '#fff',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            확인
                        </button>
                    }
                >
                    {modalConfig.message}
                </Modal>
            </div>
        </div>
    );
};

export default UserPayment;