import axios from "axios";
import instance from "../utils/axiosCustomize";
import {
  AllUserResponse,
  CreateProductPayload,
  UpdateProductPayload,
  Product,
  GetMyOrdersParams,
  OrderListResponse,
  CancelOrderPayload,
  GetAllOrdersParams,
  UpdateOrderStatusPayload,
  UpdateShippingPayload,
  CreateOrderPayload,
} from "../types/type";
import { Province } from "../types/type";
import { District } from "../types/type";
import { Ward } from "../types/type";
import { AddressData } from "../types/type";
import { GetProductsParams } from "../types/type";
const PROVINCE_API_BASE = "https://provinces.open-api.vn/api";

interface AddressResponse extends AddressData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SingleProductResponse {
  data: Product;
  success?: boolean;
  message?: string;
}

//Người dùng
const postLogin = (userEmail: string, userPassword: string) => {
  return instance.post(`api/v1/login`, {
    email: userEmail,
    password: userPassword,
  });
};

const postSendOTP = (userEmail: string) => {
  return instance.post(`api/v1/send-otp`, {
    email: userEmail,
  });
};

const postRegister = (
  userEmail: string,
  userPassword: string,
  userName: string,
  otp: string
) => {
  return instance.post(`api/v1/register`, {
    email: userEmail,
    password: userPassword,
    name: userName,
    otp: otp,
  });
};

const postSendOTPChangePassword = (userEmail: string) => {
  return instance.post(`api/v1/send-otp-forgot-password`, {
    email: userEmail,
  });
};

const postSubmitChangePassword = (
  userEmail: string,
  otp: string,
  newPassword: string
) => {
  return instance.post(`api/v1/forgot-password`, {
    email: userEmail,
    otp: otp,
    newPassword: newPassword,
  });
};

const getInfo = () => {
  return instance.get(`api/v1/users/info`);
};

const getAllUser = async () => {
  const response = await instance.get(`api/v1/users`);
  console.log("Thông tin response.data:", response.data);
  return response.data as AllUserResponse; // ✅ Trả về đúng cấu trúc
};

const PatchUpdateUser = (id: string, name: string, phone: string) => {
  return instance.patch(`api/v1/users/${id}`, {
    name: name,
    phone: phone,
  });
};

const PatchUpdatePassword = async (
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  return instance.patch(`api/v1/users/change-password`, {
    oldPassword: oldPassword,
    newPassword: newPassword,
    confirmPassword: confirmPassword,
  });
};

// Lấy tất cả tỉnh/thành phố
const getAllProvinces = async () => {
  const response = await axios.get(`${PROVINCE_API_BASE}/p/`);
  return response.data as Province[];
};

// Lấy danh sách quận/huyện theo tỉnh đã chọn
const getDistrictsByProvinceCode = async (provinceCode: number) => {
  const response = await axios.get(`${PROVINCE_API_BASE}/p/${provinceCode}`, {
    params: { depth: 2 },
  });
  return response.data.districts as District[];
};

// Lấy danh sách phường/xã theo quận đã chọn
const getWardsByDistrictCode = async (districtCode: number) => {
  const response = await axios.get(`${PROVINCE_API_BASE}/d/${districtCode}`, {
    params: { depth: 2 },
  });
  return response.data.wards as Ward[];
};

// Lấy tất cả địa chỉ của user hiện tại
const getAllAddresses = async () => {
  const response = await instance.get(`api/v1/addresses`);
  return response.data as AddressResponse[];
};

// Lấy địa chỉ mặc định
const getDefaultAddress = async () => {
  const response = await instance.get(`api/v1/addresses/default`);
  return response.data as AddressResponse | null;
};

// Lấy địa chỉ theo ID
const getAddressById = async (id: string) => {
  const response = await instance.get(`api/v1/addresses/${id}`);
  return response.data as AddressResponse;
};

// Tạo địa chỉ mới
const createAddress = async (data: AddressData) => {
  const response = await instance.post(`api/v1/addresses`, data);
  return response.data as AddressResponse;
};

// Cập nhật địa chỉ
const updateAddress = async (id: string, data: Partial<AddressData>) => {
  const response = await instance.patch(`api/v1/addresses/${id}`, data);
  return response.data as AddressResponse;
};

// Xóa địa chỉ
const deleteAddress = async (id: string) => {
  const response = await instance.delete(`api/v1/addresses/${id}`);
  return response.data;
};

// Đặt địa chỉ làm mặc định
const setAsDefaultAddress = async (id: string) => {
  const response = await instance.patch(`api/v1/addresses/${id}/set-default`);
  return response.data as AddressResponse;
};

//Product

const getAllProduct = async (params: GetProductsParams) => {
  const response = await instance.get("api/v1/products", {
    params,
  });
  return response.data as ProductResponse;
};

const getProductByID = async (productID: string) => {
  const response = await instance.get(`api/v1/products/${productID}`);
  return response.data as SingleProductResponse;
};

const postCreateProduct = async (payload: CreateProductPayload) => {
  const response = await instance.post(`api/v1/products`, payload);
  return response.data;
};

const updateProduct = async (id: string, payload: UpdateProductPayload) => {
  const response = await instance.patch(`api/v1/products/${id}`, payload);
  return response.data;
};

