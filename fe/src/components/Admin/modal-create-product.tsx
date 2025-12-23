import { useState, useEffect } from "react";
import { X, Upload, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import "./modal-create-product.css";
import { postCreateProduct } from "../../services/apiService";
import { toast } from "react-toastify";

interface ModalCreateProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalCreateProduct = ({
  isOpen,
  onClose,
  onSuccess,
}: ModalCreateProductProps) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    discount: "",
    color: "",
    occasions: "",
    status: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Reset form khi đóng modal
  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage("");
      setErrors({});
    }
  }, [isOpen]);

  const categories = [
    "Hoa Hồng",
    "Hoa Tulip",
    "Hoa Cúc",
    "Hoa Ly",
    "Hoa Lan",
    "Hoa Hướng Dương",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      setErrors((prev) => ({
        ...prev,
        images: "Chỉ chấp nhận ảnh (JPG, PNG, WEBP)",
      }));
      return;
    }

    if (images.length + validFiles.length > 5) {
      setErrors((prev) => ({ ...prev, images: "Tối đa 5 ảnh" }));
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

    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sản phẩm";
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Giá không hợp lệ";
    if (!formData.stock || Number(formData.stock) < 0)
      newErrors.stock = "Số lượng không hợp lệ";
    if (!formData.category) newErrors.category = "Vui lòng chọn danh mục";
    if (!formData.discount || Number(formData.discount) <0 || Number(formData.discount) > 100)
        newErrors.discount = 'Tỉ lệ khuyến mãi không hợp lệ';
    if (Number(formData.stock) > 0){
      formData.status = '1';
    }
    if (Number(formData.stock) === 0){
      formData.status = '0';
    }
 
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
      status: "",
    });
    setImages([]);
    setImagePreview([]);
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const occasionsArray = formData.occasions
        ? formData.occasions
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const imageUrls: string[] = [];
      for (const file of images) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        imageUrls.push(base64);
      }

      // 3. Chuẩn bị payload body
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description,
        discount: formData.discount ? Number(formData.discount) : 0,
        category: formData.category,
        images: imageUrls,
        color: formData.color,
        occasions: occasionsArray,
        status: Number(formData.status),
      };

      const response = await postCreateProduct(payload);


      if (response && response.status === 400) {
        throw new Error(response.error);
      }
      toast.success("Thêm sản phẩm thành công");
      setSuccessMessage("Thêm sản phẩm thành công!");

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi:", error);
      setErrors({
        submit: error.message || "Có lỗi xảy ra, vui lòng thử lại.",
      });
      toast.error('Thêm sản phẩm thất bại, vui lòng kiểm tra thông tin');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Thêm Sản Phẩm Mới</h2>
            <p className="modal-subtitle">
              Điền thông tin chi tiết cho sản phẩm của bạn
            </p>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {successMessage && (
            <div className="alert success">
              <CheckCircle size={20} /> {successMessage}
            </div>
          )}
          {errors.submit && (
            <div className="alert error">
              <AlertCircle size={20} /> {errors.submit}
            </div>
          )}

          {/* Form Content */}
          <div className="form-grid">
            <div className="form-group full-width">
              <label>
                Tên sản phẩm <span className="req">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tên sản phẩm"
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="err-text">{errors.name}</span>}
            </div>

            <div className="form-group width-input-small-1">
              <label>
                Giá (VNĐ) <span className="req">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Giá sản phẩm"
                className={errors.price ? "input-error" : ""}
              />
              {errors.price && <span className="err-text">{errors.price}</span>}
            </div>

            <div className="form-group width-input-small-1">
              <label>
                Tồn kho <span className="req">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Số lượng tồn kho"
                className={errors.stock ? "input-error" : ""}
              />
              {errors.stock && <span className="err-text">{errors.stock}</span>}
            </div>

            <div className="form-group width-input-small-2">
              <label>
                Danh mục <span className="req">*</span>
              </label>
              <div className="select-wrapper">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? "input-error" : ""}
                >
                  <option value="" disabled selected>-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <span className="err-text">{errors.category}</span>
              )}
            </div>

            <div className="form-group width-input-small-2">
              <label>Trạng thái</label>
              <div className="select-wrapper">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="" selected disabled>-- Chọn trạng thái mặt hàng --</option>
                  <option value="1">Đang bán</option>
                  <option value="0">Ngừng bán</option>
                  <option value="2">Chưa biết</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Mô tả sản phẩm</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về sản phẩm..."
                rows={3}
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
              <label>Hình ảnh ({imagePreview.length}/5)</label>
              <div className="upload-area full-width-2">
                <input
                  type="file"
                  id="img-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  hidden
                />
                <label htmlFor="img-upload" className="upload-label">
                  <Upload size={32} />
                  <span>Click để chọn hoặc kéo thả ảnh vào đây</span>
                  <small>Hỗ trợ JPG, PNG, WEBP</small>
                </label>
              </div>
              {errors.images && (
                <span className="err-text">{errors.images}</span>
              )}

              {imagePreview.length > 0 && (
                <div className="preview-grid">
                  {imagePreview.map((src, idx) => (
                    <div key={idx} className="preview-item">
                      <img src={src} alt="Preview" />
                      <button type="button" onClick={() => removeImage(idx)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
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
            {isSubmitting ? <span className="loader"></span> : "Tạo Sản Phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCreateProduct;
