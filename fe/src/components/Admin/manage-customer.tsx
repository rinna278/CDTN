import { useState, useEffect } from "react";
import "./manage-customer.css";
import { getAllUser } from "../../services/apiService";
import type { AllUser } from "../../types/type";

const ManageCustomer = () => {
  const [customers, setCustomers] = useState<AllUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Dùng useEffect để gọi API
  useEffect(() => {
    const fetchAllUser = async () => {
      try {
        setLoading(true);
        const response = await getAllUser();
        console.log("thông tin tất cả người dùng", response);
        setCustomers(response.data); // ✅ Lấy từ response.data
      } catch (err) {
        console.error("Lỗi khi lấy danh sách user:", err);
        setError("Không thể tải danh sách khách hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUser();
  }, []); // ✅ Chỉ chạy 1 lần khi component mount

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div className="content-top-customer">
        <div className="title_description">
          <h1>Quản Lý Khách Hàng</h1>
          <h5>Danh sách và thông tin khách hàng</h5>
        </div>
        <div className="content-middle-customer">
          <div className="item-customer">
            <div className="all-customer">
              <h4>Tổng Khách hàng</h4>
              <p>{customers.length}</p>
            </div>
            <div className="new-customer">
              <h4>Khách mới (Tháng)</h4>
              <p>87</p>
            </div>
            <div className="rate-customer">
              <h4>Đánh giá chăm sóc KH</h4>
              <p>94%</p>
            </div>
          </div>
          <div className="table-customers">
            <div className="title_table">
              <h2>Danh Sách Khách Hàng</h2>
              <h5>Tổng cộng có {customers.length} khách hàng</h5>
            </div>
            <div className="customer-data">
              <table>
                <thead>
                  <tr>
                    <th>Tên Khách Hàng</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Đơn hàng</th>
                    <th>Tổng chi tiêu</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td className="email">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                        >
                          <path d="M125.4 128C91.5 128 64 155.5 64 189.4C64 190.3 64 191.1 64.1 192L64 192L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 192L575.9 192C575.9 191.1 576 190.3 576 189.4C576 155.5 548.5 128 514.6 128L125.4 128zM528 256.3L528 448C528 456.8 520.8 464 512 464L128 464C119.2 464 112 456.8 112 448L112 256.3L266.8 373.7C298.2 397.6 341.7 397.6 373.2 373.7L528 256.3zM112 189.4C112 182 118 176 125.4 176L514.6 176C522 176 528 182 528 189.4C528 193.6 526 197.6 522.7 200.1L344.2 335.5C329.9 346.3 310.1 346.3 295.8 335.5L117.3 200.1C114 197.6 112 193.6 112 189.4z" />
                        </svg>
                        {customer.email}
                      </td>
                      <td>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 640 640"
                        >
                          <path d="M224.2 89C216.3 70.1 195.7 60.1 176.1 65.4L170.6 66.9C106 84.5 50.8 147.1 66.9 223.3C104 398.3 241.7 536 416.7 573.1C493 589.3 555.5 534 573.1 469.4L574.6 463.9C580 444.2 569.9 423.6 551.1 415.8L453.8 375.3C437.3 368.4 418.2 373.2 406.8 387.1L368.2 434.3C297.9 399.4 241.3 341 208.8 269.3L253 233.3C266.9 222 271.6 202.9 264.8 186.3L224.2 89z" />
                        </svg>
                        {customer.phone || "Chưa cập nhật"}
                      </td>
                      {/* ✅ Xử lý cart có thể null */}
                      <td className="order-number">
                        {customer.cart ? customer.cart.length : 0}
                      </td>
                      <td>{`₫ Chưa làm phần này`}</td>
                      <td>
                        <button className="edit">
                          Edit
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button className="delete">
                          Delete
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageCustomer;
