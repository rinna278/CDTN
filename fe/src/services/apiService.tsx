import axios from "axios";
import instance from "../utils/axiosCustomize";

const PROVINCE_API_BASE = "https://provinces.open-api.vn/api";


interface Province {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
}

interface District {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  province_code: number;
}

interface Ward {
  code: number;
  name: string;
  name_en: string;
  full_name: string;
  full_name_en: string;
  district_code: number;
}

interface AddressData {
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault?: boolean;
  postalCode?: string;
  notes?: string;
}

interface AddressResponse extends AddressData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}


interface GetProductsParams {
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

export interface ProductResponse {
  data: any[]; 
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

const PatchUpdateUser = (id: string, name: string, phone: string) => {
  return instance.patch(`api/v1/users/${id}`, {
    name: name,
    phone: phone
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

const postCreateProduct = async (payload: any) => {
  const response = await instance.post(`api/v1/products`, {
    ...payload
  });
  return response.data;
};

const updateProduct = async (
  id: string,
  name: string,
  price: number,
  stock: number,
  description?: string,
  discount?: number,
  category?: string,
  images?: string[],
  color?: string,
  occasions?: string[],
  status?: number
) => {
  const response = await instance.patch(`api/v1/products/${id}`, {
    name,
    price,
    stock,
    description,
    discount,
    category,
    images,
    color,
    occasions,
    status,
  });
  return response.data;
};
const deleteProduct = async (id: string) => {
  const response = await instance.delete(`api/v1/products/${id}`);
  return response.data;
};

//Upload 1 ảnh
const uploadImage = async(file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await instance.post(`api/v1/upload/image`, formData, {
    headers:{
      'Contend-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

//Upload nhiều ảnh
const uploadImages = async(files: File[]) => {
  if (files.length > 6){
    throw new Error('Maximum 5 files allowed per request');
  }
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  const response = await instance.post(`api/v1/upload/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

//Xóa ảnh theo publicId (một ảnh)
const deleteImage = async(publicId : string) => {
  const response = await instance.delete(`api/v1/upload/image/${publicId}`, {
    data: {
      publicId: publicId,
    },
  });
  return response.data;
}


//Xóa ảnh theo publicIds (nhiều ảnh)
const deleteImages = async(publicIds: string[]) => {
  const response = await instance.delete(`api/v1/upload/images`, {
    data: {
      publicIds: publicIds,
    },
  });
  return response.data;
}

// Lấy signed parameters để upload trực tiếp từ client
const getSignedUploadParams = async () => {
  const response = await instance.get('api/v1/upload/sign');
  return response.data;
};




export {
  postLogin,
  postSendOTP,
  postRegister,
  postSendOTPChangePassword,
  postSubmitChangePassword,
  getInfo,
  PatchUpdatePassword,
  PatchUpdateUser,
  getAllProduct,
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
  setAsDefaultAddress
};
