import React, { useRef } from "react";
import ReactPaginate from "react-paginate";
import "./graduate-flower.css";
import { useNavigate } from "react-router-dom";
import { Product } from "../../types/type";
import { useFlowerSearch } from "../../hooks/useFlowerSearch";
import { formatCurrency } from "../../utils/formatData";

const calculateDiscountedPrice = (price: number, discount?: number): number => {
  if (!discount || discount === 0) return price;
  return price * (1 - discount / 100);
};

const getImageUrl = (product: Product): string => {
  const defaultImage =
    "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp";

  //Ưu tiên ảnh từ variant đầu tiên (nếu có)
  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0];
    if (firstVariant.image && firstVariant.image.url) {
      return firstVariant.image.url;
    }
  }

  // Fallback sang images array
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
    flower.discount,
  );
  const imageUrl = getImageUrl(flower);
  const navigate = useNavigate();

  const handleDetailProduct = () => {
    navigate(`/detail-product/${flower.id}`, {
      state: { product: flower },
    });
  };

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
            <h4>{formatCurrency(flower.price)}</h4>
          ) : (
            <div className="old-price-empty"></div>
          )}

          <h3>{formatCurrency(discountedPrice)}</h3>

          <div className="btn">
            <button onClick={handleDetailProduct}>Xem chi tiết</button>
            <button onClick={handleDetailProduct}>Thêm vào giỏ</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GraduateFlower = () => {
  const {
    flowers,
    totalPages,
    loading,
    error,
    currentPage,
    setCurrentPage,
    sortOption,
    setSortOption,
  } = useFlowerSearch({ occasion: "graduate" });


  const scrollRef = useRef<HTMLHeadingElement>(null);

  const sortLabels: Record<string, string> = {
    all: "Mới nhất",
    "a-z": "Từ A -> Z",
    "z-a": "Từ Z -> A",
    "expensive-cheaper": "Giá cao -> thấp",
    "cheaper-expensive": "Giá thấp -> cao",
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortOption(event.target.id);
    setCurrentPage(1);
  };

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + 1);
  };


  return (
    <div className="graduate-flower-container">
      <h1 className="message-1" ref={scrollRef}>
        Hoa Tốt Nghiệp
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
                <p>Hiện không có sản phẩm nào </p>
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
          <h2>Hoa Tốt Nghiệp: Lời Chúc Mừng Cho Cột Mốc Đáng Nhớ</h2>
          <p>
            Hoa tốt nghiệp không chỉ là món quà chúc mừng mà còn là biểu tượng
            cho sự nỗ lực, kiên trì và thành quả xứng đáng sau một chặng đường
            học tập. Mỗi bó hoa được trao tay đều mang theo niềm tự hào, lời
            động viên và những lời chúc tốt đẹp dành cho tân cử nhân trong ngày
            trọng đại.
          </p>
        </div>

        <div className="description-2">
          <h2>Hoa Tốt Nghiệp - Nghệ Thuật Gửi Gắm Niềm Tin Và Hy Vọng</h2>
          <p>
            Trong khoảnh khắc đánh dấu bước ngoặt quan trọng của cuộc đời, hoa
            tốt nghiệp là thông điệp ý nghĩa thay cho lời chúc thành công và
            tương lai rộng mở. Từ sắc hoa tươi sáng đến cách bó hiện đại, mỗi
            thiết kế đều thể hiện sự lạc quan, khích lệ và niềm tin vào hành
            trình phía trước.
          </p>
        </div>

        <div className="description-3">
          <h2>Hoa Tốt Nghiệp - Sự Đa Dạng Trong Phong Cách Trẻ Trung</h2>
          <p>
            Hoa tốt nghiệp được thiết kế với nhiều kiểu dáng đa dạng như bó hoa
            cầm tay, hộp hoa hay lẵng hoa, phù hợp với cá tính và phong cách của
            từng người. Sự kết hợp hài hòa giữa màu sắc tươi sáng và các loài
            hoa mang ý nghĩa may mắn, thành công tạo nên món quà vừa tinh tế vừa
            nổi bật.
          </p>
        </div>

        <div className="description-4">
          <h2>Hoa Tốt Nghiệp - Chất Lượng Gắn Liền Với Sự Chỉn Chu</h2>
          <p>
            Chúng tôi luôn chú trọng đến chất lượng trong từng bó hoa tốt
            nghiệp. Hoa được chọn lọc kỹ lưỡng, đảm bảo độ tươi mới và bền đẹp,
            giúp khoảnh khắc chụp ảnh lưu niệm và trao gửi lời chúc mừng trở nên
            trọn vẹn và đáng nhớ hơn.
          </p>
        </div>

        <div className="description-5">
          <h2>Hoa Tốt Nghiệp - Đồng Hành Cùng Những Bước Khởi Đầu Mới</h2>
          <p>
            Với mong muốn đồng hành cùng những dấu mốc quan trọng của cuộc đời,
            chúng tôi mang đến những sản phẩm hoa tốt nghiệp tinh tế và ý nghĩa.
            Mỗi bó hoa không chỉ là lời chúc mừng mà còn là nguồn động viên,
            tiếp thêm động lực để các tân cử nhân tự tin bước vào chặng đường
            mới đầy triển vọng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GraduateFlower;
