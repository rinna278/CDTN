import "./manage-product.css";
import { getAllProduct, deleteProduct } from "../../services/apiService";
import { useEffect, useState } from "react";
import ModalCreateProduct from "./modal-create-product";
import ModalEditProduct from "./modal-edit-product";
import ModalConfirmDelete from "./modal-confirm-delete";
import CategoryManager from "./manage-categories";
import { toast } from "react-toastify";
import { Product } from "../../types/type";

const ManageProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  //load khi tạo hoặc sửa
  const [reloadKey, setReloadKey] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const response = await getAllProduct({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm || undefined,
        });

        setProducts(response.data || []);

        setPagination((prev) => ({
          ...prev,
          total: response.total,
          totalPages: Math.ceil(response.total / prev.limit),
        }));

        setTotalProducts(response.total);
      } catch (error) {
        toast.error("Không thể tải danh sách sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [pagination.page, searchTerm, reloadKey]);

  console.log("Danh sách sản phẩm: ", products);

  const formatCurrency = (amount: number) => {
    return Number(amount).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSuccess = () => {
    setPagination((p) => ({ ...p, page: 1 }));
    setReloadKey((k) => k + 1);
  };

  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);

      toast.success("Xóa sản phẩm thành công!", {
        position: "top-right",
        autoClose: 2000,
      });

      // ✅ UPDATE UI NGAY
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));

      // cập nhật tổng
      setTotalProducts((prev) => prev - 1);

      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      toast.error("Có lỗi xảy ra khi xóa sản phẩm");
    } finally {
      setIsDeleting(false);
    }
  };


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((p) => ({ ...p, page }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ✅ Tính số màu khả dụng (stock thực tế - reserved > 0)
  const getAvailableColorsCount = (product: Product): number => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.filter((v) => {
      const availableStock = v.stock - (v.reservedStock || 0);
      return availableStock > 0;
    }).length;
  };

  // ✅ Tính tổng kho khả dụng (tổng stock - tổng reserved)
  const getTotalAvailableStock = (product: Product): number => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((total, v) => {
      const availableStock = v.stock - (v.reservedStock || 0);
      return total + Math.max(0, availableStock); // Không để số âm
    }, 0);
  };

  // ✅ Tính tổng reserved stock
  const getTotalReservedStock = (product: Product): number => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((total, v) => {
      return total + (v.reservedStock || 0);
    }, 0);
  };

  return (
    <>
      <div className="content-top-product">
        <div className="title_description">
          <h1>Quản Lý Sản Phẩm</h1>
          <h5>Quản lý danh sách hoa và danh mục</h5>
        </div>
        <div className="btn-add-product">
          <div className="box-button">
            <div className="button" onClick={handleOpenModal}>
              <span> + Thêm sản phẩm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="search">
        <div className="group">
          <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
            </g>
          </svg>
          <input
            placeholder="Tìm kiếm sản phẩm..."
            type="search"
            className="input"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="content-middle-product">
        <div className="title_table">
          <h2>Danh Sách Sản Phẩm</h2>
          <h5>Tổng cộng có {totalProducts} sản phẩm</h5>
        </div>
        <div className="table_list">
          <table>
            <thead>
              <tr>
                <th>Tên Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Kho khả dụng</th>
                <th>Đang giữ chỗ</th>
                <th>Màu khả dụng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : products && products.length > 0 ? (
                products.map((product, index) => {
                  console.log(`Rendering product ${index}:`, product);
                  const availableColors = getAvailableColorsCount(product);
                  const totalAvailableStock = getTotalAvailableStock(product);
                  const totalReservedStock = getTotalReservedStock(product);

                  return (
                    <tr key={product.id || index}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {product.variants && product.variants[0]?.image ? (
                            <img
                              src={product.variants[0].image.url}
                              alt={product.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          ) : null}
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td>{product.category || "N/A"}</td>
                      <td>{formatCurrency(Number(product.price))}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "bold",
                              color:
                                totalAvailableStock > 0 ? "#28a745" : "#dc3545",
                            }}
                          >
                            {totalAvailableStock}
                          </span>
                          <span style={{ fontSize: "11px", color: "#666" }}>
                            (Tổng: {product.totalStock})
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            background:
                              totalReservedStock > 0 ? "#fff3cd" : "#e9ecef",
                            color:
                              totalReservedStock > 0 ? "#856404" : "#6c757d",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {totalReservedStock}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            background:
                              availableColors > 0 ? "#d4edda" : "#f8d7da",
                            color: availableColors > 0 ? "#28a745" : "#dc3545",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {availableColors}/{product.variants?.length || 0} màu
                        </span>
                      </td>
                      <td>
                        <button
                          className="edit"
                          onClick={() => handleOpenEditModal(product)}
                        >
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
                        <button
                          className="delete"
                          onClick={() => handleOpenDeleteModal(product)}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    {searchTerm
                      ? "Không tìm thấy sản phẩm nào"
                      : "Không có sản phẩm nào"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
        </div>
      </div>

      <CategoryManager />

      <ModalCreateProduct
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

      <ModalEditProduct
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleSuccess}
        product={selectedProduct}
      />

      <ModalConfirmDelete
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ManageProduct;
