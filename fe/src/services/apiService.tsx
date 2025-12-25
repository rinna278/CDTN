import instance from "../utils/axiosCustomize";

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
  deleteProduct
};
