/**
 * PaymentService: 결제 관련 기능 모듈
 * 결제 페이지와 
 */
export const paymentService = {

    /**
     * 결제 테스트 페이지로 이동합니다.
     * 주문 생성 성공 후 이 함수를 호출하세요.
     * * @param {number|string} orderId - 생성된 주문 ID (StoreOrder.orderId)
     */
    openPaymentTestPage: (orderId) => {
        // 1. 유효성 검사
        if (!orderId) {
            console.error("❌ 결제 페이지 이동 실패: 주문 ID가 없습니다.");
            alert("주문 ID가 유효하지 않아 결제 페이지로 이동할 수 없습니다.");
            return;
        }

        console.log(`💳 결제 테스트 페이지로 이동합니다. Order ID: ${orderId}`);

        // 2. static 폴더에 있는 payment_test.html로 리다이렉트
        // 쿼리 파라미터로 orderId를 전달하면 HTML 내부 JS가 이를 인식하여 자동 로드합니다.
        window.location.href = `/payment_test.html?orderId=${orderId}`;
    }
};