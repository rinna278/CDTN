import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getProductByID, getAllProduct, postAddToCart } from "../../services/apiService";
import "./detail-product.css";
import { toast } from "react-toastify";

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  images?: any[];
  occasions?: string[];
  category: string;
  color?: string;
  description?: string;
  stock: number;
  soldCount?: number;
  status?: number;
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
  const { productID } = useParams<{ productID: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(
    location.state?.product || null
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (location.state?.product && location.state.product.id === productID) {
      setProduct(location.state.product);
      setLoading(false);
      return;
    }

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
        if (response && response.data) {
          setProduct(response.data);
        } else {
          throw new Error("Không tìm thấy sản phẩm");
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productID, location.state]);

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
          (p: Product) => p.id !== product.id
        );
        setSimilarProducts(filtered.slice(0, 8));
      } catch (err) {
        console.error("Error fetching similar products:", err);
      }
    };
    fetchSimilarProducts();
  }, [product]);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab("description");
  }, [productID]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Có lỗi xảy ra</h2>
        <p>{error}</p>
        <button className="btn-back" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy sản phẩm</h2>
        <button className="btn-back" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const images = product.images || [];
  const imageUrls =
    images.length > 0
      ? images.map((img) => getImageUrl([img]))
      : [getImageUrl()];

  const colors = ["#000000", "#4B5563", "#8B4513", "#DC143C"];


  const handleAddToCart = async() => {
    if (!product?.id) {
      console.error("Product ID không tồn tại");
      return;
    }

    try {
      const response = await postAddToCart(product.id, quantity);
      console.log("Thông tin sản phẩm thêm vào cart", response);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error: any) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      toast.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
    }
  };

  const handleBuyNow = () => {
    alert("Chức năng mua hàng đang được phát triển!");
  };

  const handleSimilarProductClick = (similarProduct: Product) => {
    navigate(`/detail-product/${similarProduct.id}`, {
      state: { product: similarProduct },
      replace: false,
    });
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

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-rating">
            <div className="stars">★★★★★</div>
            <span className="rating-count">5.0 (100 đánh giá)</span>
            <span className="comment-count">
              {" "}
              | {product.soldCount || 0} đã bán
            </span>
          </div>

          <div className="product-price-section">
            {product.discount && product.discount > 0 && (
              <span className="discount-badge">-{product.discount}%</span>
            )}
            <div className="prices">
              {product.discount && product.discount > 0 && (
                <span className="old-price">{formatPrice(product.price)}</span>
              )}
              <span className="current-price">
                {formatPrice(discountedPrice)}
              </span>
            </div>
          </div>

          <div className="color-selector">
            <span className="label">Màu sắc</span>
            <div className="color-options">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`color-dot ${index === 0 ? "active" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {}}
                ></div>
              ))}
            </div>
          </div>

          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              min="1"
            />
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>

          <div className="action-buttons">
            <button className="btn-add-cart" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </button>
            <button className="btn-buy-now" onClick={handleBuyNow}>
              Mua ngay
            </button>
          </div>

          <div className="product-features">
            <div className="feature-item">
              <span className="icon">🔒</span> Thanh toán an toàn
            </div>
            <div className="feature-item">
              <span className="icon">📏</span> Đổi trả miễn phí
            </div>
            <div className="feature-item">
              <span className="icon">🚚</span> Miễn phí vận chuyển
            </div>
            <div className="feature-item">
              <span className="icon">✓</span> Hàng chính hãng
            </div>
          </div>

          <div className="stock-info">
            {product.stock !== undefined && (
              <>
                {product.stock > 0 ? (
                  <span className="in-stock">Còn {product.stock} sản phẩm</span>
                ) : (
                  <span className="out-of-stock">Hết hàng</span>
                )}
              </>
            )}
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
          <button
            className={`tab ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            Đánh giá ({product.soldCount || 0})
          </button>
          <button
            className={`tab ${activeTab === "qa" ? "active" : ""}`}
            onClick={() => setActiveTab("qa")}
          >
            Hỏi đáp
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "description" && (
            <div className="description-content">
              <p>
                {product.description ||
                  "Sản phẩm chất lượng cao, được chọn lọc kỹ lưỡng. Mang đến sự hài lòng tuyệt đối cho khách hàng."}
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
                  <span className="detail-label">Tình trạng</span>
                  <span className="detail-value">
                    {product.status === 1 ? "Còn hàng" : "Hết hàng"}
                  </span>
                  <span className="detail-label">Kho</span>
                  <span className="detail-value">{product.stock}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="comments-content">
              <p className="empty-state">
                Chưa có đánh giá nào cho sản phẩm này.
              </p>
              <button className="btn-review">Viết đánh giá đầu tiên</button>
            </div>
          )}

          {activeTab === "qa" && (
            <div className="qa-content">
              <p className="empty-state">Chưa có câu hỏi nào.</p>
              <button className="btn-question">Đặt câu hỏi</button>
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
                  <button
                    className="wishlist-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    ♡
                  </button>
                  {item.discount && item.discount > 0 && (
                    <div className="product-discount-badge">
                      -{item.discount}%
                    </div>
                  )}
                </div>
                <div className="similar-product-info">
                  <h3>{item.name}</h3>
                  <div className="similar-product-price">
                    {item.discount && item.discount > 0 && (
                      <span className="old-price">
                        {formatPrice(item.price)}
                      </span>
                    )}
                    <span className="current-price">
                      {formatPrice(
                        item.discount
                          ? item.price * (1 - item.discount / 100)
                          : item.price
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailProduct;
