import React, { useRef } from "react";
import ReactPaginate from "react-paginate";
import "./wedding-flower.css";
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

const WeddingFlower = () => {
  const {
    flowers,
    totalPages,
    loading,
    error,
    currentPage,
    setCurrentPage,
    sortOption,
    setSortOption,
  } = useFlowerSearch({ occasion: "wedding" });


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
    <div className="wedding-flower-container">
      <h1 className="message-1" ref={scrollRef}>
        Hoa Cưới
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
          <h2>Hoa Cưới: Biểu Tượng Của Tình Yêu Và Hạnh Phúc Trọn Vẹn</h2>
          <p>
            Hoa cưới không chỉ là điểm nhấn trang trí mà còn là biểu tượng
            thiêng liêng của tình yêu, sự gắn kết và lời hứa trăm năm hạnh phúc.
            Mỗi bó hoa cưới được nâng niu trong ngày trọng đại đều mang theo cảm
            xúc vẹn nguyên, đánh dấu khoảnh khắc khởi đầu cho một hành trình yêu
            thương dài lâu.
          </p>
        </div>

        <div className="description-2">
          <h2>Hoa Cưới - Nghệ Thuật Gửi Gắm Lời Thề Nguyện Yêu Thương</h2>
          <p>
            Trong không gian ngập tràn cảm xúc của lễ cưới, hoa cưới chính là
            ngôn ngữ tinh tế thay cho những lời thề nguyện sâu sắc. Từ sắc trắng
            thuần khiết đến những gam màu nhẹ nhàng, lãng mạn, mỗi thiết kế hoa
            đều thể hiện sự chân thành, gắn bó và niềm tin vào một tương lai
            hạnh phúc bền lâu.
          </p>
        </div>

        <div className="description-3">
          <h2>Hoa Cưới - Sự Đa Dạng Trong Phong Cách Lãng Mạn</h2>
          <p>
            Hoa cưới được thiết kế đa dạng với nhiều phong cách khác nhau như cổ
            điển, hiện đại hay tối giản, phù hợp với cá tính và chủ đề của từng
            buổi lễ. Sự kết hợp hài hòa giữa các loài hoa như hoa hồng, hoa
            baby, hoa lan cùng cách sắp xếp tinh tế giúp tôn lên vẻ đẹp rạng
            ngời của cô dâu và không gian tiệc cưới.
          </p>
        </div>

        <div className="description-4">
          <h2>Hoa Cưới - Chất Lượng Tạo Nên Khoảnh Khắc Hoàn Hảo</h2>
          <p>
            Chất lượng hoa luôn được đặt lên hàng đầu trong mỗi thiết kế hoa
            cưới. Hoa được tuyển chọn kỹ lưỡng, đảm bảo độ tươi mới và vẻ đẹp tự
            nhiên suốt thời gian diễn ra buổi lễ, góp phần tạo nên không gian
            sang trọng và những khoảnh khắc đáng nhớ trong ngày hạnh phúc.
          </p>
        </div>

        <div className="description-5">
          <h2>Hoa Cưới - Đồng Hành Cùng Hành Trình Hạnh Phúc Lứa Đôi</h2>
          <p>
            Với sự thấu hiểu và tận tâm, chúng tôi mong muốn được đồng hành cùng
            các cặp đôi trong ngày trọng đại nhất của cuộc đời. Mỗi sản phẩm hoa
            cưới không chỉ là vật trang trí mà còn là lời chúc phúc chân thành,
            góp phần tạo nên một lễ cưới trọn vẹn, ngọt ngào và hạnh phúc viên
            mãn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeddingFlower;
