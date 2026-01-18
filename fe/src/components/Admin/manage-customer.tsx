import { useState, useEffect } from "react";
import "./manage-customer.css";
import { getAllUser, getStatisticNewCustomer } from "../../services/apiService";
import type { AllUser } from "../../types/type";

const ManageCustomer = () => {
  // ===== STATE =====
  const [deleteCustomers, setDeleteCustomers] = useState<AllUser[]>(() => {
    const saved = localStorage.getItem("deleted_customers");
    return saved ? JSON.parse(saved) : [];
  });

  const [allCustomers, setAllCustomers] = useState<AllUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDeleted, setStatusDeleted] = useState(false);
  const [statisticNewCustomer, setStatisticNewCustomer] = useState(0);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });

  // ===== SAVE DELETED USERS =====
  useEffect(() => {
    localStorage.setItem("deleted_customers", JSON.stringify(deleteCustomers));
  }, [deleteCustomers]);

  // ===== FETCH DATA =====
  useEffect(() => {
    const fetchAllUser = async () => {
      try {
        setLoading(true);
        const response = await getAllUser();
        const resStatistic = await getStatisticNewCustomer();

        setStatisticNewCustomer(
          typeof resStatistic.data === "number"
            ? resStatistic.data
            : (resStatistic.data?.count ?? 0),
        );


        const allUsersFromApi: AllUser[] = response.data;
        const deletedIds = new Set(deleteCustomers.map((u) => u.id));

        const activeUsers = allUsersFromApi.filter(
          (u) => !deletedIds.has(u.id),
        );

        setAllCustomers(activeUsers);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách user:", err);
        setError("Không thể tải danh sách khách hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUser();
  }, []);

  // ===== UPDATE PAGINATION WHEN DATA CHANGE =====
  useEffect(() => {
    const total = statusDeleted ? deleteCustomers.length : allCustomers.length;

    setPagination((p) => ({
      ...p,
      page: 1,
      total,
      totalPages: Math.ceil(total / p.limit),
    }));
  }, [statusDeleted, allCustomers, deleteCustomers]);

  // ===== HANDLERS =====
  const handleChangeTableDeletedUser = () => {
    setStatusDeleted((prev) => !prev);
  };

  const handleDeleteUser = (user: AllUser) => {
    setAllCustomers((prev) => prev.filter((u) => u.id !== user.id));
    setDeleteCustomers((prev) => [...prev, user]);
  };

  const handleRestoreUser = (user: AllUser) => {
    setDeleteCustomers((prev) => prev.filter((u) => u.id !== user.id));
    setAllCustomers((prev) => [...prev, user]);
  };

  const handleRestoreAll = () => {
    setAllCustomers((prev) => [...prev, ...deleteCustomers]);
    setDeleteCustomers([]);
    setStatusDeleted(false);
  };

  // ===== PAGINATED DATA =====
  const currentData = statusDeleted ? deleteCustomers : allCustomers;

  const paginatedCustomers = currentData.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  );

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  // ===== RENDER =====
  return (
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
            <p>{statisticNewCustomer}</p>
          </div>
        </div>

        <div className="table-customers">
          <div className="title_table">
            <div className="btn-deleted-user-and-title">
              <h2>
                {statusDeleted ? "Danh Sách Đã Xóa" : "Danh Sách Khách Hàng"}
              </h2>

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

            <h5>
              {statusDeleted
                ? `${deleteCustomers.length} khách hàng đã xóa`
                : `Tổng cộng có ${allCustomers.length} khách hàng`}
            </h5>
          </div>

          {/* ===== TABLE ===== */}
          <div className="customer-data">
            <table>
              <thead>
                <tr>
                  <th>Tên Khách Hàng</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-full-row">
                        Không có thông tin hiển thị
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td className="email">{customer.email}</td>
                      <td>{customer.phone || "Chưa cập nhật"}</td>
                      <td>
                        {!statusDeleted ? (
                          <button
                            className="delete"
                            onClick={() => handleDeleteUser(customer)}
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            className="btn-restore"
                            onClick={() => handleRestoreUser(customer)}
                          >
                            Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ===== PAGINATION ===== */}
            {pagination.totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination((p) => ({
                      ...p,
                      page: p.page - 1,
                    }))
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
                    setPagination((p) => ({
                      ...p,
                      page: p.page + 1,
                    }))
                  }
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCustomer;
