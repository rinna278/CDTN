import { useNavigate, useLocation } from "react-router-dom";
import "./forgot-password.css";
import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { postSubmitChangePassword } from "../../services/apiService";
import { toast } from "react-toastify";
import {
  validateEmail,
  validatePassword,
  validateOTP,
  handleEmailInput,
  handlePasswordInput,
} from "../../utils/validate";


interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

const ForgotPassword = ({ selected, setSelected }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy email từ navigation state (nếu có)
  const emailFromState = location.state?.email || "";

  const emailRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);


  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Set email từ state vào input nếu có
  useEffect(() => {
    if (emailFromState && emailRef.current) {
      emailRef.current.value = emailFromState;
    }
  }, [emailFromState]);



  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const email = emailRef.current?.value || "";
    const otp = otpRef.current?.value || "";
    const newPassword = newPasswordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";

    // ✅ Validate email
    if (!validateEmail(email)) {
      setLoading(false);
      return;
    }

    // ✅ Validate OTP
    if (!validateOTP(otp)) {
      setLoading(false);
      return;
    }

    // ✅ Validate mật khẩu mới
    if (!validatePassword(newPassword)) {
      setLoading(false);
      return;
    }

    // ✅ Check confirm password
    if (!confirmPassword) {
      toast.error("Vui lòng nhập xác nhận mật khẩu");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      setErrorMsg("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    try {
      const response = await postSubmitChangePassword(email, otp, newPassword);

      if (response.status === 200) {
        toast.success(response.data.message || "Đổi mật khẩu thành công");

        emailRef.current!.value = "";
        otpRef.current!.value = "";
        newPasswordRef.current!.value = "";
        confirmPasswordRef.current!.value = "";

        setTimeout(() => {
          navigate("/login", { replace: true });
          setSelected("login");
        }, 2000);
      } else {
        toast.error(response.data?.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn";
      toast.error(msg);
      setErrorMsg(msg);
      otpRef.current!.value = "";
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-container">
      <div className="form-container">
        <p className="title">Forgot Password</p>
        <p className="subtitle">
          Nhập email, OTP và mật khẩu mới để đặt lại mật khẩu. Sau khi đổi mật
          khẩu thành công, bạn sẽ được tự động chuyển về trang đăng nhập.
        </p>
        <form className="form" onSubmit={handleChangePassword}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="example@gmail.com"
              ref={emailRef}
              disabled={loading}
              onInput={handleEmailInput}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="otp">OTP (6 chữ số)</label>
            <input
              type="text"
              name="otp"
              id="otp"
              placeholder="Nhập mã OTP"
              ref={otpRef}
              disabled={loading}
              maxLength={6}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Mật khẩu mới</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              ref={newPasswordRef}
              onInput={handlePasswordInput}
              disabled={loading}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              ref={confirmPasswordRef}
              onInput={handlePasswordInput}
              disabled={loading}
              required
            />
          </div>

          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <button className="sign" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>

        <div className="back-to-login">
          <button
            className="btn-return-login-form"
            type="button"
            onClick={() => {
              navigate("/login");
              setSelected("login");
            }}
            disabled={loading}
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
