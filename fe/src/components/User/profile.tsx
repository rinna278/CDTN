import { useEffect, useState, useRef } from "react";
import { getInfo, PatchUpdatePassword, PatchUpdateUser } from "../../services/apiService";
import "./profile.css";

interface HeaderProps {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
}

const Profile = ({ selected, setSelected }: HeaderProps) => {
  // Dùng useRef để lưu thông tin (không hiển thị trong DevTools)
  const idRef = useRef("");
  const phoneRef = useRef("");
  const fullNameRef = useRef("");
  const addressRef = useRef("");
  const oldpasswordRef = useRef("");
  const newpasswordRef = useRef("");
  const confirmpasswordRef = useRef("");
  

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
        const { id, /*phone,*/ name /*,address*/ } = response.data;
        console.log("User info:", response.data);


        // Lưu vào ref thay vì state
        // phoneRef.current = phone;
        // addressRef.current = address;
        idRef.current = id;
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
    setForceUpdate((prev) => prev + 1);
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);

      const name = fullNameRef.current;
      const id = idRef.current;
      const oldPassword = oldpasswordRef.current;
      const newPassword = newpasswordRef.current;
      const confirmPassword = confirmpasswordRef.current;

      const response =  await Promise.all([
         PatchUpdateUser(id, name),
         PatchUpdatePassword(oldPassword, newPassword, confirmPassword),
       ]);
      console.log("Thành công update: ", response);
    } catch (error) {
      console.error("Update failed:", error);
      setError("Failed to update profile");
    }
  };

  // const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   phoneRef.current = e.target.value;
  // };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    fullNameRef.current = e.target.value;
  };

  // const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   addressRef.current = e.target.value;
  // }

  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    oldpasswordRef.current = e.target.value;
  };
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    newpasswordRef.current = e.target.value;
  };
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    confirmpasswordRef.current = e.target.value;
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
        <div className="profile-phone">
          <p>Phone</p>
          {isEditing ? (
            <input
              type="phone"
              defaultValue={phoneRef.current}
              // onChange={handlePhoneChange}
              className="profile-input"
            />
          ) : (
            <h3>{phoneRef.current}</h3>
          )}
        </div>
        <div className="profile-address">
          <p>Address</p>
          {isEditing ? (
            <input
              type="address"
              defaultValue={addressRef.current}
              // onChange={handleAddressChange}
              className="profile-input"
            />
          ) : (
            <h3>{addressRef.current}</h3>
          )}
        </div>
        <div className="profile-password">
          <p>Password</p>
          {isEditing ? (
            <div className="editPassword">
              <input
                type="text"
                placeholder="Nhập mật khẩu cũ"
                onChange={handleOldPasswordChange}
                className="profile-input"
              />
              <input
                type="text"
                placeholder="Nhập mật khẩu mới "
                onChange={handleNewPasswordChange}
                className="profile-input"
              />
              <input
                type="text"
                placeholder="Xác nhận mật khẩu mới"
                onChange={handleConfirmPasswordChange}
                className="profile-input"
              />
            </div>
          ) : (
            <h3>••••••••</h3>
          )}
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
    </div>
  );
};

export default Profile;
