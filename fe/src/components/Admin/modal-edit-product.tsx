import { useState, useEffect } from "react";
import { X, Upload, Trash2, AlertCircle, Plus } from "lucide-react";
import "./modal-edit-product.css";
import { updateProduct, uploadImage } from "../../services/apiService";
import { toast } from "react-toastify";
import ImageCropModal from "./image-crop-modal";
import { useCategories } from "./useCategories";

interface IImage {
  url: string;
  publicId: string;
}

interface IVariant {
  color: string;
  image: IImage;
  stock: number;
}

interface IProduct {
  id: string;
  name: string;
  price: string | number;
  category: string;
  description?: string;
  discount?: number;
  images?: (string | IImage)[];
  occasions?: string[];
  status?: number;
  variants: IVariant[];
  totalStock: number;
}

interface ModalEditProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: IProduct | null;
}

const ModalEditProduct: React.FC<ModalEditProductProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}) => {
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

  // Ảnh chung
  const [imageObjects, setImageObjects] = useState<IImage[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<IImage[]>([]);

  // ✅ Variants
  const [variants, setVariants] = useState<IVariant[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentImageForCrop, setCurrentImageForCrop] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [cropTarget, setCropTarget] = useState<{
    type: "general" | "variant";
    variantIndex?: number;
  }>({ type: "general" });

  const occasionsList = [
    { value: "birthday", label: "Sinh nhật" },
    { value: "decorate", label: "Trang trí" },
    { value: "wedding", label: "Đám cưới" },
    { value: "graduate", label: "Tốt nghiệp" },
    { value: "funeral", label: "Tang lễ" },
  ];

  useEffect(() => {
    if (isOpen && product) {
      console.log("📦 Product data:", product);

      setFormData({
        name: product.name || "",
        price: product.price.toString() || "",
        category: product.category || "",
        description: product.description || "",
        discount: product.discount?.toString() || "",
        status: product.status?.toString() || "1",
      });

      setSelectedOccasions(product.occasions || []);

      // Normalize ảnh chung
      const validImages: IImage[] = Array.isArray(product.images)
        ? product.images.map((img) => {
            if (typeof img === "string") {
              return { url: img, publicId: "" };
            }
            return img;
          })
        : [];
      setExistingImages(validImages);

      // ✅ Set variants từ product
      setVariants(product.variants || []);

      setImagePreview([]);
      setImageObjects([]);
      setErrors({});
    }
  }, [isOpen, product]);

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

  // Upload ảnh chung
  const handleGeneralImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh (JPG, PNG, WEBP)");
      return;
    }

    const totalImages = existingImages.length + imageObjects.length + 1;
    if (totalImages > 5) {
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

  // Upload ảnh cho variant
  const handleVariantImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const files = e.target.files;
    if (!files) return;

    const file = files[0];
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
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

  const removeNewImage = (index: number) => {
    setImageObjects((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
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
      { color: "", image: { url: "", publicId: "" }, stock: 0 },
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
      updated[index] = {
        ...updated[index],
        image: { url: "", publicId: "" },
      };
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sản phẩm";
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Giá không hợp lệ";
    if (!formData.category) newErrors.category = "Vui lòng chọn danh mục";

    // Validate variants
    const validVariants = variants.filter(
      (v) => v.color.trim() && v.image.url && v.stock >= 0
    );
    if (validVariants.length === 0) {
      newErrors.variants = "Phải có ít nhất 1 variant hợp lệ";
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
    setExistingImages([]);
    setVariants([]);
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    if (!validateForm() || !product) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const allImages = [...existingImages, ...imageObjects];

      // Lọc variants hợp lệ
      const validVariants = variants.filter(
        (v) => v.color.trim() && v.image.url && v.stock >= 0
      );

      // ✅ Tính tổng stock từ tất cả variants
      const totalStock = validVariants.reduce((sum, v) => sum + v.stock, 0);

      await updateProduct(
        product.id,
        formData.name,
        Number(formData.price),
        totalStock, // ✅ Thêm tham số stock (tổng từ variants)
        formData.description,
        formData.discount ? Number(formData.discount) : 0,
        formData.category,
        allImages,
        selectedOccasions,
        validVariants, // ✅ Gửi variants
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
      const statusCode = error.response?.status;
      const message = error.response?.data?.message;

      if (statusCode === 400) {
        toast.error(
          Array.isArray(message)
            ? message.join(", ")
            : message || "Dữ liệu không hợp lệ"
        );
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
    <>
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header-edit-product">
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

          <div className="modal-body">
            {errors.submit && (
              <div className="error-banner">
                <AlertCircle size={20} />
                {errors.submit}
              </div>
            )}

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
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
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

              <div className="form-group full-width">
                <label>
                  Dịp sử dụng <small>(Chọn một hoặc nhiều)</small>
                </label>
                <div className="occasions-grid">
                  {occasionsList.map((occasion) => (
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

              {/* Ảnh chung */}
              <div className="form-group full-width">
                <label>
                  Hình ảnh chung ({existingImages.length + imagePreview.length}
                  /5)
                </label>

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
                      {existingImages.map((imgObj, idx) => (
                        <div key={`existing-${idx}`} className="preview-item">
                          <img src={imgObj.url} alt={`Existing ${idx + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            className="remove-image-btn"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div
                  className="upload-area full-width-2"
                  style={{ marginTop: "12px" }}
                >
                  <input
                    type="file"
                    id="img-upload-edit"
                    accept="image/*"
                    onChange={handleGeneralImageChange}
                    hidden
                    disabled={
                      existingImages.length + imageObjects.length >= 5 ||
                      isUploading
                    }
                  />
                  <label
                    htmlFor="img-upload-edit"
                    className={`upload-label ${
                      existingImages.length + imageObjects.length >= 5 ||
                      isUploading
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <Upload size={32} />
                    <span>
                      {isUploading
                        ? "Đang upload ảnh..."
                        : "Thêm ảnh chung mới"}
                    </span>
                  </label>
                </div>

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
                          <img src={src} alt={`New Preview ${idx + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeNewImage(idx)}
                            disabled={isUploading}
                            className="remove-image-btn"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
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
                    Màu sắc & Tồn kho <span className="required">*</span>
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
                  <span className="error-text">{errors.variants}</span>
                )}

                <div className="variants-container">
                  {variants.map((variant, index) => (
                    <div key={index} className="variant-item">
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
                          onChange={(e) =>
                            handleVariantChange(index, "color", e.target.value)
                          }
                        />
                        <input
                          type="number"
                          placeholder="Tồn kho"
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
                          id={`variant-img-edit-${index}`}
                          accept="image/*"
                          onChange={(e) => handleVariantImageChange(e, index)}
                          hidden
                          disabled={isUploading}
                        />
                        {variant.image && variant.image.url ? (
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
                            htmlFor={`variant-img-edit-${index}`}
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
              {isSubmitting ? <span className="loader"></span> : "Cập Nhật"}
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

export default ModalEditProduct;
