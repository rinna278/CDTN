import { useNavigate, useLocation } from "react-router-dom";
import "./forgot-password.css";
import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { postSubmitChangePassword } from "../../services/apiService";
import { toast } from "react-toastify";

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

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Set email từ state vào input nếu có
  useEffect(() => {
    if (emailFromState && emailRef.current) {
      emailRef.current.value = emailFromState;
    }
  }, [emailFromState]);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePassword = (password: string): boolean => {
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    return true;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Lấy giá trị từ ref
    const email = emailRef.current?.value.trim() || "";
    const otp = otpRef.current?.value.trim() || "";
    const newPassword = newPasswordRef.current?.value || "";

    // Validate email
    if (!validateEmail(email)) {
      toast.error("Email không hợp lệ");
      setLoading(false);
      return;
    }

    // Validate OTP
    if (!otp) {
      toast.error("Vui lòng nhập OTP");
      setLoading(false);
      return;
    }

    // Validate password
    if (!validatePassword(newPassword)) {
      setLoading(false);
      return;
    }

    try {
      const response = await postSubmitChangePassword(email, otp, newPassword);

      // Kiểm tra HTTP status code 200
      if (response.status === 200) {
        const successMessage =
          response.data.message || "Đổi mật khẩu thành công";

        // Hiển thị thông báo thành công
        toast.success(successMessage);

        // Clear input
        if (emailRef.current) emailRef.current.value = "";
        if (otpRef.current) otpRef.current.value = "";
        if (newPasswordRef.current) newPasswordRef.current.value = "";

        // Tự động redirect về login sau 2 giây
        setTimeout(() => {
          navigate("/login", { replace: true });
          setSelected("login");
        }, 2000);
      } else {
        // Trường hợp response không phải 200
        const errorMessage = response.data?.message || "Có lỗi xảy ra";
        toast.error(errorMessage);
        setErrorMsg(errorMessage);
      }
    } catch (error: any) {
      // Xử lý lỗi từ API
      const msg =
        error.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn";
      setErrorMsg(msg);
      toast.error(msg);

      // Clear OTP khi có lỗi
      if (otpRef.current) otpRef.current.value = "";
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
