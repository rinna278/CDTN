
import { Dispatch, SetStateAction } from "react";
import "./cart.css"
import itemImg1 from '../../img/item-cart-product1.jpg' 
import itemImg2 from '../../img/item-cart-product2.jpg' 
import itemImg3 from '../../img/item-cart-product3.jpg' 
import itemImg4 from '../../img/item-cart-product4.jpg' 
import itemImg5 from '../../img/item-cart-product5.jpg' 

interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>; //do đây là hàm của state nên kiểu dữ liệu dùng như này
}


const Cart = ({ selected, setSelected }: HeaderProps) => {

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="cart-container">
      <div className="title-cart">
        <h1>🌸 Giỏ Hoa Xinh Của Bạn</h1>
      </div>
      <div className="body-cart">
        <div className="content-left-cart">
          <div className="all-item">
            <input type="checkbox" />
            <h3>
              Chọn tất cả <span>(5 sản phẩm)</span>
            </h3>
          </div>
          <div className="item-cart">
            <div className="item-cart-product">
              <div className="img-item-cart-product">
                <input type="checkbox" />
                <img src={itemImg1} alt="hoa-1" />
              </div>
              <div className="infor-action">
                <div className="infor-item-cart-product">
                  <h4>Hoa Hướng Dương</h4>
                  <p>{formatPrice(150000)}</p>
                  <h3>Tổng: {formatPrice(150000)}</h3>
                </div>
                <div className="action-item-cart-product">
                  <button>-</button>
                  <h4>1</h4>
                  <button>+</button>
                  <button>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: 0, width: 27, height: 27 }}
                      viewBox="0 0 640 640"
                    >
                      <path
                        fill="#FC2B76"
                        d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="item-cart">
            <div className="item-cart-product">
              <div className="img-item-cart-product">
                <input type="checkbox" />
                <img src={itemImg2} alt="hoa-2" />
              </div>
              <div className="infor-action">
                <div className="infor-item-cart-product">
                  <h4>Hoa Cải Ngọt</h4>
                  <p>{formatPrice(150000)}</p>
                  <h3>Tổng: {formatPrice(150000)}</h3>
                </div>
                <div className="action-item-cart-product">
                  <button>-</button>
                  <h4>1</h4>
                  <button>+</button>
                  <button>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: 0, width: 27, height: 27 }}
                      viewBox="0 0 640 640"
                    >
                      <path
                        fill="#FC2B76"
                        d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="item-cart">
            <div className="item-cart-product">
              <div className="img-item-cart-product">
                <input type="checkbox" />
                <img src={itemImg3} alt="hoa-3" />
              </div>
              <div className="infor-action">
                <div className="infor-item-cart-product">
                  <h4>Hoa Đồng Nội</h4>
                  <p>{formatPrice(150000)}</p>
                  <h3>Tổng: {formatPrice(150000)}</h3>
                </div>
                <div className="action-item-cart-product">
                  <button>-</button>
                  <h4>1</h4>
                  <button>+</button>
                  <button>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: 0, width: 27, height: 27 }}
                      viewBox="0 0 640 640"
                    >
                      <path
                        fill="#FC2B76"
                        d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="item-cart">
            <div className="item-cart-product">
              <div className="img-item-cart-product">
                <input type="checkbox" />
                <img src={itemImg4} alt="hoa-4" />
              </div>
              <div className="infor-action">
                <div className="infor-item-cart-product">
                  <h4>Hoa Cứt Lợn</h4>
                  <p>{formatPrice(150000)}</p>
                  <h3>Tổng: {formatPrice(150000)}</h3>
                </div>
                <div className="action-item-cart-product">
                  <button>-</button>
                  <h4>1</h4>
                  <button>+</button>
                  <button>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: 0, width: 27, height: 27 }}
                      viewBox="0 0 640 640"
                    >
                      <path
                        fill="#FC2B76"
                        d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="item-cart">
            <div className="item-cart-product">
              <div className="img-item-cart-product">
                <input type="checkbox" />
                <img src={itemImg5} alt="hoa-5" />
              </div>
              <div className="infor-action">
                <div className="infor-item-cart-product">
                  <h4>Hoa Ban Mai</h4>
                  <p>{formatPrice(150000)}</p>
                  <h3>Tổng: {formatPrice(150000)}</h3>
                </div>
                <div className="action-item-cart-product">
                  <button>-</button>
                  <h4>1</h4>
                  <button>+</button>
                  <button>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: 0, width: 27, height: 27 }}
                      viewBox="0 0 640 640"
                    >
                      <path
                        fill="#FC2B76"
                        d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-right-cart">
          <div className="statistical">
            <h3>Thống Kê</h3>
            <div className="all-item-selected">
              <p>Sản phẩm đã chọn: </p>
              <p>0</p>
            </div>
            <div className="all-item-quantity">
              <p>Số lượng: </p>
              <p>0</p>
            </div>
          </div>
          <hr />
          <div className="total-price">
            <p>Tổng Tiền:</p>
            <h3>{formatPrice(0)} </h3>
          </div>
          <div className="payment">
            <button>Thanh toán (0)</button>
            <p>Vui lòng chọn ít nhất một sản phẩm</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
>>>>>>> 7abb90c (Update cart)
