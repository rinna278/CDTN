import React, { useState, useMemo } from "react";
import ReactPaginate from "react-paginate";
import "./wedding-flower.css";

// ĐỊNH NGHĨA TYPE CHO SẢN PHẨM
interface Flower {
  id: number;
  name: string;
  oldPrice: string;
  newPrice: string;
  discount: string;
  image: string;
}

// Hàm chuyển đổi giá từ chuỗi "xxx.xxxVND" sang số để sắp xếp
const priceToNumber = (price: string): number => {
  // Loại bỏ "VND" và dấu chấm, sau đó chuyển sang số
  const numStr = price.replace("VND", "").replace(/\./g, "");
  return parseInt(numStr, 10);
};

// Dữ liệu mẫu (nên dùng dữ liệu có tên và giá khác nhau để thấy rõ hiệu quả)
const flowerProducts: Flower[] = [
  {
    id: 1,
    name: "Hoa Tulip Đỏ",
    oldPrice: "590.000VND",
    newPrice: "530.000VND",
    discount: "Giảm 10%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },
  {
    id: 2,
    name: "Hoa Hồng Trắng",
    oldPrice: "450.000VND",
    newPrice: "400.000VND",
    discount: "Giảm 11%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },
  {
    id: 3,
    name: "Hoa Ly Vàng",
    oldPrice: "700.000VND",
    newPrice: "650.000VND",
    discount: "Giảm 7%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },
  {
    id: 4,
    name: "Hoa Cẩm Chướng",
    oldPrice: "320.000VND",
    newPrice: "300.000VND",
    discount: "Giảm 6%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },
  {
    id: 5,
    name: "Hoa Hướng Dương",
    oldPrice: "610.000VND",
    newPrice: "550.000VND",
    discount: "Giảm 10%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },
  {
    id: 6,
    name: "Hoa Lan Hồ Điệp",
    oldPrice: "880.000VND",
    newPrice: "800.000VND",
    discount: "Giảm 9%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },
  {
    id: 7,
    name: "Hoa Baby Trắng",
    oldPrice: "290.000VND",
    newPrice: "250.000VND",
    discount: "Giảm 14%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },
  {
    id: 8,
    name: "Hoa Phăng Xê",
    oldPrice: "410.000VND",
    newPrice: "380.000VND",
    discount: "Giảm 7%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },
  {
    id: 9,
    name: "Hoa Đỗ Quyên",
    oldPrice: "750.000VND",
    newPrice: "720.000VND",
    discount: "Giảm 4%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },
  {
    id: 10,
    name: "Hoa Đồng Tiền",
    oldPrice: "390.000VND",
    newPrice: "350.000VND",
    discount: "Giảm 10%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },
  {
    id: 11,
    name: "Hoa Thiên Điểu",
    oldPrice: "500.000VND",
    newPrice: "470.000VND",
    discount: "Giảm 6%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },
  {
    id: 11,
    name: "Hoa Thiên Điểu",
    oldPrice: "500.000VND",
    newPrice: "470.000VND",
    discount: "Giảm 6%",
    image:
      "https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp",
  },

  // ... Dữ liệu sản phẩm thực tế của bạn
];

// FlowerCard component không thay đổi
const FlowerCard = ({ flower }: { flower: Flower }) => (
  <div className="flip-card">
    {/* ... (Nội dung FlowerCard giữ nguyên) ... */}
    <div className="flip-card-inner">
      <div className="flip-card-front">
        <img alt={flower.name} src={flower.image} className="title" />
      </div>
      <div className="flip-card-back">
        <p className="discount">{flower.discount}</p>
        <p className="title">{flower.name}</p>
        <h4>{flower.oldPrice}</h4>
        <h3>{flower.newPrice}</h3>
        <div className="btn">
          <button>Thêm vào giỏ</button>
          <button>Mua hàng</button>
        </div>
      </div>
    </div>
  </div>
);

const WeddingFlower = () => {
  const [currentPage, setCurrentPage] = useState(0);
  // Khởi tạo state cho tùy chọn sắp xếp, mặc định là 'all'
  const [sortOption, setSortOption] = useState("all");
  const itemsPerPage = 10;

  // --- LOGIC SẮP XẾP SẢN PHẨM ---
  // Sử dụng useMemo có ý nghĩa: Hãy chạy hàm sắp xếp này và trả về kết quả là sortedProducts.
  //Hãy ghi nhớ kết quả này và chỉ chạy lại hàm sắp xếp nếu sortOption của nó thay đổi -> có tác dụng nhớ kết quả tạm thời, để tránh mỗi khi render lại tính lại mảng sắp xếp
  const sortedProducts = useMemo(() => {
    // Tạo bản sao của mảng để sắp xếp mà không thay đổi dữ liệu gốc
    const sortableProducts = [...flowerProducts];

    switch (sortOption) {
      case "a-z":
        return sortableProducts.sort((a, b) => a.name.localeCompare(b.name));
      case "z-a":
        return sortableProducts.sort((a, b) => b.name.localeCompare(a.name));
      case "expensive-cheaper":
        return sortableProducts.sort(
          (a, b) => priceToNumber(b.newPrice) - priceToNumber(a.newPrice)
        );
      case "cheaper-expensive":
        return sortableProducts.sort(
          (a, b) => priceToNumber(a.newPrice) - priceToNumber(b.newPrice)
        );
      case "all":
      default:
        // Trả về theo thứ tự ID ban đầu
        return sortableProducts.sort((a, b) => a.id - b.id);
    }
  }, [sortOption]); // Chỉ chạy lại khi sortOption thay đổi

  // Cập nhật lại logic phân trang dựa trên mảng đã sắp xếp
  const pageCount = Math.ceil(sortedProducts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = sortedProducts.slice(offset, offset + itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

  // Xử lý khi chọn tùy chọn sắp xếp
  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortOption(event.target.id);
    // Quan trọng: Đặt lại về trang đầu tiên (trang 0) khi thay đổi sắp xếp
    setCurrentPage(0);
  };

  return (
    <div className="wedding-flower-container">
      <h1 className="message-1">Hoa Sinh Nhật</h1>
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
          {/* Thêm sự kiện onChange vào tất cả input radio */}
          <div className="options">
            <div title="All">
              <input
                id="all"
                name="option"
                type="radio"
                defaultChecked
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
                checked={sortOption === "a-z"} // Dùng checked để đồng bộ với state
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
      {/* Hoa sinh nhật tổng hợp */}
      <div className="cart-product-container">
        {currentItems.map((flower) => (
          <FlowerCard key={flower.id} flower={flower} />
        ))}
      </div>
      {/* ReactPaginate component không thay đổi */}
      <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        breakLabel={"..."}
        pageCount={pageCount}
        onPageChange={handlePageClick}
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
      <h1 className="message-2">Lẵng Hoa Sinh Nhật</h1>
      {/* Lẵng hoa sinh nhật */}
      <div className="cart-product-container">
        {flowerProducts.map((flower) => (
          <FlowerCard key={flower.id} flower={flower} />
        ))}
      </div>
      <h1 className="message-3">Hộp Mica Hoa Sinh Nhật</h1>
      {/* Lẵng hoa sinh nhật */}
      <div className="cart-product-container">
        {flowerProducts.map((flower) => (
          <FlowerCard key={flower.id} flower={flower} />
        ))}
      </div>
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

export default WeddingFlower;
