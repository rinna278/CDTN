import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrderById, cancelOrder, postPayAgain } from "../../services/apiService";
import { toast } from "react-toastify";
import "./order-detail.css";

// Icons SVG
const CircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
    <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM320 416C267 416 224 373 224 320C224 267 267 224 320 224C373 224 416 267 416 320C416 373 373 416 320 416z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
    <path d="M128 64C92.7 64 64 92.7 64 128L64 512C64 547.3 92.7 576 128 576L308 576C297.5 561.4 289 545.3 282.9 528L208 528L208 448C208 430.3 222.3 416 240 416L272 416C274 416 276 416.2 277.9 416.5C283.9 392.9 294.2 371.1 308 352L304 352C295.2 352 288 344.8 288 336L288 304C288 295.2 295.2 288 304 288L336 288C344.8 288 352 295.2 352 304L352 308C379.5 288.2 412.3 275.6 448 272.6L448 128C448 92.7 419.3 64 384 64L128 64zM160 176C160 167.2 167.2 160 176 160L208 160C216.8 160 224 167.2 224 176L224 208C224 216.8 216.8 224 208 224L176 224C167.2 224 160 216.8 160 208L160 176zM304 160L336 160C344.8 160 352 167.2 352 176L352 208C352 216.8 344.8 224 336 224L304 224C295.2 224 288 216.8 288 208L288 176C288 167.2 295.2 160 304 160zM160 304C160 295.2 167.2 288 176 288L208 288C216.8 288 224 295.2 224 304L224 336C224 344.8 216.8 352 208 352L176 352C167.2 352 160 344.8 160 336L160 304zM608 464C608 384.5 543.5 320 464 320C384.5 320 320 384.5 320 464C320 543.5 384.5 608 464 608C543.5 608 608 543.5 608 464zM521.4 403.1C528.5 408.3 530.1 418.3 524.9 425.4L460.9 513.4C458.1 517.2 453.9 519.6 449.2 519.9C444.5 520.2 439.9 518.6 436.6 515.3L396.6 475.3C390.4 469.1 390.4 458.9 396.6 452.7C402.8 446.5 413 446.5 419.2 452.7L446 479.5L499 406.6C504.2 399.5 514.2 397.9 521.4 403.1z" />
  </svg>
);

// Định nghĩa các bước vận chuyển theo trạng thái
type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "refunded";

interface ShippingStep {
  icon: "circle" | "check";
  text: string;
}

