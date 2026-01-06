import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import hook điều hướng
import "./orders.css";
import { getMyOrders } from "../../services/apiService";
import { Order, OrderStatus } from "../../types/type"; // Import từ type chung

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

  // Chuyển hướng đến trang chi tiết đơn hàng
  const handleViewDetail = (orderId: string) => {
    // Giả sử đường dẫn là /account/orders/:id
    navigate(`/account/orders/${orderId}`);
  };

  // Helper formats
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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
                      <p>Date: {formatDate(order.orderDate)}</p>
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
                      <div className="product-info">
                        <h4>{item.productName}</h4>
                        <p className="variant-text">
                          Color: {item.color} | Qty: {item.quantity}
                        </p>
                        <div className="product-price">
                          ${item.subtotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Footer đơn hàng: Tổng tiền & Nút bấm */}
                <div className="order-footer">
                  <div className="total-section">
                    <span>Total Amount:</span>
                    <span className="total-price">
                      ${order.totalAmount.toLocaleString()}
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