// ✅ Update stock cho variant cụ thể
const updateVariantStock = async (
  productId: string,
  color: string,
  quantity: number
) => {
  const response = await instance.patch(`api/v1/products/${productId}/stock`, {
    color,
    quantity,
  });
  return response.data;
};

// ✅ Lấy available colors
const getAvailableColors = async (productId: string) => {
  const response = await instance.get(
    `api/v1/products/${productId}/available-colors`
  );
  return response.data as string[];
};
// ✅ Lấy variant theo màu
const getVariantByColor = async (productId: string, color: string) => {
  const response = await instance.get(
    `api/v1/products/${productId}/variant/${color}`
  );
  return response.data;
};

const deleteProduct = async (id: string) => {
  const response = await instance.delete(`api/v1/products/${id}`);
  return response.data;
};

//Upload 1 ảnh
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await instance.post(`api/v1/upload/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

//Upload nhiều ảnh
const uploadImages = async (files: File[]) => {
  if (files.length > 6) {
    throw new Error("Maximum 5 files allowed per request");
  }
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  const response = await instance.post(`api/v1/upload/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

//Xóa ảnh theo publicId (một ảnh)
const deleteImage = async (publicId: string) => {
  const response = await instance.delete(`api/v1/upload/image/${publicId}`, {
    data: {
      publicId: publicId,
    },
  });
  return response.data;
};

//Xóa ảnh theo publicIds (nhiều ảnh)
const deleteImages = async (publicIds: string[]) => {
  const response = await instance.delete(`api/v1/upload/images`, {
    data: {
      publicIds: publicIds,
    },
  });
  return response.data;
};

// Lấy signed parameters để upload trực tiếp từ client
const getSignedUploadParams = async () => {
  const response = await instance.get("api/v1/upload/sign");
  return response.data;
};

// ✅ Cập nhật postAddToCart để hỗ trợ color
const postAddToCart = async (
  productID: string,
  quantity: number,
  color: string
) => {
  const response = await instance.post("api/v1/cart/items", {
    productId: productID,
    quantity: quantity,
    color: color, // ✅ Thêm màu
  });
  return response.data;
};

//Lấy tất cả item trong giỏ
const getAllItemInCart = async () => {
  const response = await instance.get("api/v1/cart");
  return response.data;
};

const updateCart = async (itemId: string, quantity: number) => {
  const response = await instance.patch(`api/v1/cart/items/${itemId}`, {
    quantity: quantity,
  });
  return response.data;
};

const deleteItemInCart = async (itemId: string) => {
  const response = await instance.delete(`api/v1/cart/items/${itemId}`);
  return response.data;
};


// Hàm gọi API tạo đơn hàng
const postCreateOrder = async (payload: CreateOrderPayload) => {
  const response = await instance.post(`api/v1/orders`, payload);
  return response.data; 
  // Lưu ý: Nếu là COD, trả về thông tin đơn hàng. 
  // Nếu là VNPay, trả về { paymentUrl: string, orderId: string }
};

//Lấy danh sách đơn hàng của người dùng
const getMyOrders = async (params: GetMyOrdersParams) => {
  const response = await instance.get(`api/v1/orders/my-orders`, { params });
  return response.data as OrderListResponse;
};

//Lấy chi tiết đơn hàng
const getOrderById = async (orderId: string) => {
  const response = await instance.get(`api/v1/orders/${orderId}`);
  return response.data;
};

//Hủy một đơn hàng
const cancelOrder = async (orderId: string, payload: CancelOrderPayload) => {
  const response = await instance.patch(
    `api/v1/orders/${orderId}/cancel`,
    payload
  );
  return response.data;
};

//VN Pay payment
const handleVNPayCallback = async (queryParams: any) => {
  const response = await instance.get(`api/v1/orders/payment/vnpay-callback`, {
    params: queryParams,
  });
  return response.data;
};

//admin: lấy tất cả đơn
const getAllOrders = async (params: GetAllOrdersParams) => {
  const response = await instance.get(`api/v1/orders/admin/all`, { params });
  return response.data as OrderListResponse;
};

//Láy chi tiết đơn (admin)
const getOrderByIdAdmin = async (orderId: string) => {
  const response = await instance.get(`api/v1/orders/admin/${orderId}`);
  return response.data;
};

const updateOrderStatus = async (
  orderId: string,
  payload: UpdateOrderStatusPayload
) => {
  const response = await instance.patch(
    `api/v1/orders/admin/${orderId}/status`,
    payload
  );
  return response.data;
};

const updateShipping = async (
  orderId: string,
  payload: UpdateShippingPayload
) => {
  const response = await instance.patch(
    `api/v1/orders/admin/${orderId}/shipping`,
    payload
  );
  return response.data;
};

export {
  postLogin,
  postSendOTP,
  postRegister,
  postSendOTPChangePassword,
  postSubmitChangePassword,
  getInfo,
  getAllUser,
  PatchUpdatePassword,
  PatchUpdateUser,
  getAllProduct,
  getProductByID,
  postCreateProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  uploadImages,
  deleteImage,
  deleteImages,
  getSignedUploadParams,
  getAllProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
  getAddressById,
  getAllAddresses,
  getDefaultAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setAsDefaultAddress,
  postAddToCart,
  getAllItemInCart,
  updateCart,
  deleteItemInCart,
  getAvailableColors,
  getVariantByColor,
  updateVariantStock,
  postCreateOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  handleVNPayCallback,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  updateShipping
};
