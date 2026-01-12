import { useState, useEffect } from "react";
import "./manage-customer.css";
import { getAllUser } from "../../services/apiService";
import type { AllUser } from "../../types/type";

const ManageCustomer = () => {
  // ✅ CHANGE 1: Khởi tạo state từ LocalStorage
  const [deleteCustomers, setDeleteCustomers] = useState<AllUser[]>(() => {
    const saved = localStorage.getItem("deleted_customers");
    return saved ? JSON.parse(saved) : [];
  });
  const [allCustomers, setAllCustomers] = useState<AllUser[]>([]);

  // const [customers, setCustomers] = useState<AllUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDeleted, setStatusDeleted] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    localStorage.setItem("deleted_customers", JSON.stringify(deleteCustomers));
  }, [deleteCustomers]);

  const handleChangeTableDeletedUser = () => {
    setStatusDeleted(!statusDeleted);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleDeleteUser = (user: AllUser) => {
    setAllCustomers((prev) => prev.filter((u) => u.id !== user.id));
    setDeleteCustomers((prev) => [...prev, user]);

    setPagination((p) => ({
      ...p,
      total: p.total - 1,
      totalPages: Math.ceil((p.total - 1) / p.limit),
    }));
  };

  const handleRestoreUser = (user: AllUser) => {
    setDeleteCustomers((prev) => prev.filter((u) => u.id !== user.id));
    setAllCustomers((prev) => [...prev, user]);

    setPagination((p) => ({
      ...p,
      total: p.total + 1,
      totalPages: Math.ceil((p.total + 1) / p.limit),
    }));
  };

  const handleRestoreAll = () => {
    setAllCustomers((prev) => [...prev, ...deleteCustomers]);
    setDeleteCustomers([]);

    setPagination((p) => {
      const newTotal = p.total + deleteCustomers.length;
      return {
        ...p,
        page: 1,
        total: newTotal,
        totalPages: Math.ceil(newTotal / p.limit),
      };
    });
  };

  useEffect(() => {
    const fetchAllUser = async () => {
      try {
        setLoading(true);
        const response = await getAllUser();
        const allUsersFromApi: AllUser[] = response.data;

        const deletedIds = new Set(deleteCustomers.map((u) => u.id));

        const activeUsers = allUsersFromApi.filter(
          (u) => !deletedIds.has(u.id)
        );
        setAllCustomers(activeUsers);
        setPagination((p) => ({
          ...p,
          total: activeUsers.length,
          totalPages: Math.ceil(activeUsers.length / p.limit),
        }));
        // setCustomers(activeUsers);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách user:", err);
        setError("Không thể tải danh sách khách hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUser();
  }, []);
  const paginatedCustomers = allCustomers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const paginatedDeletedCustomers = deleteCustomers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

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
              <p>{allCustomers.length}</p>
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
              <div className="btn-deleted-user-and-title">
                {!statusDeleted ? (
                  <h2>Danh Sách Khách Hàng</h2>
                ) : (
                  <h2>Danh Sách Đã Xóa</h2>
                )}
                {!statusDeleted ? (
                  <button
                    className="deleted-user"
                    onClick={handleChangeTableDeletedUser}
                  >
                    Người dùng đã xóa ({deleteCustomers.length})
                  </button>
                ) : (
                  <div className="btn-restore-and-return">
                    <button
                      className="btn-restore-all"
                      onClick={handleRestoreAll}
                    >
                      Khôi phục tất cả
                    </button>
                    <button
                      className="btn-return"
                      onClick={handleChangeTableDeletedUser}
                    >
                      Quay Trở Lại
                    </button>
                  </div>
                )}
              </div>
              {!statusDeleted ? (
                <h5>Tổng cộng có {allCustomers.length} khách hàng</h5>
              ) : (
                <h5>{deleteCustomers.length} khách hàng đã xóa</h5>
              )}
            </div>

            {/* --- BẢNG DANH SÁCH KHÁCH HÀNG (ACTIVE) --- */}
            {!statusDeleted ? (
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
                    {paginatedCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-full-row">
                            Không có thông tin hiển thị
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td>{customer.name}</td>
                          <td className="email">
                            {/* SVG icon */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 640 640"
                            >
                              <path d="M125.4 128C91.5 128 64 155.5 64 189.4C64 190.3 64 191.1 64.1 192L64 192L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 192L575.9 192C575.9 191.1 576 190.3 576 189.4C576 155.5 548.5 128 514.6 128L125.4 128zM528 256.3L528 448C528 456.8 520.8 464 512 464L128 464C119.2 464 112 456.8 112 448L112 256.3L266.8 373.7C298.2 397.6 341.7 397.6 373.2 373.7L528 256.3zM112 189.4C112 182 118 176 125.4 176L514.6 176C522 176 528 182 528 189.4C528 193.6 526 197.6 522.7 200.1L344.2 335.5C329.9 346.3 310.1 346.3 295.8 335.5L117.3 200.1C114 197.6 112 193.6 112 189.4z" />
                            </svg>
                            {customer.email}
                          </td>
                          <td>
                            {/* SVG icon */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 640 640"
                            >
                              <path d="M224.2 89C216.3 70.1 195.7 60.1 176.1 65.4L170.6 66.9C106 84.5 50.8 147.1 66.9 223.3C104 398.3 241.7 536 416.7 573.1C493 589.3 555.5 534 573.1 469.4L574.6 463.9C580 444.2 569.9 423.6 551.1 415.8L453.8 375.3C437.3 368.4 418.2 373.2 406.8 387.1L368.2 434.3C297.9 399.4 241.3 341 208.8 269.3L253 233.3C266.9 222 271.6 202.9 264.8 186.3L224.2 89z" />
                            </svg>
                            {customer.phone || "Chưa cập nhật"}
                          </td>
                          <td className="order-number">
                            {customer.cart ? customer.cart.length : 0}
                          </td>
                          <td>{`₫ Chưa làm phần này`}</td>
                          <td>
                            <button
                              className="delete"
                              onClick={() => handleDeleteUser(customer)}
                            >
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
                      ))
                    )}
                  </tbody>
                </table>
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
              </div>
            ) : (
              /* --- BẢNG DANH SÁCH ĐÃ XÓA --- */
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
                    {paginatedDeletedCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-full-row">
                            Không có thông tin hiển thị
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedDeletedCustomers.map((customer) => (
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
                          <td className="order-number">
                            {customer.cart ? customer.cart.length : 0}
                          </td>
                          <td>{`₫ Chưa làm phần này`}</td>
                          <td>
                            {/* Đã sửa lại SVG Restore fill=currentColor */}
                            <button
                              className="btn-restore"
                              onClick={() => handleRestoreUser(customer)}
                            >
                              Restore
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 640 640"
                                fill="currentColor"
                              >
                                <path d="M88 256L232 256C241.7 256 250.5 250.2 254.2 241.2C257.9 232.2 255.9 221.9 249 215L202.3 168.3C277.6 109.7 386.6 115 455.8 184.2C530.8 259.2 530.8 380.7 455.8 455.7C380.8 530.7 259.3 530.7 184.3 455.7C174.1 445.5 165.3 434.4 157.9 422.7C148.4 407.8 128.6 403.4 113.7 412.9C98.8 422.4 94.4 442.2 103.9 457.1C113.7 472.7 125.4 487.5 139 501C239 601 401 601 501 501C601 401 601 239 501 139C406.8 44.7 257.3 39.3 156.7 122.8L105 71C98.1 64.2 87.8 62.1 78.8 65.8C69.8 69.5 64 78.3 64 88L64 232C64 245.3 74.7 256 88 256z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageCustomer;
