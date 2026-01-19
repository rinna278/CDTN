
export interface CreateProductPayload {
  name: string;
  price: number;
  description?: string;
  discount?: number;
  category?: string;

  images?: Array<{
    url: string;
    publicId: string;
  }>;

  occasions?: string[];

  variants: Array<{
    color: string;
    image: {
      url: string;
      publicId: string;
    };
    stock: number;
  }>;

  status?: number;
}


export type UpdateProductPayload = Partial<CreateProductPayload>;


export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  discount?: number;
  category?: string;

  images?: Array<{
    url: string;
    publicId: string;
  }>;

  occasions?: string[];

  variants?: Array<{
    color: string;
    image: {
      url: string;
      publicId: string;
    };
    stock: number;
    reservedStock: number;
  }>;

  status: number;

  totalStock: number;
  soldCount: number;

  createdAt: string;
  updatedAt: string;
}


//Mẫu response trả về với tất cả người dùng (admin) (data)
export interface AllUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  cart: string[] | null;
  email: string;
  status: string | number;
  phone: string | null;
  role?: {
    id: string;
    name: string;
    type: number;
    isSuperAdmin: boolean;
  };
}

// Trả về người dùng kèm phân trang
export interface AllUserResponse {
  data: AllUser[];
  page: number;
  pageSize: number;
  totalPage: number;
  totalItem: number;
}

//Mẫu response trả về tỉnh thành (update profile)
export interface Province {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
}

//Mẫu response trả về quận huyện (update profile)
export interface District {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  province_code: number;
}

//Mẫu response trả về xã, làng (update profile)
export interface Ward {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  district_code: number;
}

//Mẫu response trả về cả 3 tỉnh, huyện, xã gộp vào (update profile)
export interface AddressData {
  recipientName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault?: boolean;
  postalCode?: string;
  notes?: string;
}

//Mẫu response lấy các giá trị param của product khi phân trang
export interface GetProductsParams {
  page?: number;
  limit?: number;
  occasions?: string[];
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  status?: number;
  search?: string;
  category?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  discount?: number;
  subtotal: number;
  stock: number;
  color?: string;
}

export interface Cart {
  id: string;
  userId: string;
  status: number;
  totalItems: number;
  totalPrice: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  addressId: string;
  paymentMethod: "cod" | "vnpay" | "momo" | "bank_transfer";
  notes?: string;
  discountCode?: string;
  cartItemIds?: string[];
}


export enum PaymentMethod {
  COD = "cod",
  VNPAY = "vnpay",
  MOMO = "momo",
  ZALOPAY = "zalopay",
  BANK_TRANSFER = "bank_transfer",
}


export interface GetMyOrdersParams {
  page?: number;
  limit?: number;
  orderStatus?: string;
  paymentStatus?: string;
}


export interface CancelOrderPayload{
  reason: string;
}

//Lấy tất cả đơn hàng (admin)
export interface GetAllOrdersParams {
  page?: number;
  limit?: number;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  orderCode?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus; // 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled'
  reason?: string; // Bắt buộc nếu status = 'cancelled'
}

// Cập nhật thông tin vận chuyển (Admin)
export interface UpdateShippingPayload {
  shippingProvider?: string; // 'GHN' | 'GHTK' | 'J&T' | 'ViettelPost'
  trackingNumber?: string;
}



export enum OrderStatus {
  PENDING = "pending", // Chờ xác nhận
  CONFIRMED = "confirmed", // Đã xác nhận
  PROCESSING = "processing", // Đang xử lý
  SHIPPING = "shipping", // Đang giao
  DELIVERED = "delivered", // Đã giao
  REFUND_REQUESTED = "refund_requested", // Yêu cầu hoàn tiền
  CANCELLED = "cancelled", // Đã hủy
  REFUNDED = "refunded", // Đã hoàn tiền
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
}

export interface OrderItem {
  id: string;
  productId: string;
  userId:string;
  productName: string;
  productImage: string;
  color: string;
  price: number;
  discount: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;

  items: OrderItem[];
  totalItems: number;
  totalAmount: number;

  orderDate: string;
  createdAt: string;
}

export interface OrderAdmin {
  id: string;
  orderCode: string;
  userId: string;

  recipientName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  city: string;

  totalItems: number;
  subtotal: string;
  discountAmount: string;
  shippingFee: string;
  totalAmount: string;

  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;

  createdAt: string;
  updatedAt: string;

  expirationTime?: {
    remainingSeconds: number;
    remainingMinutes: number;
    remainingHours: number;
    isExpired: boolean;
    expiresAt: string;
  };
}

export interface AdminOrderListResponse {
  data: OrderAdmin[];
  total: number;
  page: number;
  limit: number;
}


export interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface ManageOrderItem {
  id: string;
  maDon: string;
  userId: string;
  nameCustomer: string;
  totalPrice: string;
  status: string;
  date: string;
}


//search context
export interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

//top sản phẩm
export interface TopCategory {
  rank: number;
  categoryName: string;
  soldCount: number;
  revenue: number;
}
