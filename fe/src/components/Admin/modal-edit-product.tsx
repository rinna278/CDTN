import { useState, useEffect } from "react";
import { X, Upload, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import "./modal-edit-product.css";
import { updateProduct } from "../../services/apiService";
import { toast } from "react-toastify";

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
}

interface ModalEditProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: IProduct | null;
}

const ModalEditProduct = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}: ModalEditProductProps) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    discount: "",
    color: "",
    occasions: "",
    status: "1",
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Hoa Hồng",
    "Hoa Tulip",
    "Hoa Cúc",
    "Hoa Ly",
    "Hoa Lan",
    "Hoa Hướng Dương",
  ];

  // Load dữ liệu sản phẩm khi modal mở
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name || "",
        price: product.price.toString() || "",
        stock: product.stock.toString() || "",
        category: product.category || "",
        description: product.description || "",
        discount: product.discount?.toString() || "",
        color: product.color || "",
        occasions: product.occasions?.join(", ") || "",
        status: product.status?.toString() || "1",
      });
      setExistingImages(product.images || []);
      setImagePreview([]);
      setImages([]);
      setErrors({});
    }
  }, [isOpen, product]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) =>
      ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)
    );

    if (validFiles.length !== fileArray.length) {
      toast.error("Chỉ chấp nhận ảnh (JPG, PNG, WEBP)");
      return;
    }

    const totalImages =
      existingImages.length + images.length + validFiles.length;
    if (totalImages > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sản phẩm";
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Giá không hợp lệ";
    if (!formData.stock || Number(formData.stock) < 0)
      newErrors.stock = "Số lượng không hợp lệ";
    if (!formData.category) newErrors.category = "Vui lòng chọn danh mục";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setFormData({
      name: "",
      price: "",
      stock: "",
      category: "",
      description: "",
      discount: "",
      color: "",
      occasions: "",
      status: "1",
    });
    setImages([]);
    setImagePreview([]);
    setExistingImages([]);
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    if (!validateForm() || !product) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Xử lý occasions
      const occasionsArray = formData.occasions
        ? formData.occasions
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      // Chuyển ảnh mới thành Base64
      const newImageUrls: string[] = [];
      for (const file of images) {
        const reader = new FileReader();
        const base64: string = await new Promise((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
        newImageUrls.push(base64);
      }

      // Gộp ảnh cũ và ảnh mới
      const allImages = [...existingImages, ...newImageUrls];

      // Gọi API
      await updateProduct(
        product.id,
        formData.name,
        Number(formData.price),
        Number(formData.stock),
        formData.description,
        formData.discount ? Number(formData.discount) : 0,
        formData.category,
        allImages,
        formData.color,
        occasionsArray,
        Number(formData.status)
      );

      toast.success("Cập nhật sản phẩm thành công!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi:", error);

      // Xử lý lỗi từ backend
      const statusCode = error.response?.status;
      const message = error.response?.data?.message;

      if (statusCode === 400) {
        toast.error(
          Array.isArray(message)
            ? message.join(", ")
            : message || "Dữ liệu không hợp lệ"
        );
      } else if (statusCode === 401) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      } else if (statusCode === 403) {
        toast.error("Bạn không có quyền thực hiện thao tác này");
      } else if (statusCode === 404) {
        toast.error("Không tìm thấy sản phẩm");
      } else if (statusCode === 500) {
        toast.error("Lỗi máy chủ, vui lòng thử lại sau");
      } else {
        toast.error(message || "Có lỗi xảy ra, vui lòng thử lại");
      }

      setErrors({
        submit: message || "Có lỗi xảy ra, vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Chỉnh Sửa Sản Phẩm</h2>
            <p className="modal-subtitle">
              Cập nhật thông tin sản phẩm #{product.id}
            </p>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {errors.submit && (
            <div className="error-banner">
              <AlertCircle size={20} />
              {errors.submit}
            </div>
          )}

          {/* Form Content */}
          <div className="form-grid">
            <div className="form-group full-width">
              <label>
                Tên sản phẩm <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên sản phẩm"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group width-input-small-1">
              <label>
                Giá (VNĐ) <span className="required">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Giá sản phẩm"
                min="0"
              />
              {errors.price && (
                <span className="error-text">{errors.price}</span>
              )}
            </div>

            <div className="form-group width-input-small-1">
              <label>
                Tồn kho <span className="required">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Số lượng tồn kho"
                min="0"
              />
              {errors.stock && (
                <span className="error-text">{errors.stock}</span>
              )}
            </div>

            <div className="form-group width-input-small-2">
              <label>
                Danh mục <span className="required">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="error-text">{errors.category}</span>
              )}
            </div>

            <div className="form-group width-input-small-2">
              <label>Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="" selected disabled>
                  -- Chọn trạng thái mặt hàng --
                </option>
                <option value="1">Đang bán</option>
                <option value="0">Ngừng bán</option>
                <option value="2">Hết hàng</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Mô tả sản phẩm</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Mô tả chi tiết về sản phẩm..."
              />
            </div>

            <div className="form-group width-input-small-1">
              <label>Giảm giá (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="Nhập % giảm giá"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group width-input-small-1">
              <label>Màu sắc</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Màu sản phẩm"
              />
            </div>

            <div className="form-group full-width">
              <label>
                Dịp sử dụng <small>(Phân cách bằng dấu phẩy)</small>
              </label>
              <input
                type="text"
                name="occasions"
                value={formData.occasions}
                onChange={handleChange}
                placeholder="Sinh nhật, 8/3, Valentine..."
              />
            </div>

            <div className="form-group full-width">
              <label>
                Hình ảnh ({existingImages.length + imagePreview.length}/5)
              </label>

              {/* Hiển thị ảnh cũ */}
              {existingImages.length > 0 && (
                <>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginBottom: "8px",
                    }}
                  >
                    Ảnh hiện tại:
                  </p>
                  <div className="preview-grid">
                    {existingImages.map((src, idx) => (
                      <div key={`existing-${idx}`} className="preview-item">
                        <img src={src} alt="Existing" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Upload ảnh mới */}
              <div className="upload-area full-width-2" style={{ marginTop: "12px" }}>
                <input
                  type="file"
                  id="img-upload-edit"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  hidden
                />
                <label htmlFor="img-upload-edit" className="upload-label">
                  <Upload size={32} />
                  <span>Thêm ảnh mới</span>
                  <small>Hỗ trợ JPG, PNG, WEBP</small>
                </label>
              </div>

              {/* Hiển thị ảnh mới */}
              {imagePreview.length > 0 && (
                <>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    Ảnh mới thêm:
                  </p>
                  <div className="preview-grid">
                    {imagePreview.map((src, idx) => (
                      <div key={`new-${idx}`} className="preview-item">
                        <img src={src} alt="New Preview" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="loader"></span> : "Cập Nhật"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditProduct;
