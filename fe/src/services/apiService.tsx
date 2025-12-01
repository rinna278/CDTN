import instance from '../utils/axiosCustomize'

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


export {postLogin, postSendOTP, postRegister, postSendOTPChangePassword, postSubmitChangePassword, getInfo}