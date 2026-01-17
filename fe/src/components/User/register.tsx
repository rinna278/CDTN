import { Link, useNavigate } from "react-router-dom";
import "./register.css";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
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
  const [isOtpValid, setIsOtpValid] = useState(false);
  const [otpExpireTime, setOtpExpireTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const OTP_EXPIRE_DURATION = 5 * 60 * 1000;

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [otp, setOtp] = useState("");
  

  const trimOnly = (value: string) => value.trim();
  const removeSpace = (value: string) => value.replace(/\s/g, "");
  useEffect(() => {
    if (!otpExpireTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.floor((otpExpireTime - now) / 1000));

      setRemainingTime(timeLeft);

      if (timeLeft === 0) {
        setIsOtpValid(false);
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

    if (!userName || !userEmail || !userPassword) {
      toast.info("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const userNameRegex = /^(?!\s)(?!.*\s$)(?=(?:.*.){2,})[^~`!@#$%^&*=:;"']+$/;

    if (!userNameRegex.test(userName)) {
      toast.error(
        "Tên người dùng có ít nhất 2 kí tự và không chứa kí tự đặc biệt"
      );
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
  };

  const handleSendOtp = async () => {
    // Nếu OTP còn hạn → không gửi lại
    if (isOtpSent && isOtpValid && remainingTime > 0) {
      toast.info(`OTP vẫn còn hiệu lực trong ${formatTime(remainingTime)}`);
      return;
    }

    try {
      if (!userEmail) {
        toast.error("Vui lòng nhập email!");
        return;
      }

      const response = await postSendOTP(userEmail);

      if (response.data.success) {
        toast.success(
          response.data.message || "OTP đã được gửi đến email của bạn!"
        );

        const expireTime = Date.now() + OTP_EXPIRE_DURATION;

        setOtpExpireTime(expireTime);
        setIsOtpSent(true);
        setIsOtpValid(true);
        setRemainingTime(OTP_EXPIRE_DURATION / 1000);
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 400) {
        toast.error("Email đã tồn tại, thử email khác");
      } else {
        toast.error("Gửi OTP thất bại!");
      }
    }
  };

  const handleSubmitOtp = async () => {
    if (!otp) {
      toast.info("Vui lòng nhập OTP!");
      return;
    }

    if (!isOtpSent) {
      toast.warning("Vui lòng gửi OTP trước!");
      return;
    }

    if (!otpExpireTime || Date.now() >= otpExpireTime) {
      toast.error("OTP đã hết hạn! Vui lòng gửi lại.");
      setOtp("");
      setIsOtpValid(false);
      return;
    }

    try {
      const response = await postRegister(
        userEmail,
        userPassword,
        userName,
        otp
      );

      if (response.data.success || response.data.message)
        toast.success(response.data.message || "Đăng ký thành công!");
      else toast.success("Đăng ký thành công!");

      setUserName("");
      setUserEmail("");
      setUserPassword("");
      setOtp("");
      setShowOtpModal(false);
      setIsOtpSent(false);
      setIsOtpValid(false);
      setOtpExpireTime(null);
      setRemainingTime(0);

      setSelected("login");
      navigate("/login");
    } catch (err: any) {
      toast.error("OTP bị sai!");
      setOtp("");
    }
  };

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
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onBlur={() => setUserName(trimOnly(userName))}
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={(e) => setUserEmail(removeSpace(e.target.value))}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={userPassword}
                onChange={(e) => setUserPassword(removeSpace(e.target.value))}
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

      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <h3>Verify OTP</h3>

            {isOtpSent && isOtpValid && remainingTime > 0 && (
              <p
                style={{
                  color: remainingTime < 60 ? "#ff4444" : "#4CAF50",
                  fontWeight: "bold",
                }}
              >
                OTP còn hạn: {formatTime(remainingTime)}
              </p>
            )}

            {isOtpSent && !isOtpValid && (
              <p style={{ color: "#ff4444", fontWeight: "bold" }}>
                OTP đã hết hạn! Vui lòng gửi lại.
              </p>
            )}

            <div className="send-otp">
              <input
                type="text"
                className="otp-input"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(removeSpace(e.target.value))}
              />
              <button className="otp-btn" onClick={handleSendOtp}>
                {isOtpSent && isOtpValid && remainingTime > 0
                  ? "OTP đã gửi ✓"
                  : "Send OTP"}
              </button>
            </div>

            <div className="action-modal-btn">
              <button
                className="otp-submit-btn"
                onClick={handleSubmitOtp}
                disabled={!isOtpSent}
              >
                OK
              </button>

              <button
                className="otp-close"
                onClick={() => setShowOtpModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
