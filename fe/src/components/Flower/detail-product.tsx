import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductByID,
  getAllProduct,
  postAddToCart,
  postCreateOrder,
} from "../../services/apiService";
import "./detail-product.css";
import { toast } from "react-toastify";
import { Product, CreateOrderPayload } from "../../types/type";
import { fetchCartFromServer } from "../../redux/reducer+action/cartSlice";
import { useDispatch } from "react-redux";
import CheckoutModal from "../Checkout/checkout-modal";

interface ProductVariant {
  color: string;
  image: {
    url: string;
    publicId: string;
  };
  stock: number;
  reservedStock: number;
}

interface DetailProductProps {
  selected?: string;
  setSelected?: React.Dispatch<React.SetStateAction<string>>;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN").format(price) + " VND";
};

const getImageUrl = (images?: any[]): string => {
  const defaultImage =
    "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp";
  if (!images || images.length === 0) return defaultImage;

  const firstImage = images[0];
  if (firstImage && typeof firstImage === "object" && firstImage.url) {
    return firstImage.url;
  }
  if (typeof firstImage === "string") {
    return firstImage;
  }
  return defaultImage;
};

const DetailProduct: React.FC<DetailProductProps> = ({
  selected,
  setSelected,
}) => {
  const dispatch = useDispatch();
  const { productID } = useParams<{ productID: string }>();
  const navigate = useNavigate();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>(
    null,
  );

  const getAvailableStock = (variant: ProductVariant | null): number => {
    if (!variant) return 0;
    const reserved = variant.reservedStock || 0;
    return Math.max(0, variant.stock - reserved);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!productID) {
      setError("Không tìm thấy ID sản phẩm");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getProductByID(productID);

        if (response) {
          setProduct(response);
          initializeVariants(response);
        } else {
          throw new Error("Không tìm thấy sản phẩm");
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        if (err.response?.status === 404) {
          setError("PRODUCT_NOT_FOUND");
        } else if (err.message?.includes("hết hàng")) {
          setError("OUT_OF_STOCK");
        } else {
          setError("GENERAL_ERROR");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab("description");
  }, [productID]);

  const initializeVariants = (prod: Product) => {
    if (prod.variants && prod.variants.length > 0) {
      const colors = prod.variants
        .filter((v) => {
          const available = v.stock - (v.reservedStock || 0);
          return available > 0;
        })
        .map((v) => v.color);

      setAvailableColors(colors);

      if (colors.length > 0) {
        const firstColor = colors[0];
        setSelectedColor(firstColor);
        const variant = prod.variants.find((v) => v.color === firstColor);
        setCurrentVariant(variant || null);
      }
    }
  };

  const handleColorSelect = (color: string) => {
    if (!product || !product.variants) return;

    setSelectedColor(color);
    const variant = product.variants.find((v) => v.color === color);
    setCurrentVariant(variant || null);
    setQuantity(1);
  };

  useEffect(() => {
    if (!product) return;

    const fetchSimilarProducts = async () => {
      try {
        const response = await getAllProduct({
          page: 1,
          limit: 8,
          occasions: product.occasions,
          status: 1,
        });

        const filtered = (response.data || []).filter(
          (p) => p.id !== product.id,
        );
        setSimilarProducts(filtered.slice(0, 8));
      } catch (err) {
        console.error("Error fetching similar products:", err);
      }
    };

    fetchSimilarProducts();
  }, [product]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="error-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        {error === "PRODUCT_NOT_FOUND" ? (
          <>
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>🚫</div>
            <h2
              style={{
                fontSize: "28px",
                color: "#d32f2f",
                marginBottom: "10px",
              }}
            >
              Không tìm thấy sản phẩm
            </h2>
            <p
              style={{ fontSize: "16px", color: "#666", marginBottom: "30px" }}
            >
              Sản phẩm này đã ngừng bán hoặc hết hàng trong kho.
            </p>
          </>
        ) : error === "OUT_OF_STOCK" ? (
          <>
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>📦</div>
            <h2
              style={{
                fontSize: "28px",
                color: "#f57c00",
                marginBottom: "10px",
              }}
            >
              Sản phẩm đã hết hàng
            </h2>
            <p
              style={{ fontSize: "16px", color: "#666", marginBottom: "30px" }}
            >
              Rất tiếc, sản phẩm này hiện đã hết hàng. Vui lòng quay lại sau.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>⚠️</div>
            <h2
              style={{
                fontSize: "28px",
                color: "#d32f2f",
                marginBottom: "10px",
              }}
            >
              Có lỗi xảy ra
            </h2>
            <p
              style={{ fontSize: "16px", color: "#666", marginBottom: "30px" }}
            >
              Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.
            </p>
          </>
        )}
        <div style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "12px 30px",
              fontSize: "16px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Quay lại
          </button>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 30px",
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy sản phẩm</h2>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const displayImages =
    product.images && product.images.length > 0
      ? product.images
      : currentVariant?.image
        ? [currentVariant.image]
        : [];

  const imageUrls =
    displayImages.length > 0
      ? displayImages.map((img) => getImageUrl([img]))
      : [getImageUrl()];

  const handleAddToCart = async () => {
    if (!product?.id) {
      toast.error("Sản phẩm không tồn tại");
      return;
    }

    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc");
      return;
    }

    const availableStock = getAvailableStock(currentVariant);
    if (!currentVariant || availableStock < quantity) {
      toast.error("Không đủ hàng trong kho");
      return;
    }

    try {
      await postAddToCart(product.id, quantity, selectedColor);
      dispatch(fetchCartFromServer() as any);
      toast.success(
        `Đã thêm ${quantity} sản phẩm màu ${selectedColor} vào giỏ hàng`,
      );
    } catch (error: any) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      toast.error(
        error.response?.data?.message || "Không thể thêm vào giỏ hàng",
      );
    }
  };

  const handleBuyNow = () => {
    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc");
      return;
    }

    const availableStock = getAvailableStock(currentVariant);
    if (!currentVariant || availableStock < quantity) {
      toast.error("Không đủ hàng trong kho");
      return;
    }

    // Mở modal checkout với thông tin mua ngay
    setIsCheckoutOpen(true);
  };

  const handleConfirmBuyNow = async (orderData: CreateOrderPayload) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const res = await postCreateOrder(orderData);
      dispatch(fetchCartFromServer() as any);
      setIsCheckoutOpen(false);

      if (orderData.paymentMethod === "vnpay" && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        toast.success("Đặt hàng thành công! Cảm ơn bạn.");
        navigate("/profile?tab=orders");
      }
    } catch (error: any) {
      console.error("Lỗi đặt hàng:", error);
      toast.error(error.response?.data?.message || "Không thể tạo đơn hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimilarProductClick = (similarProduct: Product) => {
    navigate(`/detail-product/${similarProduct.id}`);
  };

  return (
    <div className="detail-product-page">
      <div className="breadcrumb">
        <span onClick={() => navigate("/")}>Shop</span>
        <span>/</span>
        <span className="active">{product.occasions?.[0] || product.name}</span>
      </div>

      <div className="product-main-section">
        <div className="product-images">
          <div className="thumbnail-list">
            {imageUrls.slice(0, 4).map((url, index) => (
              <div
                key={index}
                className={`thumbnail ${
                  selectedImage === index ? "active" : ""
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={url} alt={`${product.name} ${index + 1}`} />
              </div>
            ))}
          </div>
          <div className="main-image">
            <img src={imageUrls[selectedImage]} alt={product.name} />
          </div>
        </div>

        <div className="product-info-detail">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-price-section">
            {product.discount && product.discount > 0 ? (
              <span className="discount-badge">-{product.discount}%</span>
            ) : (
              <></>
            )}
            <div
              className={`prices ${!product.discount ? "single-price" : ""}`}
            >
              {product.discount && product.discount > 0 ? (
                <span className="old-price">{formatPrice(product.price)}</span>
              ) : (
                <></>
              )}
              <span className="current-price">
                {formatPrice(discountedPrice)}
              </span>
            </div>
          </div>

          <div className="stock-info">
            {currentVariant ? (
              currentVariant.stock > 0 ? (
                <span className="in-stock">
                  Còn {currentVariant.stock} sản phẩm (Màu {selectedColor})
                </span>
              ) : (
                <span className="out-of-stock">
                  Màu {selectedColor} đã hết hàng
                </span>
              )
            ) : (
              <span className="out-of-stock">Vui lòng chọn màu sắc</span>
            )}
          </div>

          <div className="color-selector">
            <span className="label">
              Màu sắc: {selectedColor && <strong>{selectedColor}</strong>}
            </span>
            <div className="color-options">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((variant, index) => (
                  <div
                    key={index}
                    className={`color-option ${
                      selectedColor === variant.color ? "active" : ""
                    } ${variant.stock === 0 ? "out-of-stock" : ""}`}
                    onClick={() =>
                      variant.stock > 0 && handleColorSelect(variant.color)
                    }
                    title={
                      variant.stock > 0
                        ? `${variant.color} - Còn ${variant.stock} sản phẩm`
                        : `${variant.color} - Hết hàng`
                    }
                  >
                    <img
                      src={variant.image.url}
                      alt={variant.color}
                      className="color-image"
                    />
                    <span className="color-name">{variant.color}</span>
                    {variant.stock === 0 && (
                      <span className="sold-out-badge">Hết</span>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "14px", color: "#999" }}>
                  Không có màu sắc khả dụng
                </p>
              )}
            </div>
          </div>

          <div className="quantity-selector">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={!currentVariant}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(
                    Math.max(1, parseInt(e.target.value) || 1),
                    currentVariant?.stock || 1,
                  ),
                )
              }
              min="1"
              max={currentVariant?.stock || 1}
              disabled={!currentVariant}
            />
            <button
              onClick={() =>
                setQuantity(Math.min(quantity + 1, currentVariant?.stock || 1))
              }
              disabled={!currentVariant}
            >
              +
            </button>
          </div>

          <div className="action-buttons">
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={!currentVariant || currentVariant.stock === 0}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      <div className="product-description-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "description" ? "active" : ""}`}
            onClick={() => setActiveTab("description")}
          >
            Mô tả sản phẩm
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "description" && (
            <div className="description-content">
              <p>
                {product.description ||
                  "Sản phẩm chất lượng cao, được chọn lọc kỹ lưỡng."}
              </p>

              <div className="product-details-table">
                <div className="detail-row">
                  <span className="detail-label">Danh mục</span>
                  <span className="detail-value">{product.category}</span>
                  <span className="detail-label">Dịp</span>
                  <span className="detail-value">
                    {product.occasions?.join(", ")}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tổng kho</span>
                  <span className="detail-value">
                    {product.totalStock > 0 ? product.totalStock : ""}
                  </span>

                  <span className="detail-label">Màu sắc</span>
                  <span className="detail-value">
                    {product.variants?.map((v) => v.color).join(", ") || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="similar-products-section">
          <h2>Sản phẩm tương tự</h2>
          <div className="similar-products-grid">
            {similarProducts.map((item) => (
              <div
                key={item.id}
                className="similar-product-card"
                onClick={() => handleSimilarProductClick(item)}
              >
                <div className="similar-product-image">
                  <img src={getImageUrl(item.images)} alt={item.name} />
                  {item.discount && item.discount > 0 && (
                    <div className="product-discount-badge">
                      -{item.discount}%
                    </div>
                  )}
                </div>
                <div className="similar-product-info-detail">
                  <h3>{item.name}</h3>
                  <div className="similar-product-price">
                    {item.discount && item.discount > 0 ? (
                      <span className="old-price">
                        {formatPrice(item.price)}
                      </span>
                    ) : (
                      <span className="old-price empty"></span>
                    )}
                    <span className="current-price">
                      {formatPrice(
                        item.discount
                          ? item.price * (1 - item.discount / 100)
                          : item.price,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleConfirmBuyNow}
        totalAmount={discountedPrice * quantity}
        buyNowItem={
          product && selectedColor
            ? {
                productId: product.id,
                quantity: quantity,
                color: selectedColor,
              }
            : undefined
        }
      />
    </div>
  );
};

export default DetailProduct;