const getShippingSteps = (
  status: OrderStatus,
  orderInfo?: { ward: string; district: string; city: string }
): ShippingStep[] => {
  const steps: Record<OrderStatus, ShippingStep[]> = {
    pending: [{ icon: "circle", text: "Đặt hàng thành công" }],
    confirmed: [{ icon: "circle", text: "Đặt hàng thành công" }],
    cancelled: [{ icon: "circle", text: "Đã hủy chuẩn bị hàng" }],
    processing: [
      { icon: "circle", text: "Đang chuẩn bị hàng" },
      {
        icon: "circle",
        text: "Đơn hàng đang được bàn giao cho dịch vụ vận chuyển",
      },
      { icon: "circle", text: "Đơn vị vận chuyển lấy hàng thành công" },
      { icon: "check", text: "Đơn hàng đã đến bưu cục" },
      {
        icon: "circle",
        text: orderInfo
          ? `Đơn hàng đã đến kho ${orderInfo.ward}, ${orderInfo.district}, ${orderInfo.city}`
          : "Đơn hàng đã đến kho",
      },
      { icon: "circle", text: "Đơn hàng đã đến trạm giao gần khu vực của bạn" },
      {
        icon: "circle",
        text: "Đơn hàng sẽ sớm được giao, vui lòng chú ý điện thoại",
      },
    ],
    shipping: [
      { icon: "circle", text: "Đang chuẩn bị hàng" },
      {
        icon: "circle",
        text: "Đơn hàng đang được bàn giao cho dịch vụ vận chuyển",
      },
      { icon: "circle", text: "Đơn vị vận chuyển lấy hàng thành công" },
      { icon: "check", text: "Đơn hàng đã đến bưu cục" },
      {
        icon: "check",
        text: orderInfo
          ? `Đơn hàng đã đến kho ${orderInfo.ward}, ${orderInfo.district}, ${orderInfo.city}`
          : "Đơn hàng đã đến kho",
      },
      { icon: "circle", text: "Đơn hàng đã đến trạm giao gần khu vực của bạn" },
      {
        icon: "circle",
        text: "Đơn hàng sẽ sớm được giao, vui lòng chú ý điện thoại",
      },
      { icon: "circle", text: "Đang vận chuyển" },
    ],
    delivered: [
      { icon: "circle", text: "Đang chuẩn bị hàng" },
      {
        icon: "circle",
        text: "Đơn hàng đang được bàn giao cho dịch vụ vận chuyển",
      },
      { icon: "circle", text: "Đơn vị vận chuyển lấy hàng thành công" },
      { icon: "check", text: "Đơn hàng đã đến bưu cục" },
      {
        icon: "check",
        text: orderInfo
          ? `Đơn hàng đã đến kho ${orderInfo.ward}, ${orderInfo.district}, ${orderInfo.city}`
          : "Đơn hàng đã đến kho",
      },
      { icon: "circle", text: "Đơn hàng đã đến trạm giao gần khu vực của bạn" },
      {
        icon: "circle",
        text: "Đơn hàng sẽ sớm được giao, vui lòng chú ý điện thoại",
      },
      { icon: "circle", text: "Đang vận chuyển" },
      { icon: "check", text: "Đã giao" },
    ],
    refunded: [
      { icon: "circle", text: "Đang chuẩn bị hàng" },
      {
        icon: "circle",
        text: "Đơn hàng đang được bàn giao cho dịch vụ vận chuyển",
      },
      { icon: "circle", text: "Đơn vị vận chuyển lấy hàng thành công" },
      { icon: "check", text: "Đơn hàng đã đến bưu cục" },
      {
        icon: "check",
        text: orderInfo
          ? `Đơn hàng đã đến kho ${orderInfo.ward}, ${orderInfo.district}, ${orderInfo.city}`
          : "Đơn hàng đã đến kho",
      },
      { icon: "circle", text: "Đơn hàng đã đến trạm giao gần khu vực của bạn" },
      {
        icon: "circle",
        text: "Đơn hàng sẽ sớm được giao, vui lòng chú ý điện thoại",
      },
      { icon: "circle", text: "Đang vận chuyển" },
      { icon: "check", text: "Đã giao" },
      { icon: "circle", text: "Đang xem xét đơn hoàn tiền" },
      { icon: "circle", text: "Đã xử lý, bạn vui lòng hoàn hàng qua bưu điện" },
      {
        icon: "circle",
        text: "Đã nhận hàng hoàn trả, chúng tôi sẽ gửi lại khoản tiền của bạn",
      },
      { icon: "check", text: "Đã hoàn tiền, vui lòng xác nhận lại" },
    ],
  };

  return steps[status] || [];
};

