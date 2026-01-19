import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { Dispatch, SetStateAction, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
  loginSuccess,
  loginFailure,
} from "../../redux/reducer+action/userSlice";
import {
  postLogin,
  postSendOTPChangePassword,
} from "../../services/apiService";
import { toast } from "react-toastify";
import { fetchCartFromServer } from "../../redux/reducer+action/cartSlice";
import {
  validateEmail,
  validatePassword,
  handleEmailInput,
  handleEmailPaste,
  handlePasswordInput,
  handlePasswordPaste,
} from "../../utils/validate";

interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

const Login = ({ selected, setSelected }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isLogined = useSelector((state: RootState) => state.user.loggedIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSignUp = () => {
    setSelected("register");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Validate email và password
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      setLoading(false);
      return;
    }

    try {
      const response = await postLogin(email.trim(), password.trim());

      // Clear inputs sau khi đăng nhập thành công
      setEmail("");
      setPassword("");

      dispatch(
        loginSuccess({
          fullName: response.data.fullName,
          email: response.data.email,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          isFirstTimeLogin: response.data.isFirstTimeLogin,
        }),
      );
      dispatch(fetchCartFromServer() as any);

      toast.success("Đăng nhập thành công");
      navigate("/", { replace: true });
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 500) {
        toast.error("Tài khoản không tồn tại");
      } else if (status === 401) {
        toast.error("Email hoặc mật khẩu không chính xác");
      } else {
        toast.error("Đăng nhập thất bại");
      }

      const msg = "Login failed";
      setErrorMsg(msg);
      dispatch(loginFailure(msg));

      // Chỉ clear password khi đăng nhập thất bại
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotModal(true);
    setForgotEmail("");
  };

  const handleCloseModal = () => {
    setShowForgotModal(false);
    setForgotEmail("");
  };

  const handleSendOTPForgotPassword = async () => {
    // Validate email trước khi gửi OTP
    if (!validateEmail(forgotEmail, "Email khôi phục")) {
      return;
    }

    setForgotLoading(true);

    try {
      const response = await postSendOTPChangePassword(forgotEmail.trim());

      if (response.data.success) {
        toast.success("OTP đã được gửi đến email của bạn");
        handleCloseModal();
        navigate("/forgot-password", { state: { email: forgotEmail.trim() } });
      } else {
        toast.error("Gửi OTP thất bại. Vui lòng thử lại.");
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) {
        toast.error("Email không tồn tại trong hệ thống");
      } else {
        toast.error(
          error.response?.data?.message || "Có lỗi xảy ra khi gửi OTP",
        );
      }
    } finally {
      setForgotLoading(false);
    }
  };

  if (isLogined) return null;

  return (
    <div className="login-container">
      <div className="form-container">
        <p className="title">Login</p>
        <form className="form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onInput={handleEmailInput}
              onPaste={handleEmailPaste}
              placeholder="Nhập email của bạn"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onInput={handlePasswordInput}
              onPaste={handlePasswordPaste}
              placeholder="Nhập password của bạn"
              autoComplete="current-password"
            />

            <div className="forgot">
              <button
                className="forgot-link"
                type="button"
                onClick={handleForgotPasswordClick}
              >
                Forgot Password ?
              </button>
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

        <div className="social-icons"></div>

        <p className="signup">
          Don't have an account?
          <Link to="/register" onClick={handleSignUp}>
            Sign up
          </Link>
        </p>
      </div>

      {/* Modal Forgot Password */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content-login"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-login">
              <h3>Forgot Password</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại
                mật khẩu.
              </p>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  onInput={handleEmailInput}
                  onPaste={handleEmailPaste}
                  placeholder="Nhập email của bạn"
                  disabled={forgotLoading}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSendOTPForgotPassword();
                  }}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={handleCloseModal}
                disabled={forgotLoading}
              >
                Cancel
              </button>

              <button
                className="send-otp-btn"
                onClick={handleSendOTPForgotPassword}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
