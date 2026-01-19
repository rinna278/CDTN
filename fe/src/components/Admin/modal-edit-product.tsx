import { useState, useEffect } from "react";
import { X, Upload, Trash2, AlertCircle, Plus } from "lucide-react";
import "./modal-edit-product.css";
import { updateProduct, uploadImage } from "../../services/apiService";
import { toast } from "react-toastify";
import ImageCropModal from "./image-crop-modal";
import { useCategories } from "./useCategories";
// 1. Import Global Type
import { Product } from "../../types/type";

// 2. Định nghĩa alias khớp với cấu trúc trong services/apiService.ts và types/type.ts
// Để dùng cho State quản lý form
type ProductImage = { url: string; publicId: string };
type ProductVariant = {
  color: string;
  image: ProductImage | null;
  stock: number;
};

interface ModalEditProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // 3. Sử dụng Product từ Global Type
  product: Product | null;
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

  // Ảnh chung (Sử dụng Type ProductImage)
  const [imageObjects, setImageObjects] = useState<ProductImage[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

  // ✅ Variants (Sử dụng Type ProductVariant)
  const [variants, setVariants] = useState<ProductVariant[]>([]);

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
        category: product.category || "", // Giờ đây category là string (từ Global Type)
        description: product.description || "",
        discount: product.discount?.toString() || "",
        status: product.status?.toString() || "1",
      });

      setSelectedOccasions(product.occasions || []);

      // Normalize ảnh chung
      const rawImages = (product.images || []) as any[];

      const validImages: ProductImage[] = rawImages.map((img) => {
        if (typeof img === "string") {
          return { url: img, publicId: "" };
        }
        return img; // Giả định img đã đúng cấu trúc {url, publicId}
      });

      setExistingImages(validImages);

      const validVariants: ProductVariant[] = (product.variants || []).map(
        (v) => ({
          color: v.color || "",
          image: v.image && v.image.url ? v.image : null, // ✅ Null thay vì empty object
          stock: v.stock || 0,
        })
      );
      setVariants(validVariants);

      setImagePreview([]);
      setImageObjects([]);
      setErrors({});
    }
  }, [isOpen, product]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "discount") {
      // Cho phép rỗng
      if (value === "") {
        setFormData((prev) => ({ ...prev, discount: "" }));
        return;
      }

      // Chỉ cho số (loại -, +, e, ký tự lạ)
      if (!/^\d+$/.test(value)) return;

      const num = Number(value);

      // Không cho số âm, giới hạn 0 - 100
      if (num < 0 || num > 100) return;

      setFormData((prev) => ({ ...prev, discount: value }));

      if (errors.discount) {
        setErrors((prev) => ({ ...prev, discount: "" }));
      }
      return;
    }

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
    setVariants((prev) => [...prev, { color: "", image: null, stock: 0 }]);
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
        image: null,
      };
      return updated;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

   const nameProductRegex =
     /^(?!\s)(?!.*\s$)(?=(?:.*.){5,})[^~`!@#$%^&*=:;"']+$/;

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sản phẩm";
    if (!nameProductRegex.test(formData.name)){
      newErrors.name = "Tên sản phẩm không hợp lệ"
    }
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Giá không hợp lệ";
    if (!formData.category) newErrors.category = "Vui lòng chọn danh mục";

    // Validate variants
    const validVariants = variants.filter(
      (v) => v.color.trim() && v.image !== null && v.stock >= 0
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

  // ✅ THAY THẾ HÀM handleSubmit TRONG modal-edit-product.tsx

 const handleSubmit = async () => {
   if (!validateForm() || !product) {
     toast.error("Vui lòng kiểm tra lại thông tin sản phẩm");
     return;
   }

   setIsSubmitting(true);
   setErrors({});

   try {
     const allImages = [...existingImages, ...imageObjects];

     // ✅ Lọc và format variants - PHẢI CÓ reservedStock
     const validVariants = variants
       .filter((v) => v.color.trim() && v.image !== null && v.stock >= 0)
       .map((v) => ({
         color: v.color.trim(),
         image: {
           url: v.image!.url,
           publicId: v.image!.publicId,
         },
         stock: Number(v.stock),
       }));

     console.log("📦 Valid variants:", validVariants);

     const payload = {
       name: formData.name.trim(),
       price: Number(formData.price),
       description: formData.description?.trim() || undefined,
       discount: formData.discount ? Number(formData.discount) : undefined,
       category: formData.category,
       images: allImages,
       occasions: selectedOccasions.length > 0 ? selectedOccasions : undefined,
       variants: validVariants, // ✅ Sử dụng validVariants đã có reservedStock
       status: Number(formData.status),
     };

     console.log("📦 Update payload:", JSON.stringify(payload, null, 2));

     await updateProduct(product.id, payload);

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
     console.error("Error response: ", error.response);
     const statusCode = error.response?.status;
     const serverMessage = error.response?.data?.message;

     let displayError = "Có lỗi xảy ra, vui lòng thử lại";

     if (serverMessage) {
       if (Array.isArray(serverMessage)) {
         displayError = serverMessage.join(", ");
       } else {
         displayError = serverMessage;
       }
     }

     if (statusCode) {
       console.error(`❌ Status: ${statusCode}`);
       displayError = `[${statusCode}] ${displayError}`;
     }

     setErrors({ submit: displayError });
     toast.error(displayError);
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
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
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
                          onKeyDown={(e) => {
                            if (["-", "+", "e", "E"].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
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
                        {variant.image !== null && variant.image.url ? (
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
