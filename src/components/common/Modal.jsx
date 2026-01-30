import React from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

/**
 * Modal Component
 * * @param {boolean} isOpen - 모달 표시 여부
 * @param {function} onClose - 모달 닫기(배경 클릭, 닫기 버튼) 핸들러
 * @param {string} title - 모달 상단 제목
 * @param {ReactNode} children - 모달 내부 컨텐츠
 * @param {ReactNode} footer - 하단 버튼 영역 (옵션)
 */
const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  // 모달을 body 태그 바로 아래에 렌더링 (z-index 문제 방지)
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer (Optional) */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;