import axios, { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import NProgress from "nprogress";
import { store } from "../redux/store";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 100,
});

// Tạo axios instance
const instance = axios.create({
  baseURL: "http://localhost:8000",
});

// =============================
// Request Interceptor
// =============================
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const access_token = store?.getState()?.user?.accessToken;

    if (access_token) {
      const headers = new AxiosHeaders(config.headers);
      headers.set('Authorization', `Bearer ${access_token}`);
      config.headers = headers;
    }

    NProgress.start();
    return config;
  },
  (error: AxiosError) => {
    NProgress.done();
    return Promise.reject(error);
  }
);

// =============================
// Response Interceptor
// =============================
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    NProgress.done();
    
    // ✅ Phải return toàn bộ response object
    return response;
  },
  (error: AxiosError<any>) => {
    NProgress.done();

    const status = error.response?.status ?? 500;

    // Token expired (ví dụ backend trả 401)
    if (status === 401) {
      window.location.href = "/login";
    }

    // ✅ Reject promise với error để handle ở nơi gọi API
    return Promise.reject(error);
  }
);

export default instance;