import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import hook điều hướng
import "./orders.css";
import { getMyOrders } from "../../services/apiService";
import { Order, OrderStatus } from "../../types/type"; // Import từ type chung
import { formatCurrency } from "../../utils/formatData";
interface OrdersProps {
  selected?: string;
  setSelected?: React.Dispatch<React.SetStateAction<string>>;
}

// Danh sách các tab trạng thái dựa trên Enum
const TABS = [
  { label: "Pending", value: OrderStatus.PENDING },
  { label: "Confirmed", value: OrderStatus.CONFIRMED },
  { label: "Processing", value: OrderStatus.PROCESSING },
  { label: "Shipping", value: OrderStatus.SHIPPING },
  { label: "Delivered", value: OrderStatus.DELIVERED },
  { label: "Cancelled", value: OrderStatus.CANCELLED },
  { label: "Refunded", value: OrderStatus.REFUNDED },
];

const Orders: React.FC<OrdersProps> = ({ selected, setSelected }) => {
  const navigate = useNavigate(); // Hook để chuyển trang

  // State quản lý tab hiện tại, mặc định là PENDING
  const [activeTab, setActiveTab] = useState<OrderStatus>(OrderStatus.PENDING);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5, // Load 5 đơn mỗi trang cho gọn
    total: 0,
    totalPages: 0,
  });

  // Gọi API mỗi khi activeTab hoặc page thay đổi
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getMyOrders({
          page: pagination.page,
          limit: pagination.limit,
          orderStatus: activeTab, // Truyền status từ tab hiện tại
        });

        console.log(response);
        console.log('first oder createdAt: ', response.data[0]?.createdAt);
        console.log('Type of createdAt:', typeof response.data[0]?.createdAt);
        // Cập nhật danh sách đơn hàng
        setOrders(response.data || []);

        // Cập nhật thông tin phân trang
        setPagination((prev) => ({
          ...prev,
          total: response.total,
          totalPages: Math.ceil(response.total / prev.limit),
        }));
      } catch (err: any) {
        console.error("Failed to fetch orders:", err);
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, pagination.page]);

  // Reset trang về 1 khi đổi tab
  const handleTabChange = (status: OrderStatus) => {
    setActiveTab(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleViewDetail = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };


const formatDateVN = (value: string | Date) => {
  if (!value) return "--";

  let date: Date;

  // Nếu backend trả string kiểu "2026-01-11 00:41:42"
  if (typeof value === "string" && !value.includes("T")) {
    // ép thành ISO + UTC
    date = new Date(value.replace(" ", "T") + "+07:00");
  } else {
    date = new Date(value);
  }

  if (isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
};






  const formatPaymentMethod = (method: string) => {
    const methodMap: { [key: string]: string } = {
      cod: "Cash on Delivery",
      vnpay: "VNPay Wallet",
      momo: "MoMo Wallet",
      zalopay: "ZaloPay",
      bank_transfer: "Bank Transfer",
    };
    return methodMap[method] || method.toUpperCase();
  };

  
  return (
    <div className="orders-container">
      {/* --- RENDER TABS --- */}
      <div className="orders-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`orders-tab ${activeTab === tab.value ? "active" : ""}`}
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- RENDER LIST --- */}
      <div className="orders-list">
        {loading ? (
          <div className="loading-state">Loading your orders...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : orders.length > 0 ? (
          <>
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                {/* Header đơn hàng */}
                <div className="order-header">
                  <div>
                    <h3>Order #{order.orderCode}</h3>
                    <div className="order-meta">
                      <p>Date: {formatDateVN(order.createdAt)}</p>
                    </div>
                  </div>
                  <div
                    className="order-status-badge"
                    data-status={order.orderStatus}
                  >
                    {order.orderStatus.toUpperCase()}
                  </div>
                </div>

                {/* Danh sách sản phẩm trong đơn */}
                {order.items.map((item) => (
                  <div key={item.id} className="order-product">
                    <div className="product-left">
                      <img src={item.productImage} alt={item.productName} />
                      <h4>{item.productName}</h4>
                    </div>
                    <div className="product-info">
                      <div className="product-price">
                        {formatCurrency(item.subtotal)}
                      </div>
                      <div>
                        <p className="variant-text">
                          Color: {item.color} | Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Footer đơn hàng: Tổng tiền & Nút bấm */}
                <div className="order-footer">
                  <div className="total-section">
                    <span>Total Amount:</span>
                    <span className="total-price">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="payment-method">
                      ({formatPaymentMethod(order.paymentMethod)})
                    </span>
                  </div>

                  <button
                    className="btn-view-detail"
                    onClick={() => handleViewDetail(order.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}

            {/* --- PAGINATION CONTROLS --- */}
            {pagination.totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No orders found in "{activeTab}" tab.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
