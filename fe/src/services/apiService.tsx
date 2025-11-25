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


export {postLogin, postSendOTP, postRegister}