// Project Name: catchabite
// File Name: src/pages/user/UserReview.jsx

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { appUserStoreOrderService } from "../../api/appuser/StoreOrderService";
import { appUserReviewService } from "../../api/appuser/ReviewService";
import Modal from "../../components/common/Modal"; 
import "./UserReview.css";

export default function UserReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);
  const [rating, setRating] = useState(5); // 기본값 5점
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [existingReviewId, setExistingReviewId] = useState(null);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    children: null,
    footer: null,
  });

  useEffect(() => {
    if (!orderId) {
      openAlertModal("오류", "잘못된 접근입니다.", () => navigate(-1));
      return;
    }

    const fetchOrderAndReview = async () => {
      try {
        setLoading(true);
        // 주문 정보 조회
        const orderData = await appUserStoreOrderService.getOrderDetails(Number(orderId));
        console.log("orderData");
        console.log(orderData);
        
        setOrderInfo(orderData);

        // 이미 작성된 리뷰가 있는지 확인
        if (orderData.reviewId && orderData.reviewId > 0) {
          setExistingReviewId(orderData.reviewId);
          const reviewResponse = await appUserReviewService.getReview(orderData.reviewId);
          console.log("reviewResponse");
          console.log(reviewResponse);

          // ApiResponse 처리 (response.data 또는 response 자체)
          const reviewData = reviewResponse.data || reviewResponse; 
          console.log("reviewData");
          console.log(reviewData);
          if (reviewData) {
            setRating(Number(reviewData.reviewRating)); 
            setContent(reviewData.reviewContent || ""); 
          }
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        // [중요] 에러 발생 시 뒤로가기 처리를 확실히 하기 위해 모달 확인 버튼에 네비게이션 연결
        openAlertModal("오류", "정보를 불러올 수 없습니다.", () => navigate(-1));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndReview();
  }, [orderId, navigate]);

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const openAlertModal = (title, message, onConfirm = null) => {
    setModalConfig({
      isOpen: true,
      title: title,
      children: message,
      footer: (
        <button
          onClick={() => {
            closeModal();
            if (onConfirm) onConfirm();
          }}
          style={modalBtnStyle.confirm}
        >
          확인
        </button>
      ),
    });
  };

  const handlePreSubmit = () => {
    if (!content.trim()) {
      openAlertModal("알림", "리뷰 내용을 입력해주세요.");
      return;
    }

    const actionText = existingReviewId ? "수정" : "등록";

    setModalConfig({
      isOpen: true,
      title: `리뷰 ${actionText}`,
      children: `리뷰를 ${actionText}하시겠습니까?`,
      footer: (
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={closeModal} style={modalBtnStyle.cancel}>
            취소
          </button>
          <button onClick={executeReviewSubmission} style={modalBtnStyle.confirm}>
            {actionText}하기
          </button>
        </div>
      ),
    });
  };

  const executeReviewSubmission = async () => {
    closeModal();

    try {
      setIsSubmitting(true);

      if (existingReviewId) {
        // [PUT] 리뷰 수정
        const updateData = {
          reviewRating: rating, 
          reviewContent: content
        };
        await appUserReviewService.updateReview(existingReviewId, updateData);
        
        openAlertModal("수정 완료", "리뷰가 성공적으로 수정되었습니다!", () => {
          navigate("/user/orderhistory");
        });

      } else {
        // [POST] 리뷰 등록
        await appUserReviewService.createReview(Number(orderId), rating, content);
        
        openAlertModal("등록 완료", "리뷰가 성공적으로 등록되었습니다!", () => {
          navigate("/user/orderhistory");
        });
      }

    } catch (error) {
      console.error("리뷰 처리 실패:", error);
      const actionText = existingReviewId ? "수정" : "등록";
      openAlertModal("오류", `리뷰 ${actionText} 중 오류가 발생했습니다.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatOrderItems = (items) => {
    if (!items || items.length === 0) return "주문 내역 없음";
    return items.map((item) => `${item.orderItemName} x ${item.orderItemQuantity}`).join(", ");
  };

  // 1. 로딩 중 화면
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // [수정] 2. 데이터 로드 실패(null) 시 안전 장치 추가 (이 부분이 없어서 크래시 발생)
  if (!orderInfo) {
    return <div className="loading-screen">데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
    <div className="review-page-wrapper">
      <div className="review-card">
        <div className="review-header">
          <h2 className="header-title">
            {existingReviewId ? "리뷰 수정" : "리뷰 쓰기"}
          </h2>
          <p className="header-subtitle">
            {existingReviewId ? "작성하신 내용을 수정할 수 있습니다" : "소중한 의견을 들려주세요"}
          </p>
        </div>

        <div className="review-body">
          <div className="store-info-section">
            <h3 className="store-name">
              {orderInfo.storeName || "가게 이름 없음"}
            </h3>
            <p className="order-items-text">
              {formatOrderItems(orderInfo.orderItems)}
            </p>
          </div>

          <div className="rating-section">
            <p className="rating-label">음식은 어떠셨나요?</p>
            <div className="star-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`star-btn ${star <= rating ? "filled" : "empty"}`}
                  aria-label={`${star}점`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="rating-score">{rating}점</p>
          </div>

          <div className="input-section">
            <label className="input-label">리뷰 내용</label>
            <textarea
              className="review-textarea"
              placeholder="음식의 맛, 양, 포장 상태 등 솔직한 후기를 남겨주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <button
            onClick={handlePreSubmit}
            disabled={isSubmitting}
            className={`action-btn submit-btn ${isSubmitting ? "disabled" : ""}`}
          >
            {isSubmitting 
              ? "처리 중..." 
              : (existingReviewId ? "리뷰 수정하기" : "리뷰 등록하기")}
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="action-btn cancel-btn"
            disabled={isSubmitting}
          >
            취소
          </button>
        </div>
        
        <div className="reply-placeholder-section">
          <div className="reply-placeholder-box">
            <span className="placeholder-title">사장님 답글 영역</span>
            <span className="placeholder-desc">
              (리뷰 등록 후 사장님이 답글을 남길 수 있습니다)
            </span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        footer={modalConfig.footer}
      >
        {modalConfig.children}
      </Modal>
    </div>
  );
}

const modalBtnStyle = {
  confirm: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  cancel: {
    padding: "8px 16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#f5f5f5",
    color: "#333",
    fontWeight: "bold",
    cursor: "pointer",
  },
};