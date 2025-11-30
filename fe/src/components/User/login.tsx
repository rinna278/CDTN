import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
  loginSuccess,
  loginFailure,
} from "../../redux/reducer+action/userSlice";
import { postLogin } from "../../services/apiService";
import { toast } from "react-toastify";

interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

const Login = ({ selected, setSelected }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isLogined = useSelector((state: RootState) => state.user.loggedIn);

  // Sử dụng useRef thay vì useState
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignUp = () => {
    setSelected("register");
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Lấy giá trị từ ref
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      toast.error("Invalid email");
      setLoading(false);
      return;
    }
    if (!password) {
      toast.error("Invalid password");
      setLoading(false);
      return;
    }

    try {
      const response = await postLogin(email, password);

      // Clear input ngay sau khi login thành công
      if (emailRef.current) emailRef.current.value = "";
      if (passwordRef.current) passwordRef.current.value = "";

      // Gọi Redux action loginSuccess
      dispatch(
        loginSuccess({
          fullName: response.data.fullName,
          email: response.data.email,
          accessToken: response.data.accessToken,
          isFirstTimeLogin: response.data.isFirstTimeLogin,
        })
      );

      toast.success("Đăng nhập thành công");
      navigate("/", { replace: true });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Login failed";
      setErrorMsg(msg);
      dispatch(loginFailure(msg));

      // Clear password khi login thất bại (bảo mật)
      if (passwordRef.current) passwordRef.current.value = "";
    } finally {
      setLoading(false);
    }
  };

  // Nếu đã login, không render trang login
  if (isLogined) return null;

  //VIẾT HÀM HIỆN MODAL NHẬP EMAIL KHI FORGOT-PASSWORD, HIỆN MODAL CHỈ CÓ 1 INPUT NHẬP EMAIL (VALIDATE BẰNG CÁCH NẾU CÓ SUCCESS BẰNG TRUE THÌ SẼ TBAO SEND OTP THÀNH CÔNG, NẾU SUCCESS = FALSE THÌ HIỆN TBAO EMAIL KO TỒN TẠI HOẶC BỊ LỖI TRONG QUÁ TRÌNH GỬI)
  //DƯỚI THÊM 1 NÚT SENDOTP, NẾU THÀNH CÔNG THÌ HIỆN THÔNG BÁO VÀ REDIRECT SANG FORGOT-PASSWORD, KO THÌ BÁO LỖI 

  return (
    <div className="login-container">
      <div className="form-container">
        <p className="title">Login</p>
        <form className="form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              id="email"
              placeholder=""
              ref={emailRef}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder=""
              ref={passwordRef}
              required
            />
            <div className="forgot">
              <a rel="noopener noreferrer" >
                Forgot Password ?
              </a>
            </div>
          </div>
          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
          <button className="sign" type="submit" disabled={loading}>
            {loading && !errorMsg ? "Loading..." : "Sign in"}
          </button>
        </form>

        <div className="social-message">
          <div className="line"></div>
          <p className="message">Login with social accounts</p>
          <div className="line"></div>
        </div>
        <div className="social-icons">{/* Các button social */}</div>
        <p className="signup">
          Don't have an account?
          <Link rel="noopener noreferrer" to="/register" onClick={handleSignUp}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
