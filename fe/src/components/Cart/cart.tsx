import React, { useEffect, useState, useRef, useCallback } from "react";
import "./cart.css";
import {
  deleteItemInCart,
  getAllItemInCart,
  updateCart,
  getProductByID,
} from "../../services/apiService";
import {
  Cart as CartType,
  CartItem,
  CreateOrderPayload,
} from "../../types/type";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { postCreateOrder } from "../../services/apiService";
import CheckoutModal from "../Checkout/checkout-modal";
import { useDispatch } from "react-redux";
import {
  fetchCartFromServer,
  setCartInfo,
} from "../../redux/reducer+action/cartSlice";
import PopUpDeleteCartItem from "./popup-delete-cart_item";
import { formatCurrency } from "../../utils/formatData";

const Cart = () => {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const updateTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const pendingQuantities = useRef<{ [key: string]: number }>({});

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //mở modal xác nhận xóa
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: string | null;
    productName: string;
    productImage: string;
  }>({
    isOpen: false,
    itemId: null,
    productName: "",
    productImage: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [checkingProducts, setCheckingProducts] = useState<Set<string>>(
    new Set()
  );

  const dispatch = useDispatch();
  const handleConfirmOrder = async (orderData: CreateOrderPayload) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const res = await postCreateOrder(orderData);
      dispatch(fetchCartFromServer() as any);
      setIsModalOpen(false);

      if (orderData.paymentMethod === "vnpay" && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        toast.success("Đặt hàng thành công! Cảm ơn bạn.");
        navigate("/profile?tab=orders");
      }
    } catch (error: any) {
      console.error("Lỗi đặt hàng:", error);
      toast.error(error.response?.data?.message || "Không thể tạo đơn hàng");
    } finally {
      setIsSubmitting(false);
    }
  };


  const getImageUrl = (imageUrl?: string): string => {
    return imageUrl || "https://via.placeholder.com/100";
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await getAllItemInCart();
        dispatch(
          setCartInfo({
            totalItems: response.totalItems,
            distinctItems: response.items.length,
          })
        );
        setCart(response);
      } catch (error: any) {
        console.error("❌ Lỗi:", error);
        if (error.response?.status === 404) {
          setCart(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(updateTimers.current).forEach(clearTimeout);
    };
  }, []);

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (!cart?.items) return;
    if (selectedItems.size === cart.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.items.map((item: CartItem) => item.id)));
    }
  };

  const sendUpdateRequest = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        await updateCart(itemId, quantity);
        delete pendingQuantities.current[itemId];
        setUpdatingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      } catch (error: any) {
        console.error("❌ Lỗi:", error);
        toast.error("Không thể cập nhật số lượng");
        try {
          const response = await getAllItemInCart();
          setCart(response);
          delete pendingQuantities.current[itemId];
          setUpdatingItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });
        } catch (fetchError) {
          console.error("Không thể fetch lại giỏ hàng:", fetchError);
        }
      }
    },
    []
  );
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const item = cart?.items.find((i) => i.id === itemId);
    if (!item) return;
    if (newQuantity > item.stock) {
      toast.error(`Chỉ còn ${item.stock} sản phẩm trong kho`);
      return;
    }
    pendingQuantities.current[itemId] = newQuantity;
    setCart((prevCart) => {
      if (!prevCart) return prevCart;
      const updatedItems = prevCart.items.map((i) => {
        if (i.id === itemId) {
          const discountedPrice = i.discount
            ? i.price * (1 - i.discount / 100)
            : i.price;
          const newSubtotal = discountedPrice * newQuantity;

          return {
            ...i,
            quantity: newQuantity,
            subtotal: newSubtotal,
          };
        }
        return i;
      });
      const newTotalItems = updatedItems.reduce(
        (sum, i) => sum + i.quantity,
        0
      );
      const newTotalPrice = updatedItems.reduce(
        (sum, i) => sum + i.subtotal,
        0
      );
      dispatch(
        setCartInfo({
          totalItems: newTotalItems,
          distinctItems: updatedItems.length,
        })
      );
      return {
        ...prevCart,
        items: updatedItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      };
    });
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    if (updateTimers.current[itemId]) {
      clearTimeout(updateTimers.current[itemId]);
    }
    updateTimers.current[itemId] = setTimeout(() => {
      const finalQuantity = pendingQuantities.current[itemId] || newQuantity;
      sendUpdateRequest(itemId, finalQuantity);
    }, 500);
  };

  const handleIncrease = (
    itemId: string,
    currentQuantity: number,
    stock: number
  ) => {
    if (currentQuantity >= stock) {
      toast.info("Số lượng đã đạt tối đa trong kho");
      return;
    }
    handleQuantityChange(itemId, currentQuantity + 1);
  };

  const handleDecrease = (itemId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      return;
    }
    handleQuantityChange(itemId, currentQuantity - 1);
  };

  const openDeleteModal = (item: CartItem) => {
    setDeleteModal({
      isOpen: true,
      itemId: item.id,
      productName: item.productName,
      productImage: item.productImage || "",
    });
  };

  const closeDeleteModal = () => {
    if (isDeleting) return; // Không cho đóng khi đang xóa
    setDeleteModal({
      isOpen: false,
      itemId: null,
      productName: "",
      productImage: "",
    });
  };

  // ✅ Xác nhận xóa
  const confirmDelete = async () => {
    if (!deleteModal.itemId || isDeleting) return;

    try {
      setIsDeleting(true);

      const response = await deleteItemInCart(deleteModal.itemId);
      console.log("Sản phẩm đã xóa", response);
      dispatch(fetchCartFromServer() as any);

      setCart((prevCart) => {
        if (!prevCart) return prevCart;

        const updatedItems = prevCart.items.filter(
          (i) => i.id !== deleteModal.itemId
        );

        if (updatedItems.length === 0) {
          return null;
        }

        const newTotalItems = updatedItems.reduce(
          (sum, i) => sum + i.quantity,
          0
        );
        const newTotalPrice = updatedItems.reduce(
          (sum, i) => sum + i.subtotal,
          0
        );

        return {
          ...prevCart,
          items: updatedItems,
          totalItems: newTotalItems,
          totalPrice: newTotalPrice,
        };
      });

      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(deleteModal.itemId!);
        return newSet;
      });

      if (updateTimers.current[deleteModal.itemId]) {
        clearTimeout(updateTimers.current[deleteModal.itemId]);
        delete updateTimers.current[deleteModal.itemId];
      }
      delete pendingQuantities.current[deleteModal.itemId];
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(deleteModal.itemId!);
        return newSet;
      });

      toast.success("Đã xóa sản phẩm thành công");
      closeDeleteModal();
    } catch (err) {
      console.log(err);
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setIsDeleting(false);
    }
  };

  const calculateSelectedTotal = () => {
    if (!cart?.items) return 0;
    return cart.items
      .filter((item: CartItem) => selectedItems.has(item.id))
      .reduce((sum: number, item: CartItem) => {
        const price = item.discount
          ? item.price * (1 - item.discount / 100)
          : item.price;
        return sum + price * item.quantity;
      }, 0);
  };

  const calculateSelectedQuantity = () => {
    if (!cart?.items) return 0;
    return cart.items
      .filter((item: CartItem) => selectedItems.has(item.id))
      .reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  };

  const ViewDetailProduct = async (
    productId: string,
    itemId: string,
    e: React.MouseEvent
  ) => {
    const target = e.target as HTMLElement;

    // Không làm gì nếu click vào button hoặc input
    if (
      target.tagName === "BUTTON" ||
      target.tagName === "INPUT" ||
      target.closest("button") ||
      target.closest("input")
    ) {
      return;
    }

    // Đánh dấu đang kiểm tra sản phẩm này
    setCheckingProducts((prev) => new Set(prev).add(itemId));

    try {
      // Kiểm tra sản phẩm có tồn tại không
      await getProductByID(productId);

      // Nếu tồn tại, navigate đến trang chi tiết
      navigate(`/detail-product/${productId}`);
    } catch (error: any) {
      // Nếu không tồn tại (404), tự động xóa khỏi giỏ hàng
      if (error.response?.status === 404) {
        toast.warning(
          "Sản phẩm này không còn tồn tại. Đang xóa khỏi giỏ hàng..."
        );

        try {
          await deleteItemInCart(itemId);
          dispatch(fetchCartFromServer() as any);

          // Cập nhật state local
          setCart((prevCart) => {
            if (!prevCart) return prevCart;

            const updatedItems = prevCart.items.filter((i) => i.id !== itemId);

            if (updatedItems.length === 0) {
              return null;
            }

            const newTotalItems = updatedItems.reduce(
              (sum, i) => sum + i.quantity,
              0
            );
            const newTotalPrice = updatedItems.reduce(
              (sum, i) => sum + i.subtotal,
              0
            );

            return {
              ...prevCart,
              items: updatedItems,
              totalItems: newTotalItems,
              totalPrice: newTotalPrice,
            };
          });

          // Xóa khỏi danh sách đã chọn
          setSelectedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
          });

          toast.success("Đã xóa sản phẩm không tồn tại khỏi giỏ hàng");
        } catch (deleteError) {
          console.error("Lỗi khi xóa:", deleteError);
          toast.error("Không thể xóa sản phẩm");
        }
      } else {
        toast.error("Không thể kiểm tra sản phẩm. Vui lòng thử lại");
      }
    } finally {
      // Bỏ đánh dấu kiểm tra
      setCheckingProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div
        className="cart-container"
      >
        <h2>Đang tải giỏ hàng...</h2>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div
        className="cart-container"
      >
        <h2>🛒 Giỏ hàng trống</h2>
        <p>Hãy thêm sản phẩm vào giỏ hàng của bạn!</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="title-cart">
        <h1>🌸 Giỏ Hoa Xinh Của Bạn</h1>
      </div>

      <div className="body-cart">
        <div className="content-left-cart">
          <div className="all-item">
            <input
              type="checkbox"
              checked={selectedItems.size === cart.items.length}
              onChange={handleSelectAll}
            />
            <h3>
              Chọn tất cả <span>({cart.totalItems} sản phẩm)</span>
            </h3>
          </div>

          {cart.items.map((item: CartItem) => {
            const discountedPrice = item.discount
              ? item.price * (1 - item.discount / 100)
              : item.price;
            const itemTotal = discountedPrice * item.quantity;
            const isUpdating = updatingItems.has(item.id);

            return (
              <div
                className="item-cart"
                key={item.id}
                onClick={(e) => ViewDetailProduct(item.productId, item.id, e)}
                style={{
                  position: "relative",
                  ...(checkingProducts.has(item.id)
                    ? {
                        opacity: 0.6,
                        pointerEvents: "none",
                        cursor: "wait",
                      }
                    : {}),
                }}
              >
                {checkingProducts.has(item.id) && (
                  <div
                    className="loading-container"
                  >
                    <div className="loading-spinner"></div>
                    <p
                    >
                      Đang kiểm tra...
                    </p>
                  </div>
                )}
                <div className="item-cart-product">
                  <div className="img-item-cart-product">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                    <img
                      src={getImageUrl(item.productImage)}
                      alt={item.productName}
                    />
                  </div>

                  <div className="infor-action">
                    <div className="infor-item-cart-product">
                      <h4>{item.productName}</h4>
                      {item.discount && item.discount > 0 ? (
                        <>
                          <p
                          >
                            {formatCurrency(item.price)}
                          </p>
                          <p>
                            {formatCurrency(discountedPrice)} (-{item.discount}%)
                          </p>
                        </>
                      ) : (
                        <p>{formatCurrency(item.price)}</p>
                      )}
                      <h3>
                        Tổng: {formatCurrency(itemTotal)}
                        {isUpdating && (
                          <span className="saving-process"
                          >
                            • đang lưu...
                          </span>
                        )}
                      </h3>
                    </div>

                    <div
                      className="action-item-cart-product"
                      data-item-id={item.id}
                    >
                      <button
                        onClick={() => handleDecrease(item.id, item.quantity)}
                        style={
                          isUpdating
                            ? { opacity: 0.7 }
                            : item.quantity <= 1
                            ? { opacity: 0.5, cursor: "not-allowed" }
                            : {}
                        }
                      >
                        -
                      </button>
                      <h4 style={isUpdating ? { color: "#FC2B76" } : {}}>
                        {item.quantity}
                      </h4>
                      <button
                        onClick={() =>
                          handleIncrease(item.id, item.quantity, item.stock)
                        }
                        style={
                          isUpdating
                            ? { opacity: 0.7 }
                            : item.quantity >= item.stock
                            ? { opacity: 0.5, cursor: "not-allowed" }
                            : {}
                        }
                      >
                        +
                      </button>
                      <button onClick={() => openDeleteModal(item)}>
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
            );
          })}
        </div>

        <div className="content-right-cart">
          <div className="statistical">
            <h3>Thống Kê</h3>
            <div className="all-item-selected">
              <p>Sản phẩm đã chọn: </p>
              <p>{selectedItems.size}</p>
            </div>
            <div className="all-item-quantity">
              <p>Số lượng: </p>
              <p>{calculateSelectedQuantity()}</p>
            </div>
          </div>
          <hr />
          <div className="total-price">
            <p>Tổng Tiền:</p>
            <h3>{formatCurrency(calculateSelectedTotal())}</h3>
          </div>
          <div className="payment">
            <button
              disabled={selectedItems.size === 0}
              onClick={() => setIsModalOpen(true)}
            >
              Đặt hàng ({selectedItems.size} mặt hàng)
            </button>
            {selectedItems.size === 0 && (
              <p>Vui lòng chọn ít nhất một sản phẩm</p>
            )}
          </div>
        </div>
        <CheckoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmOrder}
          totalAmount={calculateSelectedTotal()}
          selectedItemIds={Array.from(selectedItems)}
        />

        <PopUpDeleteCartItem
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          productName={deleteModal.productName}
          productImage={deleteModal.productImage}
          loading={isDeleting}
        />
      </div>
    </div>
  );
};

export default Cart;
