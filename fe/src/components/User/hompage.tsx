import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './homepage.css'
import { useState, useEffect} from 'react';
import logo from '../../assets/logo.png';
import qr from '../../assets/Screenshot 2025-10-11 090421.png'
import appstore from '../../assets/appstore.png.webp'
import ggplay from '../../assets/gplay.png.webp'
import bocongthuong from '../../assets/logo-da-thong-bao-bo-cong-thuong-mau-xanh.png'
import chiLanAnhImage from '../../assets/chi-lan-anh.png'; 
import anhminhImage from '../../assets/anh-minh.png';
import anhtuanImage from '../../assets/anh-tuan.png';
import chiHuongImage from '../../assets/chi-hương.png';
import chiMaiImage from '../../assets/chi-mai.png';
import codauThuImage from '../../assets/co-dau-thu.png';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from "../../redux/store";

// Danh sách các ảnh bạn muốn hiển thị
const sliderImages = [
  'https://assets.flowerstore.ph/public/tenantVN/app/assets/images/banner/jCrApxsZA7acPeQ2vgHh7x7lh2vBibr5YE7Uij1o.gif',
  'https://assets.flowerstore.ph/public/tenantVN/app/assets/images/banner/hHh3Aw1c8iMjnJBsdtPuwKUALnzzJSRpzA4xriMR.gif',
  'https://assets.flowerstore.ph/public/tenantVN/app/assets/images/banner/LV1bwQqr6Oq3tBj7AvbtXYvx7BoURddjtWyZTVPs.gif',
];

