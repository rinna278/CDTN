import React, { useState, useMemo } from 'react';
import ReactPaginate from 'react-paginate';
import './decorate-flower.css';


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
    const numStr = price.replace('VND', '').replace(/\./g, '');
    return parseInt(numStr, 10);
};

// Dữ liệu mẫu (nên dùng dữ liệu có tên và giá khác nhau để thấy rõ hiệu quả)
const flowerProducts: Flower[] = [
    { id: 1, name: 'Hoa Tulip Đỏ', oldPrice: '590.000VND', newPrice: '530.000VND', discount: 'Giảm 10%', image: 'https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' },
    { id: 2, name: 'Hoa Hồng Trắng', oldPrice: '450.000VND', newPrice: '400.000VND', discount: 'Giảm 11%', image: 'https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' },
    { id: 3, name: 'Hoa Ly Vàng', oldPrice: '700.000VND', newPrice: '650.000VND', discount: 'Giảm 7%', image: 'https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' },
    { id: 4, name: 'Hoa Cẩm Chướng', oldPrice: '320.000VND', newPrice: '300.000VND', discount: 'Giảm 6%', image: 'https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' },
    { id: 5, name: 'Hoa Hướng Dương', oldPrice: '610.000VND', newPrice: '550.000VND', discount: 'Giảm 10%', image: 'https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' },
    { id: 6, name: 'Hoa Lan Hồ Điệp', oldPrice: '880.000VND', newPrice: '800.000VND', discount: 'Giảm 9%', image: 'https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' },
    { id: 7, name: 'Hoa Baby Trắng', oldPrice: '290.000VND', newPrice: '250.000VND', discount: 'Giảm 14%', image: 'https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' },
    { id: 8, name: 'Hoa Phăng Xê', oldPrice: '410.000VND', newPrice: '380.000VND', discount: 'Giảm 7%', image: 'https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' },
    { id: 9, name: 'Hoa Đỗ Quyên', oldPrice: '750.000VND', newPrice: '720.000VND', discount: 'Giảm 4%', image: 'https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' },
    { id: 10, name: 'Hoa Đồng Tiền', oldPrice: '390.000VND', newPrice: '350.000VND', discount: 'Giảm 10%', image: 'https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' },
    { id: 11, name: 'Hoa Thiên Điểu', oldPrice: '500.000VND', newPrice: '470.000VND', discount: 'Giảm 6%', image: 'https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' },
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
                <p className='discount'>{flower.discount}</p>
                <p className="title">{flower.name}</p>
                <h4>{flower.oldPrice}</h4>
                <h3>{flower.newPrice}</h3>
                <div className='btn'>
                    <button>Thêm vào giỏ</button>
                    <button>Mua hàng</button>
                </div>
            </div>
        </div>
    </div>
);

const DecorateFlower = () => {
    const [currentPage, setCurrentPage] = useState(0);
    // Khởi tạo state cho tùy chọn sắp xếp, mặc định là 'all'
    const [sortOption, setSortOption] = useState('all'); 
    const itemsPerPage = 10;

    // --- LOGIC SẮP XẾP SẢN PHẨM ---
    // Sử dụng useMemo có ý nghĩa: Hãy chạy hàm sắp xếp này và trả về kết quả là sortedProducts. 
    //Hãy ghi nhớ kết quả này và chỉ chạy lại hàm sắp xếp nếu sortOption của nó thay đổi -> có tác dụng nhớ kết quả tạm thời, để tránh mỗi khi render lại tính lại mảng sắp xếp
    const sortedProducts = useMemo(() => {
        // Tạo bản sao của mảng để sắp xếp mà không thay đổi dữ liệu gốc
        const sortableProducts = [...flowerProducts];

        switch (sortOption) {
            case 'a-z':
                return sortableProducts.sort((a, b) => a.name.localeCompare(b.name));
            case 'z-a':
                return sortableProducts.sort((a, b) => b.name.localeCompare(a.name));
            case 'expensive-cheaper':
                return sortableProducts.sort((a, b) => 
                    priceToNumber(b.newPrice) - priceToNumber(a.newPrice)
                );
            case 'cheaper-expensive':
                return sortableProducts.sort((a, b) => 
                    priceToNumber(a.newPrice) - priceToNumber(b.newPrice)
                );
            case 'all':
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
        <div className='birthday-flower-container'>
            <h1 className='message-1'>Hoa Trang Trí</h1>
            <div className='arrangement'>
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
                            <path
                                d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                            ></path>
                        </svg>
                    </div>
                    {/* Thêm sự kiện onChange vào tất cả input radio */}
                    <div className="options">
                        <div title="All">
                            <input id="all" name="option" type="radio" 
                                defaultChecked 
                                onChange={handleSortChange} 
                            />
                            <label className="option" htmlFor="all" data-txt="All"></label>
                        </div>
                        <div title="Từ A -> Z">
                            <input id="a-z" name="option" type="radio" 
                                onChange={handleSortChange} 
                                checked={sortOption === 'a-z'} // Dùng checked để đồng bộ với state
                            />
                            <label className="option" htmlFor="a-z" data-txt="Từ A -> Z"></label>
                        </div>
                        <div title="Từ Z -> A">
                            <input id="z-a" name="option" type="radio" 
                                onChange={handleSortChange} 
                                checked={sortOption === 'z-a'}
                            />
                            <label className="option" htmlFor="z-a" data-txt="Từ Z -> A"></label>
                        </div>
                        <div title="Giá cao -> thấp">
                            <input id="expensive-cheaper" name="option" type="radio" 
                                onChange={handleSortChange} 
                                checked={sortOption === 'expensive-cheaper'}
                            />
                            <label className="option" htmlFor="expensive-cheaper" data-txt="Giá cao -> thấp"></label>
                        </div>
                        <div title="Giá thấp -> cao">
                            <input id="cheaper-expensive" name="option" type="radio" 
                                onChange={handleSortChange} 
                                checked={sortOption === 'cheaper-expensive'}
                            />
                            <label className="option" htmlFor="cheaper-expensive" data-txt="Giá thấp -> cao"></label>
                        </div>
                    </div>
                </div>
            </div>
            <div className='cart-product-container'>
                {currentItems.map((flower) => (
                    <FlowerCard key={flower.id} flower={flower} />
                ))}
            </div>
            {/* ReactPaginate component không thay đổi */}
            <ReactPaginate
                previousLabel={'<'}
                nextLabel={'>'}
                breakLabel={'...'}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={'pagination'}
                activeClassName={'active'}
                pageClassName={'page-item'}
                pageLinkClassName={'page-link'}
                previousClassName={'page-item'}
                previousLinkClassName={'page-link'}
                nextClassName={'page-item'}
                nextLinkClassName={'page-link'}
                breakClassName={'page-item'}
                breakLinkClassName={'page-link'}
            />
        </div>
    );
}

export default DecorateFlower;