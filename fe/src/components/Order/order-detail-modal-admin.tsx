import { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/formatData";
import { OrderItem, ManageOrderItem } from "../../types/type";
import "./order-detail-modal-admin.css";

// Mở rộng ManageOrderItem để có items
interface ManageOrderItemWithItems extends ManageOrderItem {
  items: OrderItem[];
}

interface OrderDetailModalProps {
  order: ManageOrderItemWithItems | null;
  visible: boolean;
  onClose: () => void;
}

const OrderDetailModalAdmin = ({
  order,
  visible,
  onClose,
}: OrderDetailModalProps) => {
  if (!visible || !order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* nút đóng */}
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>Chi tiết đơn hàng {order.maDon}</h2>

        {/* Thông tin đơn hàng */}
        <div className="order-info">
          <p>
            <b>Khách hàng:</b> {order.nameCustomer}
          </p>
          <p>
            <b>Tổng tiền:</b> {formatCurrency(Number(order.totalPrice))}
          </p>
          <p>
            <b>Trạng thái:</b> {order.status}
          </p>
          <p>
            <b>Ngày tạo:</b> {new Date(order.date).toLocaleString("vi-VN")}
          </p>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="order-items">
          <h3>Sản phẩm</h3>
          {order.items.length === 0 && <p>Chưa có sản phẩm</p>}
          {order.items.map((item: OrderItem) => (
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
      </div>
    </div>
  );
};

export default OrderDetailModalAdmin;
