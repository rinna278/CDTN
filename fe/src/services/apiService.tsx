import instance from '../utils/axiosCustomize'


//Người dùng
const postLogin = (userEmail: string, userPassword: string) => {
  return instance.post(`api/v1/login`, {
    email: userEmail,
    password: userPassword,
  });
};


const postSendOTP = (userEmail: string) => {
  return instance.post(`api/v1/send-otp`, {
    email: userEmail
  })
};

const postRegister = (userEmail: string, userPassword: string, userName: string, otp: string) => {
  return instance.post(`api/v1/register`, {
    email: userEmail,
    password: userPassword,
    name: userName,
    otp: otp
  })
}

const postSendOTPChangePassword = (userEmail: string) => {
  return instance.post(`api/v1/send-otp-forgot-password`, {
    email: userEmail
  })
}

const postSubmitChangePassword = (userEmail: string, otp: string, newPassword: string) => {
  return instance.post(`api/v1/forgot-password`, {
    email: userEmail,
    otp: otp,
    newPassword: newPassword
  })
}


const getInfo = () => {
  return instance.get(`api/v1/users/info`);
};


const PatchUpdateUser = (id: string, name: string) => {
  return instance.patch(`api/v1/users/${id}`, {
    name : name
  })
}

const PatchUpdatePassword = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
  return instance.patch(`api/v1/users/change-password`, {
    oldPassword : oldPassword,
    newPassword : newPassword,
    confirmPassword : confirmPassword
  });
}


//Product

const getAllProduct = async () => {
  const response = await instance.get(`api/v1/products`);
  return response.data;
}

const postCreateProduct = async (name: string, price: number, stock: number, description?: string, discount?: number, category?: string, image?: string[], color?: string, occasions?: string[], status?: number) => {
  const response = await instance.post(`api/v1/products`,{
    name: name,
    price: price,
    stock: stock,
    description: description,
    discount: discount,
    category: category,
    image: image,
    color: color,
    occasions: occasions,
    status: status
  })
  return response.data;
}


export {postLogin, postSendOTP, postRegister, postSendOTPChangePassword, postSubmitChangePassword, getInfo, PatchUpdatePassword, PatchUpdateUser, getAllProduct, postCreateProduct}