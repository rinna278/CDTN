import "./manage-product.css";
import { getAllProduct } from "../../services/apiService";
import { useEffect, useState } from "react";
import ModalCreateProduct from "./modal-create-product";

interface IProduct {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  category: string;
  description?: string;
  discount?: number;
  images?: string[];
  color?: string;
  occasions?: string[];
  status?: number;
  soldCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const ManageProduct = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      let res = await getAllProduct();
      console.log("Raw API Response:", res);
      console.log("First product:", res?.data?.[0]);

      if (res && res.data) {
        setProducts(res.data);
        if ((res as any).total) setTotalProducts((res as any).total);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSuccess = () => {
    // Reload lại danh sách sản phẩm sau khi thêm thành công
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
          <input placeholder="Search" type="search" className="input" />
        </div>
      </div>
      <div className="content-middle-product">
        <div className="title_table">
          <h2>Danh Sách Sản Phẩm</h2>
          <h5>Tổng cộng có ${products.length} loại</h5>
        </div>
        <div className="table_list">
          <table>
            <thead>
              <tr>
                <th>Tên Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : products && products.length > 0 ? (
                products.map((product, index) => {
                  console.log(`Rendering product ${index}:`, product);
                  return (
                    <tr key={product.id || index}>
                      <td>{product.name}</td>
                      <td>{product.category || "N/A"}</td>
                      <td>{formatCurrency(Number(product.price))}</td>
                      <td>{product.stock}</td>
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    Không có sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="content-bottom-product">
        <div className="title_bottom">
          <h2>Quản Lý Danh Mục</h2>
          <h5>Các danh mục sản phẩm</h5>
        </div>
        <div className="card-category">
          <div className="item-cart-category">
            <h4>Hoa Hồng</h4>
            <p>12 sản phẩm</p>
            <div className="btn_action">
              <button>Sửa</button>
              <button>Xóa</button>
            </div>
          </div>
          <div className="item-cart-category">
            <h4>Hoa TuLip</h4>
            <p>12 sản phẩm</p>
            <div className="btn_action">
              <button>Sửa</button>
              <button>Xóa</button>
            </div>
          </div>
          <div className="item-cart-category">
            <h4>Hoa Cúc</h4>
            <p>12 sản phẩm</p>
            <div className="btn_action">
              <button>Sửa</button>
              <button>Xóa</button>
            </div>
          </div>
          <div className="item-cart-category">
            <h4>Hoa Ly</h4>
            <p>12 sản phẩm</p>
            <div className="btn_action">
              <button>Sửa</button>
              <button>Xóa</button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Create Product */}
      <ModalCreateProduct
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default ManageProduct;
