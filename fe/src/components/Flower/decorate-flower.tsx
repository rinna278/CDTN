import React, { useRef } from "react";
import ReactPaginate from "react-paginate";
import "./decorate-flower.css";
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

const DecorateFlower = () => {
  const {
    flowers,
    totalPages,
    loading,
    error,
    currentPage,
    setCurrentPage,
    sortOption,
    setSortOption,
  } = useFlowerSearch({ occasion: "decorate" });
  //query cho page birthday flower

  // const itemsPerPage = 10;

  const scrollRef = useRef<HTMLHeadingElement>(null);
  // const isFirstRender = useRef(true);

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

  // //reset page khi search xong
  // useEffect(() => {
  //   if (searchQuery) {
  //     setCurrentPage(1);
  //   }
  // }, [searchQuery]);

  return (
    <div className="decorate-flower-container">
      <h1 className="message-1" ref={scrollRef}>
        Hoa Trang Trí
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
          <h2>Hoa Trang Trí: Điểm Nhấn Tinh Tế Cho Không Gian Sống</h2>
          <p>
            Hoa trang trí không chỉ mang vẻ đẹp tự nhiên mà còn góp phần tạo nên
            linh hồn cho mỗi không gian. Từ phòng khách ấm cúng, bàn làm việc
            thanh lịch đến những buổi tiệc trang trọng, hoa trang trí luôn là
            điểm nhấn tinh tế giúp không gian trở nên sinh động, hài hòa và tràn
            đầy sức sống.
          </p>
        </div>
        <div className="description-2">
          <h2>Hoa Trang Trí - Nghệ Thuật Kết Nối Cảm Xúc</h2>
          <p>
            Mỗi loài hoa mang trong mình một thông điệp riêng, từ sự dịu dàng,
            lãng mạn đến niềm vui và hy vọng. Hoa trang trí không chỉ làm đẹp
            cho không gian mà còn là cầu nối cảm xúc, giúp con người gửi gắm
            những lời chúc tốt đẹp, sự quan tâm và yêu thương một cách tinh tế
            và ý nghĩa.
          </p>
        </div>
        <div className="description-3">
          <h2>Hoa Trang Trí - Sự Đa Dạng Trong Phong Cách Thiết Kế</h2>
          <p>
            Với sự phong phú về kiểu dáng, màu sắc và chất liệu, hoa trang trí
            phù hợp với mọi phong cách từ hiện đại, tối giản đến sang trọng, cổ
            điển. Dù là hoa tươi rực rỡ hay hoa trang trí nghệ thuật được thiết
            kế tinh xảo, mỗi sản phẩm đều góp phần tôn lên cá tính và gu thẩm mỹ
            riêng của không gian.
          </p>
        </div>
        <div className="description-4">
          <h2>Hoa Trang Trí - Chất Lượng Tạo Nên Sự Khác Biệt</h2>
          <p>
            Chất lượng hoa luôn là yếu tố được đặt lên hàng đầu. Những bông hoa
            được tuyển chọn kỹ lưỡng, kết hợp cùng cách cắm hoa sáng tạo và tinh
            tế, mang đến vẻ đẹp bền lâu và cảm giác dễ chịu cho người thưởng
            thức. Mỗi sản phẩm hoa trang trí đều là kết quả của sự tỉ mỉ, khéo
            léo và tâm huyết.
          </p>
        </div>
        <div className="description-5">
          <h2>Hoa Trang Trí - Lựa Chọn Hoàn Hảo Cho Mọi Dịp</h2>
          <p>
            Từ trang trí nhà cửa, văn phòng đến các sự kiện quan trọng như sinh
            nhật, khai trương, lễ cưới hay ngày kỷ niệm, hoa trang trí luôn là
            lựa chọn hoàn hảo. Không chỉ mang lại vẻ đẹp thẩm mỹ, hoa còn góp
            phần tạo nên không khí ấm áp, trang trọng và đáng nhớ cho từng
            khoảnh khắc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DecorateFlower;
