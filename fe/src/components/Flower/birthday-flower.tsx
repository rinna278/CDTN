import React, { useState, useEffect, useRef } from "react";
import ReactPaginate from "react-paginate";
import { getAllProduct } from "../../services/apiService";
import "./birthday-flower.css";
import { useNavigate } from "react-router-dom";
import { Product } from "../../types/type";

interface ApiResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ProductImage = {
  url: string;
  publicId?: string;
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN").format(price) + " VND";
};

const calculateDiscountedPrice = (price: number, discount?: number): number => {
  if (!discount || discount === 0) return price;
  return price * (1 - discount / 100);
};

const getImageUrl = (product: Product): string => {
  const defaultImage =
    "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp";

  // ✅ Ưu tiên ảnh từ variant đầu tiên (nếu có)
  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0];
    if (firstVariant.image && firstVariant.image.url) {
      return firstVariant.image.url;
    }
  }

  // ✅ Fallback sang images array
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === "string") {
      return firstImage;
    }
    if (firstImage && typeof firstImage === "object" && "url" in firstImage) {
      return firstImage.url;
    }
  }

  return defaultImage;
};

const FlowerCard = ({ flower }: { flower: Product }) => {
  const discountedPrice = calculateDiscountedPrice(
    flower.price,
    flower.discount
  );
  const imageUrl = getImageUrl(flower);
  const navigate = useNavigate();

  const handleDetailProduct = () => {
    navigate(`/detail-product/${flower.id}`, {
      state: { product: flower },
    });
  };

  const handleBuyProduct = () => {
    navigate('/my-orders');
  }

  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <img alt={flower.name} src={imageUrl} className="title" />
        </div>
        <div className="flip-card-back">
          {flower.discount && flower.discount > 0 ? (
            <p className="discount">Giảm {flower.discount}%</p>
          ) : (
            <div className="discount-empty"></div>
          )}

          <p className="title">{flower.name}</p>

          {flower.discount && flower.discount > 0 ? (
            <h4>{formatPrice(flower.price)}</h4>
          ) : (
            <div className="old-price-empty"></div>
          )}

          <h3>{formatPrice(discountedPrice)}</h3>

          <div className="btn">
            <button onClick={handleDetailProduct}>Xem chi tiết</button>
            <button onClick={handleBuyProduct}>Mua hàng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BirthdayFlower = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("all");
  const [flowers, setFlowers] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const scrollRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);
  const navigate  = useNavigate();

  const sortLabels: Record<string, string> = {
    all: "Mới nhất",
    "a-z": "Từ A -> Z",
    "z-a": "Từ Z -> A",
    "expensive-cheaper": "Giá cao -> thấp",
    "cheaper-expensive": "Giá thấp -> cao",
  };

  const getSortParams = (option: string) => {
    switch (option) {
      case "a-z":
        return { sortBy: "name", sortOrder: "ASC" as const };
      case "z-a":
        return { sortBy: "name", sortOrder: "DESC" as const };
      case "expensive-cheaper":
        return { sortBy: "price", sortOrder: "DESC" as const };
      case "cheaper-expensive":
        return { sortBy: "price", sortOrder: "ASC" as const };
      default:
        return { sortBy: "createdAt", sortOrder: "DESC" as const };
    }
  };

  useEffect(() => {
    const fetchBirthdayFlowers = async () => {
      try {
        setLoading(true);
        setError(null);

        const sortParams = getSortParams(sortOption);

        // ✅ Log để debug
        console.log("🔍 Fetching with params:", {
          page: currentPage,
          limit: itemsPerPage,
          occasions: ["birthday"],
          status: 1,
          ...sortParams,
        });

        const response: ApiResponse = await getAllProduct({
          page: currentPage,
          limit: itemsPerPage,
          occasions: ["birthday"], // ✅ Truyền array
          status: 1,
          ...sortParams,
        });

        console.log("📦 API Response:", response);
        console.log("📊 Total products:", response.total);
        console.log("🌸 Products data:", response.data);

        // ✅ Kiểm tra xem có sản phẩm nào không
        if (response.data && response.data.length > 0) {
          setFlowers(response.data);
          setTotalPages(response.totalPages);
        } else {
          // ✅ Nếu không có sản phẩm birthday, thử lấy tất cả để test
          console.warn(
            "⚠️ No birthday products found, checking all products..."
          );
          const allResponse: ApiResponse = await getAllProduct({
            page: 1,
            limit: 100,
            status: 1,
          });

          console.log("📊 All products:", allResponse.data);

          // ✅ Filter manually ở frontend (fallback)
          const birthdayProducts = allResponse.data.filter(
            (product) =>
              product.occasions && product.occasions.includes("birthday")
          );

          console.log("🎂 Filtered birthday products:", birthdayProducts);

          if (birthdayProducts.length > 0) {
            setFlowers(birthdayProducts);
            setTotalPages(Math.ceil(birthdayProducts.length / itemsPerPage));
            setError(
              "Backend filter không hoạt động, đã dùng client-side filter"
            );
          } else {
            setFlowers([]);
            setTotalPages(0);
            setError("Không tìm thấy sản phẩm hoa sinh nhật nào");
          }
        }

        if (!isFirstRender.current) {
          scrollRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          isFirstRender.current = false;
        }
      } catch (err: any) {
        console.error("❌ Error fetching products:", err);
        console.error("❌ Error response:", err.response?.data);
        setError(`Không thể tải dữ liệu sản phẩm: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdayFlowers();
  }, [currentPage, sortOption]);

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortOption(event.target.id);
    setCurrentPage(1);
  };

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + 1);
  };

  return (
    <div className="birthday-flower-container">
      <h1 className="message-1" ref={scrollRef}>
        Hoa Sinh Nhật
      </h1>

      <div className="arrangement">
        <button disabled>Sắp xếp</button>
        <div className="select">
          <div className="selected">
            <span>{sortLabels[sortOption] || "Mới nhất"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="1em"
              viewBox="0 0 512 512"
              className="arrow"
            >
              <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
            </svg>
          </div>

          <div className="options">
            <div title="Mới nhất">
              <input
                id="all"
                name="option"
                type="radio"
                checked={sortOption === "all"}
                onChange={handleSortChange}
              />
              <label
                className="option"
                htmlFor="all"
                data-txt="Mới nhất"
              ></label>
            </div>
            <div title="Từ A -> Z">
              <input
                id="a-z"
                name="option"
                type="radio"
                checked={sortOption === "a-z"}
                onChange={handleSortChange}
              />
              <label
                className="option"
                htmlFor="a-z"
                data-txt="Từ A -> Z"
              ></label>
            </div>
            <div title="Từ Z -> A">
              <input
                id="z-a"
                name="option"
                type="radio"
                checked={sortOption === "z-a"}
                onChange={handleSortChange}
              />
              <label
                className="option"
                htmlFor="z-a"
                data-txt="Từ Z -> A"
              ></label>
            </div>
            <div title="Giá cao -> thấp">
              <input
                id="expensive-cheaper"
                name="option"
                type="radio"
                checked={sortOption === "expensive-cheaper"}
                onChange={handleSortChange}
              />
              <label
                className="option"
                htmlFor="expensive-cheaper"
                data-txt="Giá cao -> thấp"
              ></label>
            </div>
            <div title="Giá thấp -> cao">
              <input
                id="cheaper-expensive"
                name="option"
                type="radio"
                checked={sortOption === "cheaper-expensive"}
                onChange={handleSortChange}
              />
              <label
                className="option"
                htmlFor="cheaper-expensive"
                data-txt="Giá thấp -> cao"
              ></label>
            </div>
          </div>
        </div>
      </div>

      <div className="product-list-wrapper">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}

        {error ? (
          <div className="error-box">
            {error}
            <br />
            <small>Kiểm tra console để xem chi tiết</small>
          </div>
        ) : (
          <div
            className={`cart-product-container ${
              loading ? "content-loading" : ""
            }`}
          >
            {flowers.length === 0 && !loading ? (
              <div className="no-products">
                <p>Không tìm thấy sản phẩm hoa sinh nhật nào</p>
                <small>Vui lòng kiểm tra lại dữ liệu hoặc thử lại sau</small>
              </div>
            ) : (
              flowers.map((flower) => (
                <FlowerCard key={flower.id} flower={flower} />
              ))
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
          breakLabel={"..."}
          pageCount={totalPages}
          onPageChange={handlePageClick}
          forcePage={currentPage - 1}
          containerClassName={"pagination"}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
          previousClassName={"page-item"}
          previousLinkClassName={"page-link"}
          nextClassName={"page-item"}
          nextLinkClassName={"page-link"}
          breakClassName={"page-item"}
          breakLinkClassName={"page-link"}
          activeClassName={"active"}
        />
      )}

      <div className="description-container">
        <div className="description-1">
          <h2>Hoa Sinh Nhật: Món Quà Ý Nghĩa Cho Mọi Dịp Đặc Biệt</h2>
          <p>
            Hoa sinh nhật, với vẻ đẹp tươi mới và ý nghĩa đặc biệt, luôn là một
            lựa chọn hoàn hảo để tặng trong mọi dịp kỷ niệm sinh nhật. Tại công
            ty của chúng tôi, chúng tôi tự hào mang đến những bó hoa sinh nhật
            độc đáo và ý nghĩa, tạo nên những khoảnh khắc đáng nhớ và ngọt ngào
            cho những người yêu thương của bạn.
          </p>
        </div>
        <div className="description-2">
          <h2>Hoa Sinh Nhật: Sự Đa Dạng và Phong Phú của Thiết Kế</h2>
          <p>
            Với sự đa dạng về loại hoa và màu sắc, bó hoa sinh nhật mang đến cho
            khách hàng sự lựa chọn phong phú và độc đáo. Từ những bó hoa sinh
            nhật tươi mới trên bàn tiệc đến các bó hoa sinh nhật sang trọng và
            đẳng cấp, chúng tôi cam kết mang đến mọi thứ bạn cần để tạo ra một
            món quà sinh nhật hoàn hảo và ý nghĩa.
          </p>
        </div>
        <div className="description-3">
          <h2>Hoa Sinh Nhật: Chất Lượng và Sự Tinh Tế Được Đảm Bảo</h2>
          <p>
            Chúng tôi luôn chú trọng vào việc mang đến cho khách hàng những sản
            phẩm chất lượng nhất. Vì vậy, chúng tôi chỉ sử dụng những loại hoa
            tươi mới và chất lượng nhất từ các nguồn cung ứng uy tín, để mỗi bó
            hoa sinh nhật đều mang lại sự tinh tế và đẳng cấp.
          </p>
        </div>
        <div className="description-4">
          <h2>Hoa Sinh Nhật: Dịch Vụ Giao Hàng Nhanh Chóng và Chuyên Nghiệp</h2>
          <p>
            Với dịch vụ giao hàng nhanh chóng và chuyên nghiệp, chúng tôi cam
            kết đưa những bó hoa sinh nhật đẹp nhất đến tay khách hàng trong
            thời gian ngắn nhất. Khách hàng có thể yên tâm rằng mỗi đơn hàng sẽ
            được giao đến địa chỉ mong muốn một cách an toàn và kịp thời.
          </p>
        </div>
        <div className="description-5">
          <h2>Hoa Sinh Nhật: Sự Hài Lòng của Khách Hàng là Ưu Tiên Hàng Đầu</h2>
          <p>
            Chúng tôi luôn đặt sự hài lòng của khách hàng lên hàng đầu. Tất cả
            các sản phẩm và dịch vụ của chúng tôi đều được thiết kế để đáp ứng
            và vượt qua kỳ vọng của khách hàng, từ chất lượng sản phẩm cho đến
            dịch vụ sau bán hàng. Đặt hàng ngay hôm nay để trải nghiệm vẻ đẹp và
            ý nghĩa của hoa sinh nhật!
          </p>
        </div>
      </div>
    </div>
  );
};

export default BirthdayFlower;
