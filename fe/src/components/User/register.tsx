import { Link, useNavigate } from "react-router-dom";
import "./register.css";
import { Dispatch, SetStateAction, useState, useRef, useEffect } from "react";
import { postSendOTP, postRegister } from "../../services/apiService";
import { toast } from "react-toastify";

interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

const Register = ({ selected, setSelected }: HeaderProps) => {
  const navigate = useNavigate();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpValid, setIsOtpValid] = useState(false); // Trạng thái OTP còn hạn
  const [otpExpireTime, setOtpExpireTime] = useState<number | null>(null); // Thời gian hết hạn
  const [remainingTime, setRemainingTime] = useState<number>(0); // Thời gian còn lại (giây)

  const OTP_EXPIRE_DURATION = 5 * 60 * 1000; // 5 phút (ms)

  const userNameRef = useRef<HTMLInputElement>(null);
  const userEmailRef = useRef<HTMLInputElement>(null);
  const userPasswordRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  // Countdown timer cho OTP
  useEffect(() => {
    if (!otpExpireTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.floor((otpExpireTime - now) / 1000));

      setRemainingTime(timeLeft);

      if (timeLeft === 0) {
        setIsOtpValid(false);
        toast.warning("OTP đã hết hạn! Vui lòng gửi lại.");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpireTime]);

  const handleLogin = () => {
    setSelected("login");
  };

  const handleSignUpClick = (e: React.FormEvent) => {
    e.preventDefault();

    const userName = userNameRef.current?.value || "";
    const userEmail = userEmailRef.current?.value || "";
    const userPassword = userPasswordRef.current?.value || "";

    if (!userName || !userEmail || !userPassword) {
      toast.info("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    if (userPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setShowOtpModal(true);
    setIsOtpSent(false);
    setIsOtpValid(false);
    setOtpExpireTime(null);
    setRemainingTime(0);
  };

  // Fake API kiểm tra OTP còn hạn hay không
  const checkOtpValidity = async (): Promise<boolean> => {
    // Trong thực tế, đây sẽ là API call:
    // const response = await apiCheckOtpValidity(userEmail);
    // return response.data.isValid;

    // FAKE: Kiểm tra dựa trên thời gian local
    if (!otpExpireTime) return false;

    const now = Date.now();
    const isValid = now < otpExpireTime;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(isValid);
      }, 500); // Giả lập network delay
    });
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

      if (response.data.success) {
        toast.success(
          response.data.message || "OTP đã được gửi đến email của bạn!"
        );

        // Lưu thời gian hết hạn
        const expireTime = Date.now() + OTP_EXPIRE_DURATION;
        setOtpExpireTime(expireTime);
        setIsOtpSent(true);
        setIsOtpValid(true);
        setRemainingTime(OTP_EXPIRE_DURATION / 1000);
      }
    } catch (err: any) {
      console.error(err);

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

    // Kiểm tra OTP còn hạn hay không
    const isValid = await checkOtpValidity();

    if (!isValid) {
      toast.error("OTP đã hết hạn! Vui lòng gửi lại OTP.");
      setIsOtpValid(false);
      if (otpRef.current) otpRef.current.value = "";
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

      if (response.data.success || response.data.message) {
        toast.success(response.data.message || "Đăng ký thành công!");
      } else {
        toast.success("Đăng ký thành công!");
      }

      // Clear tất cả input
      if (userNameRef.current) userNameRef.current.value = "";
      if (userEmailRef.current) userEmailRef.current.value = "";
      if (userPasswordRef.current) userPasswordRef.current.value = "";
      if (otpRef.current) otpRef.current.value = "";

      setShowOtpModal(false);
      setIsOtpSent(false);
      setIsOtpValid(false);
      setOtpExpireTime(null);
      setSelected("login");
      navigate("/login");
    } catch (err: any) {
      console.error(err);

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

      if (otpRef.current) otpRef.current.value = "";
    }
  };

  // Format thời gian còn lại (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
              disabled={isOtpSent && isOtpValid}
            >
              {isOtpSent && isOtpValid ? "OTP đã gửi ✓" : "Send OTP"}
            </button>

            {/* Hiển thị thời gian còn lại */}
            {isOtpValid && remainingTime > 0 && (
              <p
                style={{
                  color: remainingTime < 60 ? "#ff4444" : "#4CAF50",
                  fontSize: "14px",
                  margin: "8px 0",
                  fontWeight: "bold",
                }}
              >
                OTP còn hạn: {formatTime(remainingTime)}
              </p>
            )}

            {/* Thông báo hết hạn */}
            {isOtpSent && !isOtpValid && (
              <p
                style={{
                  color: "#ff4444",
                  fontSize: "14px",
                  margin: "8px 0",
                  fontWeight: "bold",
                }}
              >
                OTP đã hết hạn! Vui lòng gửi lại.
              </p>
            )}

            <input
              type="text"
              className="otp-input"
              placeholder="Enter OTP"
              ref={otpRef}
              disabled={!isOtpSent || !isOtpValid}
            />

            <button
              className="otp-submit-btn"
              onClick={handleSubmitOtp}
              disabled={!isOtpSent || !isOtpValid}
            >
              OK
            </button>

            <button
              className="otp-close"
              onClick={() => {
                setShowOtpModal(false);
                setIsOtpSent(false);
                setIsOtpValid(false);
                setOtpExpireTime(null);
                setRemainingTime(0);
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
