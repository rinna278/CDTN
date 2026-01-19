import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import "./manage-categories.css";
import ModalConfirmDeleteCategory from "./modal-confirm-delete-category";
import { toast } from "react-toastify";
import { getAllProduct } from "../../services/apiService";

interface Category {
  id: string;
  name: string;
  productCount: number;
}

interface CategoryManagerProps {
  onCategoriesChange?: (categories: string[]) => void;
}

const CategoryManager = ({ onCategoriesChange }: CategoryManagerProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State cho delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Sử dụng useCallback để tránh re-create function
  const fetchProductCounts = useCallback(async (categoryList: Category[]) => {
    try {
      const response = await getAllProduct({
        page: 1,
        limit: 1000,
      });

      const categoryCounts: { [key: string]: number } = {};

      response.data.forEach((product) => {
        const category = product.category;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      const updatedCategories = categoryList.map((cat) => ({
        ...cat,
        productCount: categoryCounts[cat.name] || 0,
      }));

      return updatedCategories;
    } catch (error) {
      console.error("Error fetching product counts:", error);
      toast.error("Không thể tải số lượng sản phẩm");
      return categoryList;
    }
  }, []);

  // Load categories ban đầu
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);

      const savedCategories = localStorage.getItem("productCategories");
      let categoryList: Category[];

      if (savedCategories) {
        categoryList = JSON.parse(savedCategories);
      } else {
        categoryList = [
          { id: "1", name: "Hoa Hồng", productCount: 0 },
          { id: "2", name: "Hoa Tulip", productCount: 0 },
          { id: "3", name: "Hoa Cúc", productCount: 0 },
          { id: "4", name: "Hoa Ly", productCount: 0 },
        ];
      }

      const updatedCategories = await fetchProductCounts(categoryList);
      setCategories(updatedCategories);
      localStorage.setItem(
        "productCategories",
        JSON.stringify(updatedCategories),
      );
      setIsLoading(false);
    };

    loadCategories();
  }, [fetchProductCounts]);

  // ✅ FIX: Lắng nghe event KHÔNG phụ thuộc vào categories
  useEffect(() => {
    const handleProductUpdate = async () => {
      // Đọc categories từ state hiện tại thay vì dependency
      setCategories((prevCategories) => {
        // Trigger async update
        fetchProductCounts(prevCategories).then((updated) => {
          setCategories(updated);
          localStorage.setItem("productCategories", JSON.stringify(updated));
        });
        // Trả về state hiện tại để không thay đổi ngay
        return prevCategories;
      });
    };

    window.addEventListener("productUpdated", handleProductUpdate);
    window.addEventListener("categoriesUpdated", handleProductUpdate);

    return () => {
      window.removeEventListener("productUpdated", handleProductUpdate);
      window.removeEventListener("categoriesUpdated", handleProductUpdate);
    };
  }, [fetchProductCounts]); // ✅ Chỉ phụ thuộc vào fetchProductCounts (stable)

  // Notify parent component when categories change
  useEffect(() => {
    if (onCategoriesChange) {
      onCategoriesChange(categories.map((cat) => cat.name));
    }
  }, [categories, onCategoriesChange]);

  // ✅ Lưu categories và cập nhật state ngay lập tức
  const saveCategories = async (newCategories: Category[]) => {
    // Update state NGAY để UI phản ánh ngay lập tức
    setCategories(newCategories);
    localStorage.setItem("productCategories", JSON.stringify(newCategories));

    // Sau đó fetch product counts
    const updatedCategories = await fetchProductCounts(newCategories);
    setCategories(updatedCategories);
    localStorage.setItem(
      "productCategories",
      JSON.stringify(updatedCategories),
    );

    // Trigger event
    window.dispatchEvent(new Event("categoriesUpdated"));
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    // ✅ Kiểm tra nếu category có sản phẩm
    if (category.productCount > 0) {
      toast.warning(
        `Không thể sửa tên danh mục "${category.name}" vì đang có ${category.productCount} sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.`,
        {
          autoClose: 4000,
        },
      );
      return;
    }

    setEditingCategory(category);
    setCategoryName(category.name);
    setError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryName("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      setError("Vui lòng nhập tên danh mục");
      return;
    }

    const isDuplicate = categories.some(
      (cat) =>
        cat.name.toLowerCase() === categoryName.trim().toLowerCase() &&
        cat.id !== editingCategory?.id,
    );

    if (isDuplicate) {
      setError("Danh mục này đã tồn tại");
      return;
    }

    if (editingCategory) {
      const updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.id
          ? { ...cat, name: categoryName.trim() }
          : cat,
      );
      await saveCategories(updatedCategories);
      toast.success("Cập nhật danh mục thành công");
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryName.trim(),
        productCount: 0,
      };
      await saveCategories([...categories, newCategory]);
      toast.success("Thêm danh mục thành công");
    }

    handleCloseModal();
  };

  const handleOpenDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  // ✅ FIX: Xóa ngay lập tức, không cần setTimeout
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);

    try {
      // ✅ Xóa category ngay lập tức
      const updatedCategories = categories.filter(
        (cat) => cat.id !== categoryToDelete.id,
      );

      await saveCategories(updatedCategories);

      toast.success("Đã xóa danh mục");
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Có lỗi xảy ra khi xóa danh mục");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="content-bottom-product">
        <div className="title_bottom">
          <h2>Quản Lý Danh Mục</h2>
          <h5>Đang tải...</h5>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="content-bottom-product">
        <div className="title_bottom">
          <h2>Quản Lý Danh Mục</h2>
          <h5>Các danh mục sản phẩm ({categories.length})</h5>
        </div>

        <div className="btn-add-category">
          <button className="add-category-btn" onClick={handleOpenAddModal}>
            <Plus size={20} />
            Thêm Danh Mục
          </button>
        </div>

        <div className="card-category">
          {categories.map((category) => (
            <div key={category.id} className="item-cart-category">
              <h4>{category.name}</h4>
              <p>{category.productCount} sản phẩm</p>

              <div className="btn_action">
                <button onClick={() => handleOpenEditModal(category)}>
                  <Edit2 size={16} />
                  Sửa
                </button>

                <button
                  onClick={() => handleOpenDeleteModal(category)}
                  disabled={category.productCount > 0}
                  title={
                    category.productCount > 0
                      ? "Không thể xóa danh mục đang có sản phẩm"
                      : "Xóa danh mục"
                  }
                  style={{
                    opacity: category.productCount > 0 ? 0.5 : 1,
                    cursor:
                      category.productCount > 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <Trash2
                    style={{
                      opacity: category.productCount > 0 ? 0.5 : 1,
                      cursor:
                        category.productCount > 0 ? "not-allowed" : "pointer",
                    }}
                    size={16}
                  />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add/Edit Category */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-category" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-category">
              <h3>{editingCategory ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}</h3>
            </div>

            <div className="modal-body-category">
              <div className="form-group-category">
                <label>
                  Tên danh mục <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    setError("");
                  }}
                  placeholder="Nhập tên danh mục"
                  autoFocus
                />
                {error && <span className="error-text">{error}</span>}
              </div>
            </div>

            <div className="modal-footer-category">
              <button
                className="btn-cancel-category"
                onClick={handleCloseModal}
              >
                Hủy
              </button>
              <button className="btn-submit" onClick={handleSubmit}>
                {editingCategory ? "Cập Nhật" : "Thêm Mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      <ModalConfirmDeleteCategory
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        categoryName={categoryToDelete?.name}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default CategoryManager;
