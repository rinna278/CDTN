import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { Dispatch, SetStateAction, useRef, useState } from "react";
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

interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

const Login = ({ selected, setSelected }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isLogined = useSelector((state: RootState) => state.user.loggedIn);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const forgotEmailRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotEmailError, setForgotEmailError] = useState("");

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

    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    if (!validateEmail(email)) {
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

      if (emailRef.current) emailRef.current.value = "";
      if (passwordRef.current) passwordRef.current.value = "";

      dispatch(
        loginSuccess({
          fullName: response.data.fullName,
          email: response.data.email,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          isFirstTimeLogin: response.data.isFirstTimeLogin,
        })
      );
      dispatch(fetchCartFromServer() as any);

      toast.success("Đăng nhập thành công");
      navigate("/", { replace: true });
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 500){
        toast.error('Tài khoản không tồn tại');
      }
      const msg = error.response?.data?.message || "Login failed";
      setErrorMsg(msg);
      dispatch(loginFailure(msg));

      if (passwordRef.current) passwordRef.current.value = "";
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotModal(true);
    setForgotEmailError("");
  };

  const handleCloseModal = () => {
    setShowForgotModal(false);
    setForgotEmailError("");
    if (forgotEmailRef.current) forgotEmailRef.current.value = "";
  };

  const handleSendOTPForgotPassword = async () => {
    const email = forgotEmailRef.current?.value || "";

    if (!validateEmail(email)) {
      setForgotEmailError("Please enter a valid email address");
      return;
    }

    setForgotLoading(true);
    setForgotEmailError("");

    try {
      const response = await postSendOTPChangePassword(email);

      if (response.data.success) {
        toast.success("OTP sent successfully to your email");
        handleCloseModal();
        navigate("/forgot-password", { state: { email } });
      } else {
        setForgotEmailError("Failed to send OTP. Please try again.");
        toast.error("Failed to send OTP");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Email does not exist or error occurred";
      setForgotEmailError(msg);
      toast.error(msg);
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
            <input type="text" id="email" ref={emailRef} required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" ref={passwordRef} required />

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
          <div className="modal-content-login" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-login">
              <h3>Forgot Password</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Enter your email address and we'll send you an OTP to reset your
                password.
              </p>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  ref={forgotEmailRef}
                  placeholder="Enter your email"
                  disabled={forgotLoading}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSendOTPForgotPassword();
                  }}
                />
              </div>

              {forgotEmailError && (
                <div className="error-message">{forgotEmailError}</div>
              )}
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
