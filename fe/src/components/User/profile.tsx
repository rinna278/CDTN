import { useEffect, useState, useRef } from "react";
import { getInfo } from "../../services/apiService";
import './profile.css'

interface HeaderProps {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
}

const Profile = ({ selected, setSelected }: HeaderProps) => {
  // Dùng useRef để lưu thông tin (không hiển thị trong DevTools)
  const emailRef = useRef("");
  const fullNameRef = useRef("");
  const passwordRef = useRef("");

  // State chỉ dùng để trigger re-render
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Fetch user info khi component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await getInfo();
        const { email, name } = response.data;

        // Lưu vào ref thay vì state
        emailRef.current = email;
        fullNameRef.current = name;

        setForceUpdate((prev) => prev + 1); // Trigger re-render
      } catch (err: any) {
        setError(err.message || "Failed to load user info");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Xử lý khi nhấn Edit
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Xử lý khi nhấn Cancel
  const handleCancel = () => {
    setIsEditing(false);
    // Reset password về rỗng
    passwordRef.current = "";
    // Reset lại giá trị input về giá trị ban đầu
    setForceUpdate((prev) => prev + 1);
  };

  // Xử lý khi nhấn Save
  const handleSave = async () => {
    try {
      // TODO: Gọi API để update backend
      // Nếu có thay đổi password thì gửi kèm
      // await instance.put('api/v1/user/update', {
      //   email: emailRef.current,
      //   fullName: fullNameRef.current,
      //   ...(passwordRef.current && { newPassword: passwordRef.current })
      // });

      setIsEditing(false);

      // Reset password sau khi save
      passwordRef.current = "";

      // Optional: Gọi lại getInfo() để đảm bảo data đồng bộ với backend
      // const response = await getInfo();
      // emailRef.current = response.data.email;
      // fullNameRef.current = response.data.fullName;
      // setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error("Update failed:", error);
      setError("Failed to update profile");
    }
  };

  // Xử lý thay đổi input
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    emailRef.current = e.target.value;
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    fullNameRef.current = e.target.value;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    passwordRef.current = e.target.value;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>Thông tin cá nhân</h1>
      <p>Quản lý thông tin đăng nhập của bạn</p>

      <div className="profile-information">
        <div className="profile-email">
          <p>Email</p>
          {isEditing ? (
            <input
              type="email"
              defaultValue={emailRef.current}
              onChange={handleEmailChange}
              className="profile-input"
            />
          ) : (
            <h3>{emailRef.current}</h3>
          )}
        </div>

        <div className="profile-username">
          <p>Name</p>
          {isEditing ? (
            <input
              type="text"
              defaultValue={fullNameRef.current}
              onChange={handleFullNameChange}
              className="profile-input"
            />
          ) : (
            <h3>{fullNameRef.current}</h3>
          )}
        </div>

        <div className="profile-password">
          <p>Password</p>
          {isEditing ? (
            <input
              type="password"
              placeholder="Nhập mật khẩu mới (để trống nếu không đổi)"
              onChange={handlePasswordChange}
              className="profile-input"
            />
          ) : (
            <h3>••••••••</h3>
          )}
        </div>
      </div>

      <div className="profile-action">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="btn-save">
              Save
            </button>
            <button onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={handleEdit} className="btn-edit">
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
