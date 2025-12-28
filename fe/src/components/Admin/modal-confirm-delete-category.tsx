import { AlertTriangle, X } from "lucide-react";
import "./modal-confirm-delete-category.css";

interface ModalConfirmDeleteCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName?: string;
  isDeleting?: boolean;
}

const ModalConfirmDeleteCategory = ({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  isDeleting = false,
}: ModalConfirmDeleteCategoryProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-delete" onClick={onClose}>
      <div
        className="modal-content-delete-category"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn-delete" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-icon-delete">
          <AlertTriangle size={48} />
        </div>

        <div className="modal-text-delete">
          <h2>Xác Nhận Xóa Danh Mục</h2>
          <p>
            Bạn có chắc chắn muốn xóa danh mục <strong>"{categoryName}"</strong>{" "}
            không?
          </p>
          <p className="warning-text">⚠️ Hành động này không thể hoàn tác!</p>
        </div>

        <div className="modal-actions-delete">
          <button
            className="btn-cancel-delete"
            onClick={onClose}
            disabled={isDeleting}
          >
            Hủy bỏ
          </button>
          <button
            className="btn-confirm-delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner"></span>
                Đang xóa...
              </>
            ) : (
              "Xóa Danh Mục"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmDeleteCategory;
