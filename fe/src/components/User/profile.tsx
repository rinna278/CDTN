import { useEffect, useState, useRef } from "react";
import {
  getInfo,
  PatchUpdatePassword,
  PatchUpdateUser,
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setAsDefaultAddress,
  getAllProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
} from "../../services/apiService";
import "./profile.css";
import { toast } from "react-toastify";

interface HeaderProps {
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
}

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

interface Address {
  id: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault?: boolean;
  postalCode?: string;
  notes?: string;
}

const Profile = ({ selected, setSelected }: HeaderProps) => {
  const idRef = useRef("");
  const phoneRef = useRef("");
  const fullNameRef = useRef("");
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

  // State quản lý địa chỉ
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // State cho cascade selection
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // State form địa chỉ
  const [addressForm, setAddressForm] = useState({
    street: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false,
    postalCode: "",
    notes: "",
  });

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await getInfo();
        const { id, name, phone } = response.data;

        idRef.current = id;
        fullNameRef.current = name;
        phoneRef.current = phone;

        setForceUpdate((prev) => prev + 1);
      } catch (err: any) {
        setError(err.message || "Failed to load user info");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Load danh sách địa chỉ
  useEffect(() => {
    if (selectedMenu === "addresses") {
      fetchAddresses();
    }
  }, [selectedMenu]);

  // Load provinces khi mở modal
  useEffect(() => {
    if (showAddressModal) {
      fetchProvinces();
    }
  }, [showAddressModal]);

  const fetchAddresses = async () => {
    try {
      const data = await getAllAddresses();
      setAddresses(data);
    } catch (err: any) {
      toast.error("Không thể tải danh sách địa chỉ");
    }
  };

  const fetchProvinces = async () => {
    try {
      const data = await getAllProvinces();
      setProvinces(data);
    } catch (err: any) {
      toast.error("Không thể tải danh sách tỉnh/thành phố");
    }
  };

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
      const phone = phoneRef.current;

      const userResponse = await PatchUpdateUser(id, name, phone);

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
        setShowPasswordModal(false);
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    phoneRef.current = e.target.value;
  };

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

  // === QUẢN LÝ ĐỊA CHỈ ===

  const openAddressModal = (address?: Address) => {
    if (address) {
      // Edit mode
      setEditingAddressId(address.id);
      setAddressForm({
        street: address.street,
        ward: address.ward,
        district: address.district,
        city: address.city,
        isDefault: address.isDefault || false,
        postalCode: address.postalCode || "",
        notes: address.notes || "",
      });
    } else {
      // Create mode
      setEditingAddressId(null);
      setAddressForm({
        street: "",
        ward: "",
        district: "",
        city: "",
        isDefault: false,
        postalCode: "",
        notes: "",
      });
    }
    setDistricts([]);
    setWards([]);
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddressId(null);
    setAddressForm({
      street: "",
      ward: "",
      district: "",
      city: "",
      isDefault: false,
      postalCode: "",
      notes: "",
    });
    setDistricts([]);
    setWards([]);
  };

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const provinceCode = Number(e.target.value);
    const provinceName =
      provinces.find((p) => p.code === provinceCode)?.name || "";

    setSelectedProvinceCode(provinceCode);
    setAddressForm({
      ...addressForm,
      city: provinceName,
      district: "",
      ward: "",
    });
    setWards([]);
    setSelectedDistrictCode(null);

    if (provinceCode) {
      try {
        const data = await getDistrictsByProvinceCode(provinceCode);
        setDistricts(data);
      } catch (err) {
        toast.error("Không thể tải danh sách quận/huyện");
      }
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const districtCode = Number(e.target.value);
    const districtName =
      districts.find((d) => d.code === districtCode)?.name || "";

    setSelectedDistrictCode(districtCode);
    setAddressForm({
      ...addressForm,
      district: districtName,
      ward: "",
    });

    if (districtCode) {
      try {
        const data = await getWardsByDistrictCode(districtCode);
        setWards(data);
      } catch (err) {
        toast.error("Không thể tải danh sách phường/xã");
      }
    } else {
      setWards([]);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardCode = Number(e.target.value);
    const wardName = wards.find((w) => w.code === wardCode)?.name || "";
    setAddressForm({
      ...addressForm,
      ward: wardName,
    });
  };

  const handleSaveAddress = async () => {
    try {
      if (
        !addressForm.street ||
        !addressForm.city ||
        !addressForm.district ||
        !addressForm.ward
      ) {
        toast.warning("Vui lòng điền đầy đủ thông tin");
        return;
      }
      if (addressForm.street.length < 5) {
        toast.warning("Địa chỉ chi tiết tối thiểu 5 kí tự");
        return;
      }

      if (editingAddressId) {
        // Update
        await updateAddress(editingAddressId, addressForm);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        // Create
        await createAddress(addressForm);
        toast.success("Thêm địa chỉ thành công");
      }

      closeAddressModal();
      fetchAddresses();
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 400) {
        toast.warning("Mã bưu chính không vượt quá 20 kí tự");
      } else {
        toast.error("Lỗi khi lưu địa chỉ!");
      }
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    try {
      await deleteAddress(addressId);
      toast.success("Xóa địa chỉ thành công");
      fetchAddresses();
    } catch (err: any) {
      toast.error("Không thể xóa địa chỉ");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setAsDefaultAddress(addressId);
      toast.success("Đã đặt làm địa chỉ mặc định");
      fetchAddresses();
    } catch (err: any) {
      toast.error("Không thể đặt địa chỉ mặc định");
    }
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
              selectedMenu === "addresses" ? "active" : ""
            }`}
            onClick={() => setSelectedMenu("addresses")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
              <path d="M288 0c-69.6 0-126 56.4-126 126 0 56.3 82.2 158.8 113.9 196.02 6.4 7.5 17.8 7.5 24.2 0C331.8 284.8 414 182.3 414 126 414 56.4 357.6 0 288 0zm0 168c-23.2 0-42-18.8-42-42s18.8-42 42-42 42 18.8 42 42-18.8 42-42 42z" />
            </svg>
            <p>Địa chỉ của tôi</p>
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
                onChange={handlePhoneChange}
                className="profile-input"
              />
            ) : (
              <h3>{phoneRef.current}</h3>
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
          <div>----------------------------------------------------------------------</div>
          <div className="profile-password">
            <p>Password</p>
            <button
              className="change-password"
              onClick={() => setShowPasswordModal(true)}
            >
              Change
            </button>
          </div>
        </div>
      )}

      {selectedMenu === "addresses" && (
        <div className="my-addresses">
          <div className="addresses-header">
            <h2>Địa chỉ của tôi</h2>
            <button
              className="btn-add-address"
              onClick={() => openAddressModal()}
            >
              + Thêm địa chỉ mới
            </button>
          </div>
          <div className="addresses-list">
            {addresses.length === 0 ? (
              <p className="no-address">Bạn chưa có địa chỉ nào</p>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`address-card ${addr.isDefault ? "default" : ""}`}
                >
                  {addr.isDefault && (
                    <span className="badge-default">Mặc định</span>
                  )}
                  <div className="address-info">
                    <p className="full-address">
                      {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                    </p>
                    {addr.notes && (
                      <p className="notes">Ghi chú: {addr.notes}</p>
                    )}
                  </div>
                  <div className="address-actions">
                    <button
                      onClick={() => openAddressModal(addr)}
                      className="btn-edit-addr"
                    >
                      Sửa
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="btn-set-default"
                      >
                        Đặt mặc định
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="btn-delete-addr"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedMenu === "orders" && (
        <div className="my-orders">
          <h2>Đơn hàng của tôi</h2>
          <p>Nội dung đơn hàng sẽ hiển thị ở đây...</p>
        </div>
      )}

      {/* MODAL ĐỔI MẬT KHẨU */}
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

      {/* MODAL THÊM/SỬA ĐỊA CHỈ */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-content address-modal">
            <h3>
              {editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
            </h3>

            <div className="modal-input-group">
              <label>Tỉnh/Thành phố</label>
              <select
                value={selectedProvinceCode || ""}
                onChange={handleProvinceChange}
              >
                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-input-group">
              <label>Quận/Huyện</label>
              <select
                value={selectedDistrictCode || ""}
                onChange={handleDistrictChange}
                disabled={!selectedProvinceCode}
              >
                <option value="">-- Chọn Quận/Huyện --</option>
                {districts.map((district) => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-input-group">
              <label>Phường/Xã</label>
              <select
                value={
                  wards.find((w) => w.name === addressForm.ward)?.code || ""
                }
                onChange={handleWardChange}
                disabled={!selectedDistrictCode}
              >
                <option value="">-- Chọn Phường/Xã --</option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-input-group">
              <label>Địa chỉ chi tiết</label>
              <input
                type="text"
                value={addressForm.street}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, street: e.target.value })
                }
                placeholder="Số nhà, tên đường..."
              />
            </div>

            <div className="modal-input-group">
              <label>Mã bưu chính (tùy chọn)</label>
              <input
                type="text"
                value={addressForm.postalCode}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, postalCode: e.target.value })
                }
                placeholder="Nhập mã bưu chính"
              />
            </div>

            <div className="modal-input-group">
              <label>Ghi chú (tùy chọn)</label>
              <textarea
                value={addressForm.notes}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, notes: e.target.value })
                }
                placeholder="Ví dụ: Nhà riêng, Văn phòng..."
                rows={2}
              />
            </div>

            <div className="modal-input-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      isDefault: e.target.checked,
                    })
                  }
                />
                Đặt làm địa chỉ mặc định
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={handleSaveAddress} className="btn-modal-save">
                {editingAddressId ? "Cập nhật" : "Thêm mới"}
              </button>
              <button onClick={closeAddressModal} className="btn-modal-cancel">
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
