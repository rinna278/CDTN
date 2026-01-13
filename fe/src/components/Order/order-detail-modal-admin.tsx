import { useEffect, useState } from "react";
import { formatCurrency } from "../../utils/formatData";
import { OrderItem, ManageOrderItem, OrderStatus } from "../../types/type";
import { updateOrderStatus } from "../../services/apiService";
import { toast } from "react-toastify";
import "./order-detail-modal-admin.css";
import { ChevronLeft } from "lucide-react";

interface ManageOrderItemWithItems extends ManageOrderItem {
  items: OrderItem[];
  rawStatus: string;
}

interface OrderDetailModalProps {
  order: ManageOrderItemWithItems | null;
  visible: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const getAvailableNextStatuses = (currentStatus: string) => {
  const statusFlow: Record<string, { label: string; value: string }[]> = {
    pending: [
      { label: "Đã xác nhận", value: "confirmed" },
      { label: "Đã hủy", value: "cancelled" },
    ],
    confirmed: [
      { label: "Đang xử lý", value: "processing" },
      { label: "Đã hủy", value: "cancelled" },
    ],
    processing: [{ label: "Đang giao hàng", value: "shipping" }],
    shipping: [{ label: "Đã giao hàng", value: "delivered" }],
    delivered: [{ label: "Yêu cầu hoàn tiền", value: "refund_requested" }],
    refund_requested: [{ label: "Hoàn tiền", value: "refunded" }],
    cancelled: [],
    refunded: [],
  };
  return statusFlow[currentStatus] || [];
};

const OrderDetailModalAdmin = ({
  order,
  visible,
  onClose,
  onUpdated,
}: OrderDetailModalProps) => {
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [createdAt, setCreatedAt] = useState(order?.date);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); // Đổi tên để rõ ràng hơn

  useEffect(() => {
    if (order) {
      setCreatedAt(order.date);
    }
  }, [order]);

  if (!visible || !order) return null;

  const handleShowConfirmPopup = () => {
    if (!newStatus) {
      toast.warning("Vui lòng chọn trạng thái mới!");
      return;
    }
    setShowConfirmPopup(true);
  };

  const handleCancelUpdate = () => {
    setShowConfirmPopup(false);
    // Không reset newStatus để user có thể chọn lại
  };

  const handleConfirmUpdate = async () => {
    try {
      setUpdating(true);
      const res = await updateOrderStatus(order.id, {
        status: newStatus as OrderStatus,
      });
      toast.success("Cập nhật trạng thái thành công!");

      if (res.createdAt) {
        setCreatedAt(res.createdAt);
      }

      setNewStatus("");
      setShowConfirmPopup(false);
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật trạng thái thất bại!");
    } finally {
      setUpdating(false);
    }
  };

  // Lấy label của trạng thái mới
  const getStatusLabel = (statusValue: string) => {
    const allStatuses = getAvailableNextStatuses(order.rawStatus);
    const found = allStatuses.find((st) => st.value === statusValue);
    return found ? found.label : statusValue;
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>

          <h2>Chi tiết đơn hàng {order.maDon}</h2>

          <div className="order-info">
            <p>
              <b>Khách hàng:</b> {order.nameCustomer}
            </p>
            <p>
              <b>Trạng thái hiện tại:</b> {order.status}
            </p>
            <p>
              <b>Ngày tạo:</b> {createdAt}
            </p>
          </div>

          <div className="order-items">
            <h3>Sản phẩm</h3>
            {order.items.length === 0 && <p>Chưa có sản phẩm</p>}
            {order.items.map((item) => (
              <div className="order-item" key={item.id}>
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="order-item-image"
                />
                <div className="item-info">
                  <p>
                    <b>{item.productName}</b>
                  </p>
                  <p>Màu: {item.color}</p>
                  <p>Giá: {formatCurrency(item.price)}</p>
                  <p>Số lượng: {item.quantity}</p>
                  <p>Tổng: {formatCurrency(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dropdown cập nhật trạng thái */}
          <div className="update-status-modal">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={updating}
            >
              <option value="">Cập nhật thành...</option>
              {getAvailableNextStatuses(order.rawStatus).map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleShowConfirmPopup}
              disabled={updating || !newStatus}
            >
              {updating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
            </button>
          </div>
        </div>
      </div>

      {/* Popup Xác Nhận */}
      {showConfirmPopup && (
        <div className="modal-overlay" onClick={handleCancelUpdate}>
          <div
            className="modal-container-confirm-delete-product"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Content */}
            <div className="modal-content">
              <h2 className="modal-title">Xác nhận cập nhật</h2>

              <p className="modal-message">
                Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng{" "}
                <strong>{order.maDon}</strong> từ{" "}
                <strong>{order.status}</strong> sang{" "}
                <strong>{getStatusLabel(newStatus)}</strong>?
              </p>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button
                  onClick={handleCancelUpdate}
                  className="btn-cancel-order"
                  disabled={updating}
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  className="btn-update-status"
                  disabled={updating}
                >
                  {updating ? "Đang cập nhật..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailModalAdmin;
