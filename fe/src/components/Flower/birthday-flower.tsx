import React, { useState,  useEffect } from "react";
import ReactPaginate from "react-paginate";
import { getAllProduct } from "../../services/apiService";
import "./birthday-flower.css";

// Interface phù hợp với backend response
interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  images?: string[];
  occasion?: string[];
  category?: string;
  color?: string;
  description?: string;
  stock?: number;
  soldCount?: number;
  status?: number;
}

interface ApiResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Hàm format giá VND
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN").format(price) + "VND";
};

// Hàm tính giá sau giảm
const calculateDiscountedPrice = (price: number, discount?: number): number => {
  if (!discount) return price;
  return price * (1 - discount / 100);
};

const FlowerCard = ({ flower }: { flower: Product }) => {
  const discountedPrice = calculateDiscountedPrice(
    flower.price,
    flower.discount
  );
  const oldPrice = formatPrice(flower.price);
  const newPrice = formatPrice(discountedPrice);
  const discountText = flower.discount ? `Giảm ${flower.discount}%` : "";
  const imageUrl =
    flower.images && flower.images.length > 0
      ? flower.images[0]
      : "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp";

  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <img alt={flower.name} src={imageUrl} className="title" />
        </div>
        <div className="flip-card-back">
          {discountText && <p className="discount">{discountText}</p>}
          <p className="title">{flower.name}</p>
          {flower.discount && flower.discount > 0 && <h4>{oldPrice}</h4>}
          <h3>{newPrice}</h3>
          <div className="btn">
            <button>Thêm vào giỏ</button>
            <button>Mua hàng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BirthdayFlower = () => {
  const [currentPage, setCurrentPage] = useState(1); // Backend sử dụng page 1-indexed
  const [sortOption, setSortOption] = useState("all");
  const [flowers, setFlowers] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Mapping sort option to API params
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
      case "all":
      default:
        return { sortBy: "createdAt", sortOrder: "DESC" as const };
    }
  };

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchBirthdayFlowers = async () => {
      try {
        setLoading(true);
        setError(null);

        const sortParams = getSortParams(sortOption);

        // Gọi API với params phù hợp với backend
        const response: ApiResponse = await getAllProduct({
          page: currentPage,
          limit: itemsPerPage,
          occasion: "birthday",
          status: 1, // Chỉ lấy sản phẩm ACTIVE
          ...sortParams,
        });

        // Backend trả về đúng format: { data, total, page, limit, totalPages }
        setFlowers(response.data);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } catch (err: any) {
        console.error("Error fetching birthday flowers:", err);
        setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdayFlowers();
  }, [currentPage, sortOption]); // Gọi lại API khi page hoặc sort thay đổi

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + 1); // ReactPaginate dùng 0-indexed, backend dùng 1-indexed
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortOption(event.target.id);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi sort
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="birthday-flower-container">
        <h1 className="message-1">Hoa Sinh Nhật</h1>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="birthday-flower-container">
        <h1 className="message-1">Hoa Sinh Nhật</h1>
        <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Không có sản phẩm
  if (flowers.length === 0) {
    return (
      <div className="birthday-flower-container">
        <h1 className="message-1">Hoa Sinh Nhật</h1>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Không có sản phẩm nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="birthday-flower-container">
      <h1 className="message-1">Hoa Sinh Nhật</h1>

      {/* Hiển thị tổng số sản phẩm */}
      <div style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
        Tìm thấy {total} sản phẩm
      </div>

      <div className="arrangement">
        <button disabled>Sắp xếp</button>
        <div className="select">
          <div
            className="selected"
            data-default="All"
            data-one="Từ A -> Z"
            data-two="Từ Z -> A"
            data-three="Giá cao -> thấp"
            data-four="Giá thấp -> cao"
          >
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
            <div title="All">
              <input
                id="all"
                name="option"
                type="radio"
                checked={sortOption === "all"}
                onChange={handleSortChange}
              />
              <label className="option" htmlFor="all" data-txt="All"></label>
            </div>
            <div title="Từ A -> Z">
              <input
                id="a-z"
                name="option"
                type="radio"
                onChange={handleSortChange}
                checked={sortOption === "a-z"}
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
                onChange={handleSortChange}
                checked={sortOption === "z-a"}
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
                onChange={handleSortChange}
                checked={sortOption === "expensive-cheaper"}
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
                onChange={handleSortChange}
                checked={sortOption === "cheaper-expensive"}
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

      {/* Danh sách sản phẩm */}
      <div className="cart-product-container">
        {flowers.map((flower) => (
          <FlowerCard key={flower.id} flower={flower} />
        ))}
      </div>

      {/* Pagination - Chỉ hiển thị nếu có nhiều hơn 1 trang */}
      {totalPages > 1 && (
        <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
          breakLabel={"..."}
          pageCount={totalPages}
          onPageChange={handlePageClick}
          forcePage={currentPage - 1} // ReactPaginate dùng 0-indexed
          containerClassName={"pagination"}
          activeClassName={"active"}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
          previousClassName={"page-item"}
          previousLinkClassName={"page-link"}
          nextClassName={"page-item"}
          nextLinkClassName={"page-link"}
          breakClassName={"page-item"}
          breakLinkClassName={"page-link"}
        />
      )}

      <div className="description-1">
        <h2>Hoa Sinh Nhật: Món Quà Ý Nghĩa Cho Mọi Dịp Đặc Biệt</h2>
        <p>
          Hoa sinh nhật, với vẻ đẹp tươi mới và ý nghĩa đặc biệt, luôn là một
          lựa chọn hoàn hảo để tặng trong mọi dịp kỷ niệm sinh nhật. Tại công ty
          của chúng tôi, chúng tôi tự hào mang đến những bó hoa sinh nhật độc
          đáo và ý nghĩa, tạo nên những khoảnh khắc đáng nhớ và ngọt ngào cho
          những người yêu thương của bạn.
        </p>
      </div>
      <div className="description-2">
        <h2>Hoa Sinh Nhật: Sự Đa Dạng và Phong Phú của Thiết Kế</h2>
        <p>
          Với sự đa dạng về loại hoa và màu sắc, bó hoa sinh nhật mang đến cho
          khách hàng sự lựa chọn phong phú và độc đáo. Từ những bó hoa sinh nhật
          tươi mới trên bàn tiệc đến các bó hoa sinh nhật sang trọng và đẳng
          cấp, chúng tôi cam kết mang đến mọi thứ bạn cần để tạo ra một món quà
          sinh nhật hoàn hảo và ý nghĩa.
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
          Với dịch vụ giao hàng nhanh chóng và chuyên nghiệp, chúng tôi cam kết
          đưa những bó hoa sinh nhật đẹp nhất đến tay khách hàng trong thời gian
          ngắn nhất. Khách hàng có thể yên tâm rằng mỗi đơn hàng sẽ được giao
          đến địa chỉ mong muốn một cách an toàn và kịp thời.
        </p>
      </div>
      <div className="description-5">
        <h2>Hoa Sinh Nhật: Sự Hài Lòng của Khách Hàng là Ưu Tiên Hàng Đầu</h2>
        <p>
          Chúng tôi luôn đặt sự hài lòng của khách hàng lên hàng đầu. Tất cả các
          sản phẩm và dịch vụ của chúng tôi đều được thiết kế để đáp ứng và vượt
          qua kỳ vọng của khách hàng, từ chất lượng sản phẩm cho đến dịch vụ sau
          bán hàng. Đặt hàng ngay hôm nay để trải nghiệm vẻ đẹp và ý nghĩa của
          hoa sinh nhật!
        </p>
      </div>
    </div>
  );
};

export default BirthdayFlower;
