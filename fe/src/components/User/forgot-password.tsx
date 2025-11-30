import {  useNavigate } from "react-router-dom";
import "./forgot-password.css";
import { Dispatch, SetStateAction, useRef, useState } from "react";

import { postForgotPassword } from "../../services/apiService";
import { toast } from "react-toastify";

interface HeaderProps {
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

const ForgotPassword = ({ selected, setSelected }: HeaderProps) => {
  // Sử dụng useRef thay vì useState
  const otpRef = useRef<HTMLInputElement>(null);
  const newpasswordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Lấy giá trị từ ref
    const otp = otpRef.current?.value || "";
    const new_password = newpasswordRef.current?.value || "";



    const isValidNewPassword = (new_password: string) => {
        if (new_password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 kí tự");
        }
        return isValidNewPassword;
    }


    try {
      const response = await postForgotPassword(otp, new_password);

      if (response.success === false){
        toast.error(response.data.message || 'OTP bị sai hoặc hết hạn');
      }
      toast.success(response.data.message || 'Đổi mật khẩu thành công')

      // Clear input ngay sau khi login thành công
      navigate('/login', {replace: true})
      setSelected('login');

    } catch (error: any) {
      const msg = error.response?.data?.message || "Verify OTP failed";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <p className="title">Forgot Password</p>
        <form className="form" onSubmit={handleVerifyOTP}>
          <div className="input-group">
            <label htmlFor="otp">OTP nhận được</label>
            <input
              type="text"
              name="otp"
              id="email"
              placeholder=""
              ref={otpRef}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder=""
              ref={newpasswordRef}
              required
            />
          </div>
          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
          <button className="sign" type="submit" disabled={loading}>
            {loading && !errorMsg ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
