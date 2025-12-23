import React from "react";
import { ChevronLeft } from "lucide-react";
import "./modal-confirm-delete.css";

interface ModalConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName?: string;
  isDeleting?: boolean;
}

const ModalConfirmDelete = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isDeleting = false,
}: ModalConfirmDeleteProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header with Back Button */}
        <div className="modal-header">
          <button
            onClick={onClose}
            className="back-button"
            disabled={isDeleting}
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <h2 className="modal-title">Delete Product</h2>

          <p className="modal-message">
            Are You Sure You Would Like To Delete{" "}
            {productName ? `"${productName}"` : "This API Token"}?
          </p>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              onClick={onClose}
              className="btn-cancel"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn-delete"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmDelete;
