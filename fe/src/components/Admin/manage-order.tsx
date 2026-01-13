import "./manage-order.css";
import { useEffect, useState } from "react";
import { getAllOrders } from "../../services/apiService";
import { formatCurrency } from "../../utils/formatData";
import { OrderStatus, ManageOrderItem, OrderItem } from "../../types/type";
import { ORDER_STATUS_LABEL } from "../../utils/orderStatusMap";
import OrderDetailModalAdmin from "../Order/order-detail-modal-admin";

export const mapStatus = (status: OrderStatus): string => {
  return ORDER_STATUS_LABEL[status] ?? status;
};

// interface OrderExtended extends ManageOrderItem {
//   rawStatus: string;
//   item: OrderItem[];
//   userId: string;
// }

const ManageOrder = () => {
  const [orders, setOrders] = useState<OrderExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
    refund_requested: 0
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  interface OrderExtended extends ManageOrderItem {
    rawStatus: string;
    items: OrderItem[];
    userId: string;
  }

  const [hoveredOrder, setHoveredOrder] = useState<OrderExtended | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchDataOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders({ page: pagination.page, limit: pagination.limit });
      console.log("API lấy đơn hàng",res);
      if (res?.data) {
        const formatted = res.data.map((order: any) => ({
          id: String(order.id),
          maDon: order.orderCode,
          nameCustomer: order.recipientName,
          totalPrice: formatCurrency(order.totalAmount),
          status: mapStatus(order.orderStatus),
          rawStatus: order.orderStatus,
          date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
          items: order.items || [],
          userId: order.userId
        }));
        setOrders(formatted);
        setPagination((prev) => ({
          ...prev,
          total: res.total,
          totalPages: Math.ceil(res.total / prev.limit),
        }));

        // Cập nhật stats
        const s = {
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipping: 0,
          delivered: 0,
          cancelled: 0,
          refunded: 0,
          refund_requested: 0
        };
        res.data.forEach((o: any) => {
          if (s.hasOwnProperty(o.orderStatus)) (s as any)[o.orderStatus]++;
        });
        setStats(s);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataOrders();
  }, [pagination.page]);

  if (loading)
    return <div style={{ padding: "20px" }}>Đang tải dữ liệu...</div>;

  return (
    <>
      <div className="content-top-order">
        <div className="title_description">
          <h1>Quản Lý Đơn Hàng</h1>
          <h5>Danh sách và cập nhật trạng thái đơn hàng</h5>
        </div>
      </div>

      <div className="content-middle-order">
        <div className="item-order">
          <div className="status-order-1">
            <h4>Chờ xác nhận</h4>
            <p>{stats.pending}</p>
          </div>
          <div className="status-order-2">
            <h4>Đã xác nhận</h4>
            <p>{stats.confirmed}</p>
          </div>
          <div className="status-order-3">
            <h4>Đang xử lý</h4>
            <p>{stats.processing}</p>
          </div>
          <div className="status-order-4">
            <h4>Đang giao</h4>
            <p>{stats.shipping}</p>
          </div>
          <div className="status-order-5">
            <h4>Đã giao</h4>
            <p>{stats.delivered}</p>
          </div>
          <div className="status-order-6">
            <h4>Đã hủy</h4>
            <p>{stats.cancelled}</p>
          </div>
          <div className="status-order-7">
            <h4>Hoàn tiền</h4>
            <p>{stats.refunded}</p>
          </div>
          <div className="status-order-8">
            <h4>Yêu cầu hoàn tiền</h4>
            <p>{stats.refund_requested}</p>
          </div>
        </div>

        <div className="table-orders">
          <div className="title_table">
            <div className="header-table_search">
              <h2>Danh Sách Đơn Hàng</h2>
              <div className="search-input-order">
                <input type="text" placeholder="Tìm kiếm theo mã đơn hàng" />
                <input type="text" placeholder="Tìm kiếm theo tên khách hàng" />
                <button className="btn-search-order">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
                  </svg>
                </button>
              </div>
            </div>
            <h5>Tổng cộng có {orders.length} đơn hàng gần đây</h5>
          </div>
          <div className="order-data">
            <table>
              <thead>
                <tr>
                  <th>Mã Đơn Hàng</th>
                  <th>Tên Khách Hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái đơn</th>
                  <th>Ngày</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.maDon}</td>
                    <td className="name_id">
                      {order.nameCustomer} - [{order.userId}]
                    </td>
                    <td>{`₫${order.totalPrice}`}</td>
                    <td>
                      <span className={`status-badge ${order.rawStatus}`}>
                        {order.status === "Chờ xác nhận" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path
                              fill="#b76b00"
                              d="M320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"
                            />
                          </svg>
                        )}
                        {order.status === "Đã xác nhận" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path
                              fill="#2169fc"
                              d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"
                            />
                          </svg>
                        )}
                        {order.status === "Đang xử lý" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path
                              fill="#3fad82"
                              d="M129.9 292.5C143.2 199.5 223.3 128 320 128C373 128 421 149.5 455.8 184.2C456 184.4 456.2 184.6 456.4 184.8L464 192L416.1 192C398.4 192 384.1 206.3 384.1 224C384.1 241.7 398.4 256 416.1 256L544.1 256C561.8 256 576.1 241.7 576.1 224L576.1 96C576.1 78.3 561.8 64 544.1 64C526.4 64 512.1 78.3 512.1 96L512.1 149.4L500.8 138.7C454.5 92.6 390.5 64 320 64C191 64 84.3 159.4 66.6 283.5C64.1 301 76.2 317.2 93.7 319.7C111.2 322.2 127.4 310 129.9 292.6zM573.4 356.5C575.9 339 563.7 322.8 546.3 320.3C528.9 317.8 512.6 330 510.1 347.4C496.8 440.4 416.7 511.9 320 511.9C267 511.9 219 490.4 184.2 455.7C184 455.5 183.8 455.3 183.6 455.1L176 447.9L223.9 447.9C241.6 447.9 255.9 433.6 255.9 415.9C255.9 398.2 241.6 383.9 223.9 383.9L96 384C87.5 384 79.3 387.4 73.3 393.5C67.3 399.6 63.9 407.7 64 416.3L65 543.3C65.1 561 79.6 575.2 97.3 575C115 574.8 129.2 560.4 129 542.7L128.6 491.2L139.3 501.3C185.6 547.4 249.5 576 320 576C449 576 555.7 480.6 573.4 356.5z"
                            />
                          </svg>
                        )}
                        {order.status === "Đang giao" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path
                              fill="#18d0f2"
                              d="M32 160C32 124.7 60.7 96 96 96L384 96C419.3 96 448 124.7 448 160L448 192L498.7 192C515.7 192 532 198.7 544 210.7L589.3 256C601.3 268 608 284.3 608 301.3L608 448C608 483.3 579.3 512 544 512L540.7 512C530.3 548.9 496.3 576 456 576C415.7 576 381.8 548.9 371.3 512L268.7 512C258.3 548.9 224.3 576 184 576C143.7 576 109.8 548.9 99.3 512L96 512C60.7 512 32 483.3 32 448L32 160zM544 352L544 301.3L498.7 256L448 256L448 352L544 352zM224 488C224 465.9 206.1 448 184 448C161.9 448 144 465.9 144 488C144 510.1 161.9 528 184 528C206.1 528 224 510.1 224 488zM456 528C478.1 528 496 510.1 496 488C496 465.9 478.1 448 456 448C433.9 448 416 465.9 416 488C416 510.1 433.9 528 456 528z"
                            />
                          </svg>
                        )}
                        {order.status === "Đã giao" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path
                              fill="#d46dc4"
                              d="M480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96L480 96zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 283 440.5 289.9 440C296.8 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z"
                            />
                          </svg>
                        )}
                        {order.status === "Đã hủy" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path
                              fill="#630310"
                              d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"
                            />
                          </svg>
                        )}
                        {order.status === "Hoàn tiền" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path
                              fill="#e9004e"
                              d="M128 128C92.7 128 64 156.7 64 192L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 192C576 156.7 547.3 128 512 128L128 128zM360 352L488 352C501.3 352 512 362.7 512 376C512 389.3 501.3 400 488 400L360 400C346.7 400 336 389.3 336 376C336 362.7 346.7 352 360 352zM336 264C336 250.7 346.7 240 360 240L488 240C501.3 240 512 250.7 512 264C512 277.3 501.3 288 488 288L360 288C346.7 288 336 277.3 336 264zM212 208C223 208 232 217 232 228L232 232L240 232C251 232 260 241 260 252C260 263 251 272 240 272L192.5 272C185.6 272 180 277.6 180 284.5C180 290.6 184.4 295.8 190.4 296.8L232.1 303.8C257.4 308 276 329.9 276 355.6C276 381.7 257 403.3 232 407.4L232 412.1C232 423.1 223 432.1 212 432.1C201 432.1 192 423.1 192 412.1L192 408.1L168 408.1C157 408.1 148 399.1 148 388.1C148 377.1 157 368.1 168 368.1L223.5 368.1C230.4 368.1 236 362.5 236 355.6C236 349.5 231.6 344.3 225.6 343.3L183.9 336.3C158.5 332 140 310.1 140 284.5C140 255.7 163.2 232.3 192 232L192 228C192 217 201 208 212 208z"
                            />
                          </svg>
                        )}
                        {order.status}
                      </span>
                    </td>
                    <td>{order.date}</td>
                    <td>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 640"
                        fill="currentColor"
                      >
                        <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" />
                      </svg>
                      <span
                        onClick={() => {
                          setHoveredOrder(order);
                          setModalVisible(true);
                        }}
                        style={{ cursor: "pointer", color: "#2169fc" }}
                      >
                        Chi tiết
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                Page {pagination.page} / {pagination.totalPages}
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
        </div>
      </div>

      <OrderDetailModalAdmin
        order={hoveredOrder}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUpdated={fetchDataOrders}
      />
    </>
  );
};

export default ManageOrder;
