import { Link, useNavigate } from "react-router-dom";
import "./register.css";
import { Dispatch, SetStateAction, useState, useRef } from "react";
import { postSendOTP, postRegister } from "../../services/apiService";
import { toast } from "react-toastify";

interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

const Register = ({ selected, setSelected }: HeaderProps) => {
  const navigate = useNavigate();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false); // Track xem đã gửi OTP chưa

  // Sử dụng useRef thay vì useState
  const userNameRef = useRef<HTMLInputElement>(null);
  const userEmailRef = useRef<HTMLInputElement>(null);
  const userPasswordRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    setSelected("login");
  };

  const handleSignUpClick = (e: React.FormEvent) => {
    e.preventDefault();

    // Lấy giá trị từ ref
    const userName = userNameRef.current?.value || "";
    const userEmail = userEmailRef.current?.value || "";
    const userPassword = userPasswordRef.current?.value || "";

    if (!userName || !userEmail || !userPassword) {
      toast.info("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    // Validate password length
    if (userPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    // Hiện modal OTP
    setShowOtpModal(true);
    setIsOtpSent(false); // Reset trạng thái OTP
  };

  const handleSendOtp = async () => {
    try {
      const userEmail = userEmailRef.current?.value || "";

      if (!userEmail) {
        toast.error("Vui lòng nhập email!");
        return;
      }

      console.log("Sending OTP...");
      const response = await postSendOTP(userEmail);

      // Hiển thị message từ backend
      if (response.data.success) {
        toast.success(
          response.data.message || "OTP đã được gửi đến email của bạn!"
        );
        setIsOtpSent(true);
      }
    } catch (err: any) {
      console.error(err);

      // Xử lý lỗi từ backend
      if (err.response?.data) {
        const errorMessage =
          err.response.data.message || err.response.data.errors;

        if (errorMessage.includes("already registered")) {
          toast.error("Email này đã được đăng ký!");
        } else {
          toast.error(errorMessage || "Gửi OTP thất bại!");
        }
      } else {
        toast.error("Gửi OTP thất bại!");
      }
    }
  };

  const handleSubmitOtp = async () => {
    const otp = otpRef.current?.value || "";

    if (!otp) {
      toast.info("Vui lòng nhập OTP!");
      return;
    }

    if (!isOtpSent) {
      toast.warning("Vui lòng gửi OTP trước!");
      return;
    }

    try {
      const userName = userNameRef.current?.value || "";
      const userEmail = userEmailRef.current?.value || "";
      const userPassword = userPasswordRef.current?.value || "";

      const response = await postRegister(
        userEmail,
        userPassword,
        userName,
        otp
      );

      // Hiển thị message thành công từ backend
      if (response.data.success || response.data.message) {
        toast.success(response.data.message || "Đăng ký thành công!");
      } else {
        toast.success("Đăng ký thành công!");
      }

      // Clear tất cả input sau khi đăng ký thành công
      if (userNameRef.current) userNameRef.current.value = "";
      if (userEmailRef.current) userEmailRef.current.value = "";
      if (userPasswordRef.current) userPasswordRef.current.value = "";
      if (otpRef.current) otpRef.current.value = "";

      setShowOtpModal(false);
      setIsOtpSent(false);
      setSelected("login"); // chuyển sang login
      navigate('/login');
    } catch (err: any) {
      console.error(err);

      // Xử lý lỗi từ backend
      if (err.response?.data) {
        const errorMessage =
          err.response.data.message || err.response.data.errors;

        if (errorMessage.includes("username already exists")) {
          toast.error("Tên người dùng đã tồn tại. Vui lòng nhập tên khác!");
        } else if (errorMessage.includes("OTP")) {
          toast.error("OTP không hợp lệ hoặc đã hết hạn!");
        } else if (errorMessage.includes("already registered")) {
          toast.error("Email này đã được đăng ký!");
        } else {
          toast.error(errorMessage || "Đăng ký thất bại!");
        }
      } else {
        toast.error("Xác thực OTP thất bại!");
      }

      // Clear OTP khi thất bại
      if (otpRef.current) otpRef.current.value = "";
    }
  };

  return (
    <>
      <div className="register-container">
        <div className="form-container">
          <p className="title">Register</p>

          <form className="form" method="POST" onSubmit={handleSignUpClick}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                ref={userNameRef}
                placeholder="Nhập tên người dùng"
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                ref={userEmailRef}
                placeholder="example@email.com"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                ref={userPasswordRef}
                placeholder="Ít nhất 6 ký tự"
              />
            </div>

            <button className="sign">Sign up</button>
          </form>

          <p className="signup">
            You have an account yet?
            <Link to="/login" onClick={handleLogin}>
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <h3>Verify OTP</h3>

            <button
              className="otp-btn"
              onClick={handleSendOtp}
              disabled={isOtpSent}
            >
              {isOtpSent ? "OTP đã gửi ✓" : "Send OTP"}
            </button>

            <input
              type="text"
              className="otp-input"
              placeholder="Enter OTP"
              ref={otpRef}
              disabled={!isOtpSent}
            />

            <button
              className="otp-submit-btn"
              onClick={handleSubmitOtp}
              disabled={!isOtpSent}
            >
              OK
            </button>

            <button
              className="otp-close"
              onClick={() => {
                setShowOtpModal(false);
                setIsOtpSent(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
