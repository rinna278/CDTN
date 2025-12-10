import { useEffect, useState, useRef } from "react";
import {
  getInfo,
  PatchUpdatePassword,
  PatchUpdateUser,
} from "../../services/apiService";
import "./profile.css";
import { toast } from "react-toastify";

interface HeaderProps {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
}

const Profile = ({ selected, setSelected }: HeaderProps) => {
  const idRef = useRef("");
  const phoneRef = useRef("");
  const fullNameRef = useRef("");
  const addressRef = useRef("");
  const oldpasswordRef = useRef("");
  const newpasswordRef = useRef("");
  const confirmpasswordRef = useRef("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [selectedMenu, setSelectedMenu] = useState("profile");

  // State quản lý hiển thị Modal đổi mật khẩu
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await getInfo();
        const { id, name } = response.data;
        console.log("User info:", response.data);
        console.log("User ID: ", response.data.id);

        idRef.current = id;
        fullNameRef.current = name;

        setForceUpdate((prev) => prev + 1);
      } catch (err: any) {
        setError(err.message || "Failed to load user info");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForceUpdate((prev) => prev + 1);
  };

  const handleSaveInfo = async () => {
    try {
      setIsEditing(false);
      const name = fullNameRef.current;
      const id = idRef.current;

      const userResponse = await PatchUpdateUser(id, name);

      if (userResponse.status === 200 || userResponse.status === 204) {
        toast.success("Cập nhật thông tin thành công");
      }
    } catch (err: any) {
      console.error("Update Info Error:", err);
      toast.error("Lỗi cập nhật thông tin");
    }
  };

  const handleSavePassword = async () => {
    try {
      const oldPassword = oldpasswordRef.current;
      const newPassword = newpasswordRef.current;
      const confirmPassword = confirmpasswordRef.current;

      if (!oldPassword || !newPassword || !confirmPassword) {
        toast.warning("Vui lòng điền đầy đủ thông tin");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return;
      }

      const passResponse = await PatchUpdatePassword(
        oldPassword,
        newPassword,
        confirmPassword
      );

      if (passResponse.status === 200 || passResponse.status === 204) {
        toast.success("Đổi mật khẩu thành công");
        setShowPasswordModal(false); // Đóng modal sau khi thành công
        // Reset ref values
        oldpasswordRef.current = "";
        newpasswordRef.current = "";
        confirmpasswordRef.current = "";
      }
    } catch (err: any) {
      if (err.response) {
        const message = err.response.data?.message || "Đổi mật khẩu thất bại";
        toast.error(message);
      } else {
        toast.error("Lỗi hệ thống");
      }
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    fullNameRef.current = e.target.value;
  };

  // Các hàm change input cho password
  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    oldpasswordRef.current = e.target.value;
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    newpasswordRef.current = e.target.value;
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      <div className="profile-menu-section">
        <h1>Hello {fullNameRef.current}</h1>
        <p>Chào mừng tới tài khoản của bạn</p>
        <div className="profile-menu-navigation">
          <button
            className={`navigation-profile ${
              selectedMenu === "profile" ? "active" : ""
            }`}
            onClick={() => setSelectedMenu("profile")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
            </svg>
            <p>Thông tin chi tiết</p>
          </button>
          <button
            className={`navigation-profile ${
              selectedMenu === "orders" ? "active" : ""
            }`}
            onClick={() => setSelectedMenu("orders")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M320 64C326.6 64 332.9 66.7 337.4 71.5L481.4 223.5L481.9 224L560 224C577.7 224 592 238.3 592 256C592 270.5 582.4 282.7 569.2 286.7L523.1 493.9C516.6 523.2 490.6 544 460.6 544L179.3 544C149.3 544 123.3 523.2 116.8 493.9L70.8 286.7C57.6 282.8 48 270.5 48 256C48 238.3 62.3 224 80 224L158.1 224L158.6 223.5L302.6 71.5C307.1 66.7 313.4 64 320 64zM320 122.9L224.2 224L415.8 224L320 122.9zM240 328C240 314.7 229.3 304 216 304C202.7 304 192 314.7 192 328L192 440C192 453.3 202.7 464 216 464C229.3 464 240 453.3 240 440L240 328zM320 304C306.7 304 296 314.7 296 328L296 440C296 453.3 306.7 464 320 464C333.3 464 344 453.3 344 440L344 328C344 314.7 333.3 304 320 304zM448 328C448 314.7 437.3 304 424 304C410.7 304 400 314.7 400 328L400 440C400 453.3 410.7 464 424 464C437.3 464 448 453.3 448 440L448 328z" />
            </svg>
            <p>Đơn hàng của tôi</p>
          </button>
        </div>
      </div>

      {selectedMenu === "profile" && (
        <div className="profile-information">
          <div className="profile-username">
            <p>Your Name</p>
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
            <p>Phone Number</p>
            {isEditing ? (
              <input
                type="phone"
                defaultValue={phoneRef.current}
                className="profile-input"
              />
            ) : (
              <h3>{phoneRef.current}</h3>
            )}
          </div>
          <div className="profile-address">
            <p>Your Address</p>
            {isEditing ? (
              <input
                type="address"
                defaultValue={addressRef.current}
                className="profile-input"
              />
            ) : (
              <h3>{addressRef.current}</h3>
            )}
          </div>
          <div className="profile-action">
            {isEditing ? (
              <div className="save-close">
                <button onClick={handleSaveInfo} className="btn-save">
                  Save
                </button>
                <button onClick={handleCancel} className="btn-cancel">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={handleEdit} className="btn-edit">
                Change
              </button>
            )}
          </div>
          <div className="profile-password">
            <p>Password</p>
            {/* Sự kiện onClick mở Modal */}
            <button
              className="change-password"
              onClick={() => setShowPasswordModal(true)}
            >
              Change
            </button>
          </div>
        </div>
      )}

      {selectedMenu === "orders" && (
        <div className="my-orders">
          <h2>Đơn hàng của tôi</h2>
          <p>Nội dung đơn hàng sẽ hiển thị ở đây...</p>
        </div>
      )}

      {/* --- MODAL ĐỔI MẬT KHẨU --- */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Đổi mật khẩu</h3>
            <div className="modal-input-group">
              <label>Mật khẩu cũ</label>
              <input
                type="password"
                onChange={handleOldPasswordChange}
                placeholder="Nhập mật khẩu cũ"
              />
            </div>
            <div className="modal-input-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                onChange={handleNewPasswordChange}
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div className="modal-input-group">
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                onChange={handleConfirmPasswordChange}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSavePassword} className="btn-modal-save">
                Lưu
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="btn-modal-cancel"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
