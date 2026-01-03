//Mẫu response trả về với product (giao diện hiển thị sản phẩm và quản lý sản phẩm bên admin)
export interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  images?: any[];
  occasions?: string[];
  category: string;
  color?: string;
  description?: string;
  stock: number;
  soldCount?: number;
  status?: number;
}

//Mẫu response trả về với tất cả người dùng (admin) (data)
export interface AllUser {
  id: string;
  createdAt: string;
  updateAt: string;
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