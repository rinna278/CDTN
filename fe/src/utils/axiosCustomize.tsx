import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import NProgress from "nprogress";
import { store } from "../redux/store";
import { loginSuccess, logout } from "../redux/reducer+action/userSlice";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 100,
});

const instance = axios.create({
  baseURL: "http://localhost:8000",
});

// =============================
// --- GLOBAL REFRESH QUEUE ---
// =============================
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token)); // forEach thay vì map
  refreshSubscribers = [];
}

// =============================
// Request Interceptor
// =============================
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const access_token = store.getState().user.accessToken;

    if (access_token) {
      const headers = new AxiosHeaders(config.headers);
      headers.set("Authorization", `Bearer ${access_token}`);
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
    return response;
  },
  async (error: AxiosError) => {
    NProgress.done();
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status ?? 500;

    // ===================================
    // 1) Nếu 401 → thử refresh token
    // ===================================
    if (status === 401 && !originalRequest._retry) {
      // ✅ Thêm check _retry để tránh infinite loop
      originalRequest._retry = true;

      const { refreshToken, email, fullName, isFirstTimeLogin } =
        store.getState().user;

      if (!refreshToken) {
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // ====== Nếu đang refresh → đợi đến khi có token mới ======
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(instance(originalRequest));
          });
        });
      }

      // ====== Nếu chưa refresh → gọi API refresh ======
      isRefreshing = true;

      try {
        // ✅ Sửa endpoint cho đúng
        const res = await axios.post(
          "http://localhost:8000/api/v1/auth/refresh-token",
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        // ✅ Lưu cả refreshToken mới nếu backend có rotate
        store.dispatch(
          loginSuccess({
            fullName,
            email,
            accessToken,
            refreshToken: newRefreshToken || refreshToken,
            isFirstTimeLogin,
          })
        );

        // Thông báo cho các request khác đang chờ
        onTokenRefreshed(accessToken);

        // Gắn token mới vào request cũ
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        return instance(originalRequest);
      } catch (refreshError) {
        // ✅ Thông báo cho queue về lỗi
        refreshSubscribers.forEach((cb) => cb("")); // Clear queue
        refreshSubscribers = [];

        // refresh thất bại → logout
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ===================================
    // 2) Các lỗi khác thì trả về reject
    // ===================================
    return Promise.reject(error);
  }
);

export default instance;
