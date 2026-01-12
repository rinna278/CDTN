import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import "./modal-create-product.css";
import { postCreateProduct, uploadImage } from "../../services/apiService";
import { toast } from "react-toastify";
import ImageCropModal from "./image-crop-modal";
import { useCategories } from "./useCategories";

interface ModalCreateProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductVariant {
  id: string; // ✅ Thêm ID để quản lý list variant ổn định hơn
  color: string;
  image: { url: string; publicId: string } | null;
  stock: number | "";
}

const ModalCreateProduct = ({
  isOpen,
  onClose,
  onSuccess,
}: ModalCreateProductProps) => {
  const categories = useCategories();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    discount: "",
    status: "1",
  });

  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

  // ✅ Ảnh chung của product
  const [imageObjects, setImageObjects] = useState<
    Array<{ url: string; publicId: string }>
  >([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  // ✅ Quản lý variants (Có thêm ID)
  const [variants, setVariants] = useState<ProductVariant[]>([
    { id: crypto.randomUUID(), color: "", image: null, stock: "" },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // State cho crop modal
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentImageForCrop, setCurrentImageForCrop] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [cropTarget, setCropTarget] = useState<{
    type: "general" | "variant";
    variantIndex?: number;
  }>({ type: "general" });

  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage("");
      setErrors({});
    }
  }, [isOpen]);

  const occasions = [
    { value: "birthday", label: "Sinh nhật" },
    { value: "decorate", label: "Trang trí" },
    { value: "wedding", label: "Đám cưới" },
    { value: "graduate", label: "Tốt nghiệp" },
    { value: "funeral", label: "Tang lễ" },
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

  const handleOccasionToggle = (value: string) => {
    setSelectedOccasions((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // ✅ Upload ảnh chung
  const handleGeneralImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const file = files[0];
    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      toast.error("Chỉ chấp nhận ảnh (JPG, PNG, WEBP)");
      return;
    }

    if (imageObjects.length >= 5) {
      toast.error("Tối đa 5 ảnh chung");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentImageForCrop(reader.result as string);
      setCurrentFileName(file.name);
      setCropTarget({ type: "general" });
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ✅ Upload ảnh cho variant
  const handleVariantImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = e.target.files;
    if (!files) return;

    const file = files[0];
    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      toast.error("Chỉ chấp nhận ảnh (JPG, PNG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentImageForCrop(reader.result as string);
      setCurrentFileName(file.name);
      setCropTarget({ type: "variant", variantIndex: index });
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ✅ Xử lý kết quả crop
  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);

    try {
      const croppedFile = new File([croppedBlob], currentFileName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      const result = await uploadImage(croppedFile);

      if (cropTarget.type === "general") {
        setImageObjects((prev) => [
          ...prev,
          { url: result.secureUrl, publicId: result.publicId },
        ]);

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(croppedFile);
      } else if (
        cropTarget.type === "variant" &&
        cropTarget.variantIndex !== undefined
      ) {
        setVariants((prev) => {
          const updated = [...prev];
          updated[cropTarget.variantIndex!] = {
            ...updated[cropTarget.variantIndex!],
            image: { url: result.secureUrl, publicId: result.publicId },
          };
          return updated;
        });
      }

      toast.success("Upload ảnh thành công!");
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(
        "Upload ảnh thất bại: " + (error.message || "Lỗi không xác định")
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageObjects((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Quản lý variants
  const handleVariantChange = (
    index: number,
    field: "color" | "stock",
    value: string | number
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { id: crypto.randomUUID(), color: "", image: null, stock: 0 },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) {
      toast.error("Phải có ít nhất 1 variant");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVariantImage = (index: number) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], image: null };
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sản phẩm";
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Giá không hợp lệ";
    if (!formData.category) newErrors.category = "Vui lòng chọn danh mục";
    if (
      formData.discount &&
      (Number(formData.discount) < 0 || Number(formData.discount) > 100)
    ) {
      newErrors.discount = "Tỉ lệ khuyến mãi không hợp lệ";
    }

    // Kiểm tra ảnh chung (Nếu backend yêu cầu)
    if (imageObjects.length === 0) {
      // Bạn có thể bỏ comment dòng dưới nếu bắt buộc phải có ảnh chung
      // newErrors.images = "Vui lòng thêm ít nhất 1 ảnh chung";
    }

    // Validate variants
    const validVariants = variants.filter(
      (v) => v.color.trim() && v.image && Number(v.stock) >= 0
    );

    if (validVariants.length === 0) {
      newErrors.variants =
        "Phải có ít nhất 1 variant hợp lệ (có màu, ảnh, tồn kho >= 0)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      description: "",
      discount: "",
      status: "1",
    });
    setSelectedOccasions([]);
    setImageObjects([]);
    setImagePreview([]);
    // Reset variants về trạng thái mặc định
    setVariants([
      { id: crypto.randomUUID(), color: "", image: null, stock: 0 },
    ]);
    setErrors({});
    onClose();
  };

  // ✅ HÀM SUBMIT ĐÃ SỬA
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin sản phẩm");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // ✅ Lọc và format variants - CHỈ MAP MỘT LẦN
      const validVariants = variants
        .filter((v) => v.color.trim() && v.image && v.image.url)
        .map((v) => ({
          color: v.color.trim(), // ✅ Trim ngay ở đây
          image: {
            url: v.image!.url,
            publicId: v.image!.publicId,
          },
          stock: Number(v.stock),
        }));

      // ✅ Kiểm tra variants trước khi submit
      if (validVariants.length === 0) {
        toast.error("Phải có ít nhất 1 variant hợp lệ");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        description: formData.description?.trim() || undefined,
        discount: formData.discount ? Number(formData.discount) : undefined,
        category: formData.category,
        images: imageObjects,
        occasions: selectedOccasions.length > 0 ? selectedOccasions : undefined,
        variants: validVariants, // ✅ Sử dụng trực tiếp, không map lại
        status: Number(formData.status),
      };

      console.log("📦 Payload sending:", JSON.stringify(payload, null, 2));

      const response = await postCreateProduct(payload);
      console.log("✅ Response:", response);

      toast.success("Thêm sản phẩm thành công");
      setSuccessMessage("Thêm sản phẩm thành công!");

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error("❌ Error Creating Product:", error);
      console.error("❌ Error Response:", error.response?.data);

      // ✅ Xử lý lỗi chi tiết
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      let displayError = "Có lỗi xảy ra, vui lòng thử lại";

      if (serverMessage) {
        if (Array.isArray(serverMessage)) {
          displayError = serverMessage.join(", ");
        } else {
          displayError = serverMessage;
        }
      }

      // ✅ Hiển thị status code để debug
      if (error.response?.status) {
        console.error(`❌ Status Code: ${error.response.status}`);
        displayError = `[${error.response.status}] ${displayError}`;
      }

      setErrors({ submit: displayError });
      toast.error("Lỗi: " + displayError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}>
        <div
          className="modal-content-create-product"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header-create-product">
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
                {errors.price && (
                  <span className="err-text">{errors.price}</span>
                )}
              </div>

              <div className="form-group width-input-small-1">
                <label>Giảm giá (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="%"
                  min="0"
                  max="100"
                />
                {errors.discount && (
                  <span className="err-text">{errors.discount}</span>
                )}
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
                    <option value="" disabled>
                      -- Chọn danh mục --
                    </option>
                    {categories.map((cat: any) => (
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
                    <option value="1">Đang bán</option>
                    <option value="0">Ngừng bán</option>
                    <option value="2">Hết hàng</option>
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

              <div className="form-group full-width">
                <label>
                  Dịp sử dụng <small>(Chọn một hoặc nhiều)</small>
                </label>
                <div className="occasions-grid">
                  {occasions.map((occasion) => (
                    <label key={occasion.value} className="occasion-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedOccasions.includes(occasion.value)}
                        onChange={() => handleOccasionToggle(occasion.value)}
                      />
                      <span className="checkbox-label">{occasion.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ✅ Ảnh chung */}
              <div className="form-group full-width">
                <label>Hình ảnh chung ({imagePreview.length}/5)</label>
                <div className="upload-area full-width-2">
                  <input
                    type="file"
                    id="img-upload"
                    accept="image/*"
                    onChange={handleGeneralImageChange}
                    hidden
                    disabled={imageObjects.length >= 5 || isUploading}
                  />
                  <label
                    htmlFor="img-upload"
                    className={`upload-label ${
                      imageObjects.length >= 5 || isUploading ? "disabled" : ""
                    }`}
                  >
                    <Upload size={32} />
                    <span>
                      {isUploading
                        ? "Đang upload ảnh..."
                        : imageObjects.length >= 5
                        ? "Đã đạt giới hạn 5 ảnh"
                        : "Click để chọn ảnh chung"}
                    </span>
                  </label>
                </div>

                {errors.images && (
                  <span
                    className="err-text"
                    style={{ display: "block", marginTop: "5px" }}
                  >
                    {errors.images}
                  </span>
                )}

                {imagePreview.length > 0 && (
                  <div className="preview-grid">
                    {imagePreview.map((src, idx) => (
                      <div key={idx} className="preview-item">
                        <img src={src} alt="Preview" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          disabled={isUploading}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ✅ Variants Section */}
              <div className="form-group full-width">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label>
                    Màu sắc & Tồn kho <span className="req">*</span>
                  </label>
                  <button
                    type="button"
                    className="btn-add-variant"
                    onClick={addVariant}
                    disabled={isUploading}
                  >
                    <Plus size={16} /> Thêm màu
                  </button>
                </div>
                {errors.variants && (
                  <span className="err-text">{errors.variants}</span>
                )}

                <div className="variants-container">
                  {variants.map((variant, index) => (
                    <div key={variant.id} className="variant-item">
                      <div className="variant-header">
                        <span>Màu {index + 1}</span>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="btn-remove-variant"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      <div className="variant-fields">
                        <input
                          type="text"
                          placeholder="Tên màu (VD: Đỏ, Xanh)"
                          value={variant.color}
                          className="name-color"
                          onChange={(e) =>
                            handleVariantChange(index, "color", e.target.value)
                          }
                        />
                        <input
                          type="number"
                          placeholder="Tồn kho"
                          className="stock-color"
                          value={variant.stock}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "stock",
                              Number(e.target.value)
                            )
                          }
                          min="0"
                        />
                      </div>

                      <div className="variant-image-upload">
                        <input
                          type="file"
                          id={`variant-img-${index}`}
                          accept="image/*"
                          onChange={(e) => handleVariantImageChange(e, index)}
                          hidden
                          disabled={isUploading}
                        />
                        {variant.image ? (
                          <div className="variant-image-preview">
                            <img src={variant.image.url} alt={variant.color} />
                            <button
                              type="button"
                              onClick={() => removeVariantImage(index)}
                              className="btn-remove-image"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor={`variant-img-${index}`}
                            className="variant-upload-label"
                          >
                            <Upload size={20} />
                            <span>Upload ảnh cho màu này</span>
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting || isUploading}
            >
              Hủy bỏ
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? <span className="loader"></span> : "Tạo Sản Phẩm"}
            </button>
          </div>
        </div>
      </div>

      <ImageCropModal
        isOpen={isCropModalOpen}
        imageUrl={currentImageForCrop}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

export default ModalCreateProduct;