const getStatusMessage = (status: OrderStatus): string => {
  const messages: Record<OrderStatus, string> = {
    pending: "",
    confirmed: "Cảm ơn bạn đã sử dụng dịch vụ, mong bạn sẽ mua hàng lần tới",
    processing: "Cảm ơn bạn đã sử dụng dịch vụ, mong bạn sẽ mua hàng lần tới",
    shipping: "Cảm ơn bạn đã sử dụng dịch vụ, mong bạn sẽ mua hàng lần tới",
    delivered: "Cảm ơn bạn đã sử dụng dịch vụ, mong bạn sẽ mua hàng lần tới",
    cancelled: "",
    refunded: "Cảm ơn bạn đã sử dụng dịch vụ, mong bạn sẽ mua hàng lần tới",
  };

  return messages[status] || "";
};

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const cancelReasons = [
    "Đặt nhầm sản phẩm",
    "Không còn nhu cầu mua",
    "Tìm được giá tốt hơn ở nơi khác",
    "Muốn thay đổi địa chỉ giao hàng",
    "Lý do khác",
  ];

  const MIN_REASON_LENGTH = 5;
  const MAX_REASON_LENGTH = 200;

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await getOrderById(orderId);
        setOrder(res.data ?? res);
      } catch (err: any) {
        const status = err.response?.status;

        if (status === 401) {
          setLoading(true);
          navigate("/login", { replace: true });
          return;
        }
      }
    };

    fetchOrder();
  }, [orderId, navigate]);
  
  const handlePayAgain = async () => {
    try {
      const response = await postPayAgain(order.id);
      console.log("Dữ liệu trả về:", response);

      // Ví dụ: redirect sang cổng thanh toán
      // if (response?.paymentUrl) {
      //   window.location.href = response.paymentUrl;
      // }
    } catch (err) {
      console.error(err);
      toast.error("Không thể thanh toán lại");
    }
  };


  const handleCancelOrder = async () => {
    const finalReason =
      selectedReason === "Lý do khác" ? cancelReason.trim() : selectedReason;

    if (!selectedReason) {
      toast.warning("Vui lòng chọn lý do hủy đơn");
      return;
    }

    if (selectedReason === "Lý do khác") {
      if (!finalReason) {
        toast.warning("Lý do hủy không được để trống");
        return;
      }

      if (finalReason.length < MIN_REASON_LENGTH) {
        toast.warning(`Lý do hủy phải có ít nhất ${MIN_REASON_LENGTH} ký tự`);
        return;
      }

      if (finalReason.length > MAX_REASON_LENGTH) {
        toast.warning(`Lý do hủy tối đa ${MAX_REASON_LENGTH} ký tự`);
        return;
      }
    }

    try {
      setLoading(true);
      await cancelOrder(order.id, { reason: finalReason });
      toast.success("Hủy đơn hàng thành công");
      navigate("/profile?tab=orders");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="newtons-cradle">
          <div className="newtons-cradle__dot"></div>
          <div className="newtons-cradle__dot"></div>
          <div className="newtons-cradle__dot"></div>
          <div className="newtons-cradle__dot"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const btnCancel = order.orderStatus === "pending";
  const shippingSteps = getShippingSteps(order.orderStatus, {
    ward: order.ward,
    district: order.district,
    city: order.city,
  });
  const statusMessage = getStatusMessage(order.orderStatus);

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
              {statusMessage && <p>{statusMessage}</p>}

              <ul>
                {shippingSteps.map((step, index) => (
                  <li key={index}>
                    {step.icon === "check" ? <CheckIcon /> : <CircleIcon />}
                    {step.text}
                  </li>
                ))}
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

          <button onClick={handlePayAgain}>thanh toán lại</button>
          {btnCancel && (
            <div className="order-actions">
              <button
                className="cancel-btn-order"
                disabled={loading}
                onClick={() => setShowCancelModal(true)}
              >
                Hủy đơn hàng
              </button>
            </div>
          )}
        </div>
      </div>

      {showCancelModal && (
        <div className="cancel-overlay-order">
          <div className="cancel-modal-order">
            <h3>Lý do hủy đơn</h3>

            <div className="cancel-modal-body">
              <div className="reason-list">
                {cancelReasons.map((reason) => (
                  <label key={reason} className="reason-item">
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => {
                        setSelectedReason(reason);
                        if (reason !== "Lý do khác") {
                          setCancelReason(reason);
                        } else {
                          setCancelReason("");
                        }
                      }}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === "Lý do khác" && (
              <>
                <textarea
                  placeholder={`Nhập lý do hủy đơn (${MIN_REASON_LENGTH}–${MAX_REASON_LENGTH} ký tự)`}
                  value={cancelReason}
                  maxLength={MAX_REASON_LENGTH}
                  onChange={(e) => setCancelReason(e.target.value)}
                  disabled={loading}
                />

                <div
                  style={{ textAlign: "right", fontSize: 12, color: "#888" }}
                >
                  {cancelReason.trim().length}/{MAX_REASON_LENGTH}
                </div>
              </>
            )}

            <div className="modal-actions-order">
              <button
                className="modal-confirm-order"
                disabled={
                  loading ||
                  !selectedReason ||
                  (selectedReason === "Lý do khác" && !cancelReason.trim())
                }
                onClick={handleCancelOrder}
              >
                Xác nhận hủy
              </button>

              <button
                className="modal-cancel-order"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedReason("");
                  setCancelReason("");
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
