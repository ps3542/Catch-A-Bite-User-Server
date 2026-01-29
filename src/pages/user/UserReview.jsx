// Project Name: catchabite
// File Name: src/pages/user/UserReview.jsx

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { appUserStoreOrderService } from "../../api/appuser/StoreOrderService";
import { appUserReviewService } from "../../api/appuser/ReviewService";
import "./UserReview.css"; // Vanilla CSS import

export default function UserReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);
  const [rating, setRating] = useState(5); // 기본 5점
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 주문 정보 로드
  useEffect(() => {
    if (!orderId) {
      alert("잘못된 접근입니다.");
      navigate(-1);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await appUserStoreOrderService.getOrderDetails(Number(orderId));
        setOrderInfo(data);
      } catch (error) {
        console.error("주문 정보 로드 실패:", error);
        alert("주문 정보를 불러올 수 없습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    if (!window.confirm("리뷰를 등록하시겠습니까?")) return;

    try {
      setIsSubmitting(true);
      await appUserReviewService.createReview(Number(orderId), rating, content);
      alert("리뷰가 등록되었습니다!");
      navigate("/user/order-history");
    } catch (error) {
      console.error("리뷰 등록 실패:", error);
      alert("리뷰 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatOrderItems = (items) => {
    if (!items || items.length === 0) return "주문 내역 없음";
    return items.map(item => `${item.menuName} x ${item.quantity}`).join(", ");
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="review-page-wrapper">
      <div className="review-card">
        
        {/* Header Section */}
        <div className="review-header">
          <h2 className="header-title">리뷰 쓰기</h2>
          <p className="header-subtitle">소중한 의견을 들려주세요</p>
        </div>

        <div className="review-body">
          
          {/* 1. Store Name & Ordered Items */}
          <div className="store-info-section">
            <h3 className="store-name">
              {orderInfo?.storeName || "가게 이름 없음"}
            </h3>
            <p className="order-items-text">
              {formatOrderItems(orderInfo?.orderItems)}
            </p>
          </div>

          {/* 2. Star Rating (Interactive) */}
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

          {/* 3. Review Content Input */}
          <div className="input-section">
            <label className="input-label">리뷰 내용</label>
            <textarea
              className="review-textarea"
              placeholder="음식의 맛, 양, 포장 상태 등 솔직한 후기를 남겨주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 4. Action Buttons */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`action-btn submit-btn ${isSubmitting ? "disabled" : ""}`}
          >
            {isSubmitting ? "등록 중..." : "리뷰 등록하기"}
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="action-btn cancel-btn"
            disabled={isSubmitting}
          >
            취소
          </button>

        </div>

        {/* 5. Placeholder for Store Owner's Reply */}
        <div className="reply-placeholder-section">
          <div className="reply-placeholder-box">
            <span className="placeholder-title">사장님 답글 영역</span>
            <span className="placeholder-desc">(리뷰 등록 후 사장님이 답글을 남길 수 있습니다)</span>
          </div>
        </div>

      </div>
    </div>
  );
}