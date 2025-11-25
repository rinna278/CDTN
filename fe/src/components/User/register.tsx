import { Link } from "react-router-dom";
import "./register.css";
import { Dispatch, SetStateAction, useState } from "react";
import { postSendOTP, postRegister } from "../../services/apiService";
import { toast } from "react-toastify";

interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

const Register = ({ selected, setSelected }: HeaderProps) => {
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [otp, setOtp] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const handleLogin = () => {
    setSelected("login");
  };

  const handleSignUpClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !userEmail || !userPassword) {
      toast.info("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // hiện modal OTP
    setShowOtpModal(true);
  };

  const handleSendOtp = async () => {
    try {
      console.log("Sending OTP...");
      await postSendOTP(userEmail); // 👈 gửi email
      toast.success("OTP đã được gửi đến email của bạn!");
    } catch (err) {
      console.error(err);
      toast.error("Gửi OTP thất bại!");
    }
  };

  const handleSubmitOtp = async () => {
    if (!otp) {
      toast.info("Vui lòng nhập OTP!");
      return;
    }

    try {
      await postRegister(
        userEmail,
        userPassword,
        userName,
        otp
      );
      toast.success("Đăng ký thành công!!")

      setShowOtpModal(false);
      setSelected("login"); // chuyển sang login
    } catch (err) {
      console.error(err);
      toast.error("Xác thực OTP thất bại!");
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
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
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

            <button className="otp-btn" onClick={handleSendOtp}>
              Send OTP
            </button>

            <input
              type="text"
              className="otp-input"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button className="otp-submit-btn" onClick={handleSubmitOtp}>
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
      )}
    </>
  );
};

export default Register;
