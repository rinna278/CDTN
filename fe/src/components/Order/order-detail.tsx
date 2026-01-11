import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrderById, cancelOrder } from "../../services/apiService";
import { toast } from "react-toastify";
import "./order-detail.css";

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      const res = await getOrderById(orderId);
      setOrder(res.data ?? res);
    };

    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;

    if (!cancelReason.trim()) {
      toast.warning("Vui lòng nhập lý do hủy đơn");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      setLoading(true);

      await cancelOrder(order.id, {
        reason: cancelReason,
      });

      toast.success("Hủy đơn hàng thành công");
      navigate("/profile?tab=orders");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <div>Loading...</div>;

  const btnCancel = order.orderStatus === "pending";

  return (
    <div className="order-detail">
      <h2>Chi tiết đơn hàng {order.orderCode}</h2>

      <div className="order-layout">
        {/* ===== LEFT ===== */}
        <div className="order-left">
          <div className="order-info">
            <p>
              <b>Người nhận:</b> {order.recipientName}
            </p>
            <p>
              <b>SĐT:</b> {order.phoneNumber}
            </p>
            <p>
              <b>Địa chỉ:</b> {order.street}, {order.ward}, {order.district},{" "}
              {order.city}
            </p>
            <p>
              <b>Trạng thái:</b>
              <span className="status-order-detail"> {order.orderStatus}</span>
            </p>
          </div>

          <div className="order-items">
            <h3>Sản phẩm trong đơn</h3>

            {order.items.map((item: any) => (
              <div className="order-item" key={item.id}>
                <img src={item.productImage} alt={item.productName} />

                <div className="item-info">
                  <p>
                    <b>{item.productName}</b>
                  </p>
                  <p>Màu: {item.color}</p>
                  <p>Giá: {Number(item.price).toLocaleString()}đ</p>
                  <p>Số lượng: {item.quantity}</p>
                  <p>Tổng giá: {Number(item.subtotal).toLocaleString()}đ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== RIGHT ===== */}
        <div className="order-right">
          <div className="process-shipment">
            Quá trình vận chuyển
            <div>
              {order.orderStatus === "processing" ||
              order.orderStatus === "shipping" ||
              order.orderStatus === "confirmed" ||
              order.orderStatus === "delivered" ||
              order.orderStatus === "refunded" ? (
                <p>
                  Cảm ơn bạn đã sử dụng dịch vụ, mong bạn sẽ mua hàng lần tới
                </p>
              ) : (
                <></>
              )}
              <ul>
                {order.orderStatus === "refunded" ? (
                  <li>Đã hoàn tiền, vui lòng xác nhận lại</li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "refunded" ? (
                  <li>
                    Đã nhận hàng hoàn trả, chúng tôi sẽ gửi lại khoản tiền của
                    bạn
                  </li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "refunded" ? (
                  <li>Đã xử lý, bạn vui lòng hoàn hàng qua bưu điện</li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "refunded" ? (
                  <li>Đang xem xét đơn hoàn tiền</li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "processing" ||
                order.orderStatus === "shipping" ||
                order.orderStatus === "confirmed" ||
                order.orderStatus === "delivered" ||
                order.orderStatus === "refunded" ? (
                  <li>Đã giao</li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "processing" ||
                order.orderStatus === "shipping" ||
                order.orderStatus === "confirmed" ||
                order.orderStatus === "delivered" ||
                order.orderStatus === "refunded" ? (
                  <li>Đang vận chuyển</li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "processing" ||
                order.orderStatus === "shipping" ||
                order.orderStatus === "confirmed" ||
                order.orderStatus === "delivered" ||
                order.orderStatus === "refunded" ? (
                  <li>Đơn hàng sẽ sớm được giao, vui lòng chú ý điện thoại</li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "processing" ||
                order.orderStatus === "shipping" ||
                order.orderStatus === "confirmed" ||
                order.orderStatus === "delivered" ||
                order.orderStatus === "refunded" ? (
                  <li>Đơn hàng đã đến trạm giao gần khu vực của bạn</li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "processing" ||
                order.orderStatus === "shipping" ||
                order.orderStatus === "confirmed" ||
                order.orderStatus === "delivered" ||
                order.orderStatus === "refunded" ? (
                  <li>
                    Đơn hàng đã đến kho {order.ward}, {order.district},{" "}
                    {order.city}
                  </li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "processing" ||
                order.orderStatus === "shipping" ||
                order.orderStatus === "confirmed" ||
                order.orderStatus === "delivered" ||
                order.orderStatus === "refunded" ? (
                  <li>Đơn hàng đã đến bưu cục</li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "processing" ||
                order.orderStatus === "shipping" ||
                order.orderStatus === "confirmed" ||
                order.orderStatus === "delivered" ||
                order.orderStatus === "refunded" ? (
                  <li>Đơn vị vận chuyển lấy hàng thành công</li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "processing" ||
                order.orderStatus === "shipping" ||
                order.orderStatus === "confirmed" ||
                order.orderStatus === "delivered" ||
                order.orderStatus === "refunded" ? (
                  <li>Đơn hàng đang được bàn giao cho dịch vụ vận chuyển</li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "processing" ||
                order.orderStatus === "shipping" ||
                order.orderStatus === "confirmed" ||
                order.orderStatus === "delivered" ||
                order.orderStatus === "refunded" ? (
                  <li>Đang chuẩn bị hàng</li>
                ) : (
                  <></>
                )}
                {order.orderStatus === "cancelled" ? (
                  <li>Đã hủy chuẩn bị hàng</li>
                ) : (
                  <></>
                )}
                {order.orderStatus !== "pending" ? (
                  <li>Đặt hàng thành công</li>
                ) : (
                  <></>
                )}
              </ul>
            </div>
          </div>
          <div className="order-summary">
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span>
                {Number(order.shippingFee) === 0
                  ? "Miễn phí"
                  : `${Number(order.shippingFee).toLocaleString()}đ`}
              </span>
            </div>

            {Number(order.discountAmount) > 0 && (
              <div className="summary-row discount">
                <span>
                  Voucher {order.discountCode ? `(${order.discountCode})` : ""}
                </span>
                <span>-{Number(order.discountAmount).toLocaleString()}đ</span>
              </div>
            )}

            <div className="summary-row total">
              <span>Tổng thanh toán</span>
              <span>{Number(order.totalAmount).toLocaleString()}đ</span>
            </div>
          </div>

          {btnCancel && (
            <div className="cancel-section">
              <label>Lý do hủy đơn</label>
              <textarea
                placeholder="Vui lòng nhập lý do hủy đơn hàng..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="order-actions">
            <button
              className="cancel-btn"
              disabled={!btnCancel || loading || !cancelReason.trim()}
              onClick={handleCancelOrder}
            >
              {loading ? "Đang hủy..." : "Hủy đơn hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
