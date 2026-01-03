import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import "./manage-categories.css";
import ModalConfirmDeleteCategory from "./modal-confirm-delete-category";
import { toast } from "react-toastify";

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

  // ✅ State cho delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Load categories từ localStorage khi component mount
  useEffect(() => {
    const savedCategories = localStorage.getItem("productCategories");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Danh mục mặc định
      const defaultCategories: Category[] = [
        { id: "1", name: "Hoa Hồng", productCount: 0 },
        { id: "2", name: "Hoa Tulip", productCount: 8 },
        { id: "3", name: "Hoa Cúc", productCount: 15 },
        { id: "4", name: "Hoa Ly", productCount: 10 },
      ];
      setCategories(defaultCategories);
      localStorage.setItem(
        "productCategories",
        JSON.stringify(defaultCategories)
      );
    }
  }, []);

  // Notify parent component when categories change
  useEffect(() => {
    if (onCategoriesChange) {
      onCategoriesChange(categories.map((cat) => cat.name));
    }
  }, [categories, onCategoriesChange]);

  // Lưu categories vào localStorage
  const saveCategories = (newCategories: Category[]) => {
    localStorage.setItem("productCategories", JSON.stringify(newCategories));
    setCategories(newCategories);
    // ✅ Trigger event để notify các component khác
    window.dispatchEvent(new Event("categoriesUpdated"));
  };

  // Mở modal thêm danh mục
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setError("");
    setIsModalOpen(true);
  };

  // Mở modal sửa danh mục
  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setError("");
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryName("");
    setError("");
  };

  // Thêm hoặc sửa danh mục
  const handleSubmit = () => {
    if (!categoryName.trim()) {
      setError("Vui lòng nhập tên danh mục");
      return;
    }

    // Kiểm tra trùng tên (trừ chính nó nếu đang edit)
    const isDuplicate = categories.some(
      (cat) =>
        cat.name.toLowerCase() === categoryName.trim().toLowerCase() &&
        cat.id !== editingCategory?.id
    );

    if (isDuplicate) {
      setError("Danh mục này đã tồn tại");
      return;
    }

    if (editingCategory) {
      // Sửa danh mục
      const updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.id
          ? { ...cat, name: categoryName.trim() }
          : cat
      );
      saveCategories(updatedCategories);
      toast.success("Cập nhật danh mục thành công");
    } else {
      // Thêm danh mục mới
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryName.trim(),
        productCount: 0,
      };
      saveCategories([...categories, newCategory]);
      toast.success("Thêm danh mục thành công");
    }

    handleCloseModal();
  };

  // ✅ Mở modal xác nhận xóa
  const handleOpenDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  // ✅ Đóng modal xác nhận xóa
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  // ✅ Xác nhận xóa danh mục
  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);

    // Giả lập delay để hiển thị loading state
    setTimeout(() => {
      const updatedCategories = categories.filter(
        (cat) => cat.id !== categoryToDelete.id
      );
      saveCategories(updatedCategories);

      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      toast.success("Đã xóa danh mục");
    }, 500);
  };

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

                {/* ✅ LOGIC SỬA ĐỔI TẠI ĐÂY */}
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
                  <Trash2 style={{
                    opacity: category.productCount > 0 ? 0.5 : 1,
                    cursor: category.productCount > 0 ? "not-allowed" : "pointer",
                  }} size={16} />
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

      {/* ✅ Modal Confirm Delete */}
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
