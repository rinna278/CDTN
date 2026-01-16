// File: components/DeleteConfirmModal/DeleteConfirmModal.tsx
import React from "react";
import "./popup-delete-cart_item.css";

interface PopUpDeleteCartItemProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  productImage?: string;
  loading?: boolean;
}

const PopUpDeleteCartItem: React.FC<PopUpDeleteCartItemProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  productImage,
  loading = false,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div className="delete-confirm-overlay" onClick={handleOverlayClick}>
      <div className="delete-confirm-modal">
        <div className="delete-confirm-header">
          <div className="delete-icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="delete-icon"
            >
              <path
                fill="#FC2B76"
                d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"
              />
            </svg>
          </div>
          <h2>Xác nhận xóa sản phẩm</h2>
        </div>

        <div className="delete-confirm-body">
          {productImage && (
            <div className="product-preview">
              <img
                src={productImage}
                alt={productName}
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/80";
                }}
              />
            </div>
          )}
          <p className="delete-message">
            Bạn có chắc chắn muốn xóa sản phẩm
            <span className="product-name"> "{productName}" </span>
            khỏi giỏ hàng?
          </p>
          <p className="delete-warning">Hành động này không thể hoàn tác!</p>
        </div>

        <div className="delete-confirm-actions">
          <button
            className="btn-cancel-delete"
            onClick={onClose}
            disabled={loading}
          >
            Hủy bỏ
          </button>
          <button
            className="btn-confirm-delete"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang xóa...
              </>
            ) : (
              "Xác nhận xóa"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUpDeleteCartItem;