const HomePage = () => {
  // State để lưu chỉ số (index) của ảnh đang được hiển thị
  const [currentIndex, setCurrentIndex] = useState(0);
  const location = useLocation();
  const pathChildren = location.pathname !== '/';
  const navigate = useNavigate();
  const isLogined = useSelector((state: RootState) => state.user.loggedIn);

  const handleAddCart = () => {
    if (isLogined) {
        navigate('/cart');
    }
    navigate('/login');
  }

  useEffect(() => {
    const timer = setInterval(() => {
      // Cập nhật currentIndex để chuyển sang ảnh tiếp theo
      // Dùng toán tử % để lặp lại từ đầu khi đến ảnh cuối cùng
      setCurrentIndex(prevIndex => (prevIndex + 1) % sliderImages.length);
    }, 2000); 
    // Nó sẽ được gọi khi component bị unmount (rời khỏi màn hình)
    // để tránh rò rỉ bộ nhớ (memory leak)
    return () => {
      clearInterval(timer);
    };
  }, []); // Mảng rỗng [] đảm bảo useEffect chỉ chạy một lần khi component được render lần đầu

  return (
    <div className="homepage-container">
        <div className="slider">
            {/* Dùng map để render tất cả các ảnh */}
            {sliderImages.map((image, index) => (
            <img
                key={index}
                src={image}
                alt={`Slide ${index + 1}`}
                // Thêm class 'active' cho ảnh đang được hiển thị
                // để điều khiển bằng CSS
                className={index === currentIndex ? 'slider-image active' : 'slider-image'}
            />
            ))}
        </div>
        <h1 className="button-ship">
            <span className="button_lg">
                <span className="button_sl"></span>
                <span className="button_text">Giao Hàng Nhanh Chóng - Hoa Đẹp Tận Tay - Gọi Ngay AVICI Shop</span>
            </span>
        </h1>
        {/* Hiển thị các router con đã lồng trong App.tsx */}
        {pathChildren ? 
        <>
          <Outlet/>
        </>
        :
        <>
          <h1 className='message-2'>HOA TƯƠI GIẢM ĐẾN 30%</h1>
            <div className='cart-product-container'>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/August%202023/bo-hoa-hong-do-say-dam.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 19%</p>
                            <p className="title">Hoa Hồng Đỏ</p>
                            <h4>690.000VND</h4>
                            <h3>560.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/August%202023/bo-hoa-hong-ban-mai.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 11%</p>
                            <p className="title">Hoa Ban Mai Trắng + Xanh</p>
                            <h4>710.000VND</h4>
                            <h3>630.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/August%202023/lang-hoa-be-happy.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 11%</p>
                            <p className="title">Giỏ Cúc + Hồng Trắng</p>
                            <h4>810.000VND</h4>
                            <h3>720.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/August%202023/bo-hoa-hong-do-my-everything.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 17%</p>
                            <p className="title">Hoa Hồng Đỏ + Hoa Đồng Nội</p>
                            <h4>760.000VND</h4>
                            <h3>630.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-lac-than-my-girl.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 18%</p>
                            <p className="title">Hoa Hồng + Hoa Quỳnh Tiên</p>
                            <h4>800.000VND</h4>
                            <h3>660.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/Autumn_2024/nu-cuoi.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 20%</p>
                            <p className="title">Hoa Hồng Trắng</p>
                            <h4>830.000VND</h4>
                            <h3>660.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/August%202023/bo-hoa-hong-dieu-ngot-ngao-nhat.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 18%</p>
                            <p className="title">Hoa Hồng Xanh + Trắng</p>
                            <h4>1.110.000VND</h4>
                            <h3>910.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/August%202023/bo-hoa-baby-hong-mix-hoa-hong-pink-moon.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Hết KM</p>
                            <p className="title">Hoa Hồng Trắng + Hoa Lay Ơn</p>
                            {/* <h4>Đã hết đợt giảm giá</h4> */}
                            <h3>1.200.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-cam-tu-cau-dam-me.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 8%</p>
                            <p className="title">Hoa Thủy Tiên</p>
                            <h4>530.000VND</h4>
                            <h3>490.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h1 className='message-3'>SẢN PHẨM MỚI</h1>
            <div className='cart-product-container'>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/August%202023/khuc-tinh-ca.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 8%</p>
                            <p className="title">Hoa Bông</p>
                            <h4>740.000VND</h4>
                            <h3>680.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h1 className='message-4'>HOA KHAI TRƯƠNG</h1>
            <div className='cart-product-container'>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flip-card">
                    <div className="flip-card-inner">
                        <div className="flip-card-front">
                            <img alt='flower-display-in-homepage' src='https://flowercorner.b-cdn.net/image/cache/catalog/products/B%C3%B3%20Hoa/bo-hoa-hong-mat-nau.jpg.webp' className="title"></img>
                        </div>
                        <div className="flip-card-back">
                            <p className='discount'>Giảm 10%</p>
                            <p className="title">Hoa Hồng Pháp</p>
                            <h4>590.000VND</h4>
                            <h3>530.000VND</h3>
                            <div className='btn'>
                                <button onClick={handleAddCart}>Thêm vào giỏ</button>
                                <button>Mua hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h1 className='message-5'>Shop Bán Hoa Avici.vn</h1>
            <div className='content-brand'>
                <div className='content-brand-left'>
                    <div className='introduction'>
                        <h3>Giới thiệu về Avici.vn</h3>
                        <p>Shop Hoa Tươi Avici là một trong những tiệm hoa uy tín nhất tại TP.Hà Nội, Việt Nam. Chúng tôi cung cấp dịch vụ đặt hoa online giao tận nơi tại Hà Nội, trên các tỉnh thành phố khác. Với hệ thống cửa hàng liên kết khắp các tỉnh trên toàn quốc, chúng tôi có thể giúp bạn gửi tặng hoa cho người thân, bạn bè, người yêu ở bất cứ đâu tại Việt Nam.</p>
                        <iframe
                            width="560" 
                            height="315" 
                            src="https://www.youtube.com/embed/jMD1UAiNt8Y?autoplay=1&controls=0&showinfo=0&rel=0"
                            title="Kết Duyên ( Htrol Remix ) - YuniBoo x Goctoi Mixer | Nhạc Trẻ EDM Tiktok Gây Nghiện Hay Nhất 2020"
                            frameBorder="0"
                            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                        >
                        </iframe>
                    </div>
                    <div className='trustworthy'>
                        <h3>Tại sao nên chọn Avici Shop?</h3>
                        <p>Không khó để bạn tìm được một cửa hàng giao online tận nơi. Vậy tại sao nên chọn chúng tôi? Do chúng tôi marketing ư, không phải lí do là:</p>
                        <ul>
                            <li>Hoa đẹp vcl, màu thì hài hòa, cây nhà lá vườn</li>
                            <li>Thiết kế chuẩn 30Shine, có khi phóng đại yêu cầu khách hàng</li>
                            <li>Gửi hình ảnh hoa lá kèn + giá trước khi giao nha</li>
                            <li>Đội ngũ florists với nhiều năm kinh nghiệm, tương đương số lần tìm job intern</li>
                        </ul>
                    </div>
                </div>
                <div className='content-brand-right'>
                    <div className='category'>
                        <h3>Danh mục sản phẩm</h3>
                        <p>Đến với cửa hàng hoa Avici Shop, bạn có thể thoải mái lựa chọn giữa hơn 500+ mẫu hoa tươi được thiết kế sẵn theo các chủ đề như: </p>
                        <ul>
                            <li><span>Hoa sinh nhật: </span>Hoa tặng sinh nhật vợ, bạn gái, ba mẹ, anh chị, bạn bè, đối tác hay đồng nghiệp.</li>
                            <li><span>Hoa cưới: </span>Hoa cầm tay cho cô dâu, hoa cài áo chú rể, hoa trang trí giường cưới</li>
                            <li><span>Hoa tốt nghiệp: </span>Hoa tặng bạn bè, người thân, người yêu trong dịp tốt nghiệp</li>
                            <li><span>Hoa tang lễ: </span>Hoa chia buồn gửi tới đám tang</li>
                            <li><span>Hoa trang trí: </span>Hoa dùng để trên bàn, trang trí decor phòng ngủ</li>
                        </ul>
                        <p>Ngoài ra, quý khách có thể yêu cầu hoa theo dịch vụ khác, hoặc các mẫu hoa ở nước ngoài.</p>
                    </div>
                    <div className='guarantee'>
                        <h3>Cam kết với Khách Hàng</h3>
                        <p>Avici Shop hiểu rằng, hoa tươi dù không mang nhiều giá trị về vật chất, nhưng mang lại ý nghĩa to lớn về mặt tinh thần. Mỗi một bó hoa gửi đi rất nhiều tình cảm, thông điệp yêu thương mà bạn muốn gửi đến những người thân. Chính vì thế, Avici Shop luôn nỗ lực nâng cao chất lượng sản phẩm và dịch vụ để mang lại cho bạn những trải nghiệm khó quên khi sử dụng. Shop cũng xin cam kết: </p>
                        <ul>
                            <li>Chỉ sử dụng hoa tươi mới nhập trong ngày</li>
                            <li>Hoa đẹp và 99,9% giống hình</li>
                            <li>Giao hàng nhanh, đúng giờ</li>
                        </ul>
                        <p>Nếu bạn đang cần chúng tôi, chúng tôi sẵn sàng trực chờ 24/7, gọi ngay 1900 càng đông càng sướng à nhầm 0333438120 để được tư vấn hoặc đặt ngay hoa!!</p>
                    </div>
                </div>
            </div>
        </>
        }
        <div className="container">
            <div className="title">
                <h1>💐 Khách Hàng Yêu Thích 💐</h1>
                <p>Những phản hồi chân thành từ khách hàng của chúng tôi</p>
            </div>

            <div className="hanging-wire"></div>

            <div className="photos-container">
                <div className="photo-item">
                    <div className="string"></div>
                    <div className="clip"></div>
                    <div className="photo-frame">
                        <img src={chiLanAnhImage} alt="Khách hàng 1"/>
                        <div className="review-text">
                            <div className="stars">★★★★★</div>
                            <p>"Hoa tươi lắm, giao đúng giờ. Rất hài lòng!"</p>
                            <div className="customer-name">- Chị Lan Anh</div>
                        </div>
                    </div>
                </div>

                <div className="photo-item">
                    <div className="string"></div>
                    <div className="clip"></div>
                    <div className="photo-frame">
                        <img src={anhminhImage} alt="Khách hàng 2"/>
                        <div className="review-text">
                            <div className="stars">★★★★★</div>
                            <p>"Bó hoa đẹp quá, vợ mình thích lắm!"</p>
                            <div className="customer-name">- Anh Minh</div>
                        </div>
                    </div>
                </div>

                <div className="photo-item">
                    <div className="string"></div>
                    <div className="clip"></div>
                    <div className="photo-frame">
                        <img src={chiHuongImage} alt="Khách hàng 3"/>
                        <div className="review-text">
                            <div className="stars">★★★★★</div>
                            <p>"Chất lượng tuyệt vời, sẽ ủng hộ tiếp!"</p>
                            <div className="customer-name">- Chị Hương</div>
                        </div>
                    </div>
                </div>

                <div className="photo-item">
                    <div className="string"></div>
                    <div className="clip"></div>
                    <div className="photo-frame">
                        <img src={codauThuImage} alt="Khách hàng 4"/>
                        <div className="review-text">
                            <div className="stars">★★★★★</div>
                            <p>"Hoa cưới đẹp lung linh, cảm ơn shop!"</p>
                            <div className="customer-name">- Cô dâu Thu</div>
                        </div>
                    </div>
                </div>

                <div className="photo-item">
                    <div className="string"></div>
                    <div className="clip"></div>
                    <div className="photo-frame">
                        <img src={chiMaiImage} alt="Khách hàng 5"/>
                        <div className="review-text">
                            <div className="stars">★★★★★</div>
                            <p>"Dịch vụ tốt, hoa tươi lâu. Recommend!"</p>
                            <div className="customer-name">- Chị Mai</div>
                        </div>
                    </div>
                </div>

                <div className="photo-item">
                    <div className="string"></div>
                    <div className="clip"></div>
                    <div className="photo-frame">
                        <img src={anhtuanImage} alt="Khách hàng 6"/>
                        <div className="review-text">
                            <div className="stars">★★★★★</div>
                            <p>"Giá hợp lý, hoa đẹp. Sẽ quay lại!"</p>
                            <div className="customer-name">- Anh Tuấn</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <hr/>
        <div className='footer-general'>
            <div className='content-1'>
                <div className='logo'>
                    <img alt='logo-img' src={logo} />
                    <p>AVICI FLOWER SHOP</p>
                </div>
                <div>
                    <p>Hotline: 1900 6677 - 0333438120</p>
                    <p>Email: avici@gmail.vn</p>
                </div>
                <div className='content-1-bottom'>
                    <img src={qr} alt='qr-shop' className='qr-img'/>
                    <div className='app-symbolize'>
                        <p>Tải ứng dụng ngay!</p>
                        <img src={appstore} alt='appstore'/>
                        <br/>
                        <img src={ggplay} alt='gg-play' />
                    </div>
                </div>
                <img src={bocongthuong} alt='bocongthuong' className='bocongthuong'/>
            </div>
            <div className='takecare-commuter'>
                <h3>Chăm sóc khách hàng</h3>
                <ul>
                    <li>Giới thiệu</li>
                    <li>Liên hệ</li>
                    <li>Chính sách vận chuyển</li>
                    <li>Câu hỏi thường gặp</li>
                    <li>Hình thức thanh toán</li>
                    <li>Bảo mật thông tin</li>
                    <li>Chính sách hoàn tiền</li>
                    <li>Xử lí khiếu nại</li>
                </ul>
            </div>
            <div className='social'>
                <h3>Theo dõi</h3>
                <div className='fb'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 440 146.7 540.8 258.2 568.5L258.2 398.2L205.4 398.2L205.4 320L258.2 320L258.2 286.3C258.2 199.2 297.6 158.8 383.2 158.8C399.4 158.8 427.4 162 438.9 165.2L438.9 236C432.9 235.4 422.4 235 409.3 235C367.3 235 351.1 250.9 351.1 292.2L351.1 320L434.7 320L420.3 398.2L351 398.2L351 574.1C477.8 558.8 576 450.9 576 320z"/></svg>
                    <span>Facebook</span>
                </div>
                <div className='twitter'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM457.1 180L353.3 298.6L475.4 460L379.8 460L305 362.1L219.3 460L171.8 460L282.8 333.1L165.7 180L263.7 180L331.4 269.5L409.6 180L457.1 180zM419.3 431.6L249.4 206.9L221.1 206.9L392.9 431.6L419.3 431.6z"/></svg>
                    <span>Twitter</span>
                </div>
                <div className='instagram'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M290.4 275.7C274 286 264.5 304.5 265.5 323.8C266.6 343.2 278.2 360.4 295.6 368.9C313.1 377.3 333.8 375.5 349.6 364.3C366 354 375.5 335.5 374.5 316.2C373.4 296.8 361.8 279.6 344.4 271.1C326.9 262.7 306.2 264.5 290.4 275.7zM432.7 207.3C427.5 202.1 421.2 198 414.3 195.3C396.2 188.2 356.7 188.5 331.2 188.8C327.1 188.8 323.3 188.9 320 188.9C316.7 188.9 312.8 188.9 308.6 188.8C283.1 188.5 243.8 188.1 225.7 195.3C218.8 198 212.6 202.1 207.3 207.3C202 212.5 198 218.8 195.3 225.7C188.2 243.8 188.6 283.4 188.8 308.9C188.8 313 188.9 316.8 188.9 320C188.9 323.2 188.9 327 188.8 331.1C188.6 356.6 188.2 396.2 195.3 414.3C198 421.2 202.1 427.4 207.3 432.7C212.5 438 218.8 442 225.7 444.7C243.8 451.8 283.3 451.5 308.8 451.2C312.9 451.2 316.7 451.1 320 451.1C323.3 451.1 327.2 451.1 331.4 451.2C356.9 451.5 396.2 451.9 414.3 444.7C421.2 442 427.4 437.9 432.7 432.7C438 427.5 442 421.2 444.7 414.3C451.9 396.3 451.5 356.9 451.2 331.3C451.2 327.1 451.1 323.2 451.1 319.9C451.1 316.6 451.1 312.8 451.2 308.5C451.5 283 451.9 243.6 444.7 225.5C442 218.6 437.9 212.4 432.7 207.1L432.7 207.3zM365.6 251.8C383.7 263.9 396.2 282.7 400.5 304C404.8 325.3 400.3 347.5 388.2 365.6C382.2 374.6 374.5 382.2 365.6 388.2C356.7 394.2 346.6 398.3 336 400.4C314.7 404.6 292.5 400.2 274.4 388.1C256.3 376 243.8 357.2 239.5 335.9C235.2 314.6 239.7 292.4 251.7 274.3C263.7 256.2 282.6 243.7 303.9 239.4C325.2 235.1 347.4 239.6 365.5 251.6L365.6 251.6zM394.8 250.5C391.7 248.4 389.2 245.4 387.7 241.9C386.2 238.4 385.9 234.6 386.6 230.8C387.3 227 389.2 223.7 391.8 221C394.4 218.3 397.9 216.5 401.6 215.8C405.3 215.1 409.2 215.4 412.7 216.9C416.2 218.4 419.2 220.8 421.3 223.9C423.4 227 424.5 230.7 424.5 234.5C424.5 237 424 239.5 423.1 241.8C422.2 244.1 420.7 246.2 419 248C417.3 249.8 415.1 251.2 412.8 252.2C410.5 253.2 408 253.7 405.5 253.7C401.7 253.7 398 252.6 394.9 250.5L394.8 250.5zM544 160C544 124.7 515.3 96 480 96L160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160zM453 453C434.3 471.7 411.6 477.6 386 478.9C359.6 480.4 280.4 480.4 254 478.9C228.4 477.6 205.7 471.7 187 453C168.3 434.3 162.4 411.6 161.2 386C159.7 359.6 159.7 280.4 161.2 254C162.5 228.4 168.3 205.7 187 187C205.7 168.3 228.5 162.4 254 161.2C280.4 159.7 359.6 159.7 386 161.2C411.6 162.5 434.3 168.3 453 187C471.7 205.7 477.6 228.4 478.8 254C480.3 280.3 480.3 359.4 478.8 385.9C477.5 411.5 471.7 434.2 453 452.9L453 453z"/></svg>
                    <span>Instagram</span>
                </div>
                <div className='youtube'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1zM264.2 401.6L264.2 239.2L406.9 320.4L264.2 401.6z"/></svg>
                    <span>Youtube</span>
                </div>
            </div>
            <div className='agency'>
                <h3>Chi nhánh</h3>
                <p><span>Cửa hàng chính: </span>phường Đại Kim, quận Hoàng Mai, TP.Hà Nội</p>
                <p><span>Cửa hàng phụ: </span>đường Nhổn, quận Bắc Từ Liêm, TP.Hà Nội</p>
                <p><span>Trang web online: </span>AviciFlower.vn</p>
                <p>CÔNG TY TNHH AVICI FLOWER</p>
                <p>Mã số thuế: 02938434</p>
            </div>
        </div>
    </div>
  );
}

export default HomePage;