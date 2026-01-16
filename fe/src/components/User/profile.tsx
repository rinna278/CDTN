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
import { AddressData } from "../../types/type";
import Orders from "../Order/orders";
import { useLocation } from "react-router-dom";

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

interface Address extends AddressData {
  id: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [selectedMenu, setSelectedMenu] = useState("profile");
  const location = useLocation();
  const [showConfirmPopUp, setShowConfirmPopUp] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const phoneRegex = /^[0-9]{7,20}$/;

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [addressForm, setAddressForm] = useState({
    recipientName: "",
    phoneNumber: "",
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
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (tab && ["profile", "addresses", "orders"].includes(tab)) {
      setSelectedMenu(tab);
    }
  }, [location.search]);

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

  useEffect(() => {
    if (selectedMenu === "addresses") {
      fetchAddresses();
    }
  }, [selectedMenu]);

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
    setEditName(fullNameRef.current);
    setEditPhone(phoneRef.current);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowConfirmPopUp(false);

    setEditName(fullNameRef.current);
    setEditPhone(phoneRef.current);
  };

  const handleCancelPopup = () => {
    setShowConfirmPopUp(false);
  };

  const handleShowPopup = () => {
    const name = editName.trim();
    const phone = editPhone.trim();

    if (!name || !phone) {
      toast.warning("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!/^\d+$/.test(phone)) {
      toast.warning("Số điện thoại chỉ được chứa chữ số");
      return;
    }

    if (!phoneRegex.test(phone)) {
      toast.warning("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)");
      return;
    }

    setShowConfirmPopUp(true);
  };

  const handleSaveInfo = async () => {
    try {
      setIsUpdating(true);
      await PatchUpdateUser(idRef.current, editName, editPhone);

      toast.success("Cập nhật thành công");

      fullNameRef.current = editName;
      phoneRef.current = editPhone;

      setIsEditing(false);
      setShowConfirmPopUp(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setIsUpdating(false); 
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

  const openAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddressId(address.id);
      setAddressForm({
        recipientName: address.recipientName || "",
        phoneNumber: address.phoneNumber || "",
        street: address.street,
        ward: address.ward,
        district: address.district,
        city: address.city,
        isDefault: address.isDefault || false,
        postalCode: address.postalCode || "",
        notes: address.notes || "",
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        recipientName: "",
        phoneNumber: "",
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
      recipientName: "",
      phoneNumber: "",
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
        !addressForm.recipientName ||
        !addressForm.phoneNumber ||
        !addressForm.street ||
        !addressForm.city ||
        !addressForm.district ||
        !addressForm.ward
      ) {
        toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      if (addressForm.recipientName.trim().length < 2) {
        toast.warning("Tên người nhận tối thiểu 2 ký tự");
        return;
      }

      if (addressForm.street.trim().length < 5) {
        toast.warning("Địa chỉ chi tiết tối thiểu 5 ký tự");
        return;
      }

      if (!phoneRegex.test(addressForm.phoneNumber.replace(/\s/g, ""))) {
        toast.warning("Số điện thoại không hợp lệ (7-20 chữ số)");
        return;
      }

      const dataToSend: any = {
        recipientName: addressForm.recipientName.trim(),
        phoneNumber: addressForm.phoneNumber.trim(),
        street: addressForm.street.trim(),
        ward: addressForm.ward,
        district: addressForm.district,
        city: addressForm.city,
        isDefault: addressForm.isDefault,
      };

      if (addressForm.postalCode && addressForm.postalCode.trim()) {
        dataToSend.postalCode = addressForm.postalCode.trim();
      }

      if (addressForm.notes && addressForm.notes.trim()) {
        dataToSend.notes = addressForm.notes.trim();
      }

      if (editingAddressId) {
        await updateAddress(editingAddressId, dataToSend);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        await createAddress(dataToSend);
        toast.success("Thêm địa chỉ thành công");
      }

      closeAddressModal();
      fetchAddresses();
    } catch (err: any) {
      console.error("Error saving address:", err);
      const errorMessage = err.response?.data?.message || "Lỗi khi lưu địa chỉ";
      toast.error(errorMessage);
    }
  };

  const openDeleteModal = (address: Address) => {
    setDeletingAddress(address);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingAddress(null);
  };

  const confirmDeleteAddress = async () => {
    if (!deletingAddress) return;

    try {
      await deleteAddress(deletingAddress.id);
      toast.success("Xóa địa chỉ thành công");
      closeDeleteModal();
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
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
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
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            ) : (
              <h3>{phoneRef.current}</h3>
            )}
          </div>
          <div className="profile-action">
            {isEditing ? (
              <div className="save-close">
                <button onClick={handleShowPopup} className="btn-save">
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
          <hr className="profile-line" />
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
                    <p className="recipient-info">
                      <strong>{addr.recipientName}</strong> | {addr.phoneNumber}
                    </p>
                    <p className="full-address">
                      {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                    </p>
                    {addr.postalCode && (
                      <p className="postal-code">
                        Mã bưu chính: {addr.postalCode}
                      </p>
                    )}
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
                      onClick={() => openDeleteModal(addr)}
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
        <Orders selected={selected} setSelected={setSelected} />
      )}

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content-profile">
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

      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-content-address address-modal">
            <h3>
              {editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
            </h3>

            <div className="modal-input-group">
              <label>
                Tên người nhận <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                value={addressForm.recipientName}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    recipientName: e.target.value,
                  })
                }
                placeholder="Nhập tên người nhận"
              />
            </div>

            <div className="modal-input-group">
              <label>
                Số điện thoại <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="tel"
                value={addressForm.phoneNumber}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    phoneNumber: e.target.value,
                  })
                }
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="modal-input-group">
              <label>
                Tỉnh/Thành phố <span style={{ color: "red" }}>*</span>
              </label>
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
              <label>
                Quận/Huyện <span style={{ color: "red" }}>*</span>
              </label>
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
              <label>
                Phường/Xã <span style={{ color: "red" }}>*</span>
              </label>
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
              <label>
                Địa chỉ chi tiết <span style={{ color: "red" }}>*</span>
              </label>
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

      {showDeleteModal && deletingAddress && (
        <div className="modal-overlay">
          <div className="modal-content-delete-address">
            <div className="delete-icon-address">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3>Xác nhận xóa địa chỉ</h3>
            <p className="delete-warning-address">
              Bạn có chắc chắn muốn xóa địa chỉ này không?
            </p>
            <div className="delete-address-preview">
              <p>
                <strong>{deletingAddress.recipientName}</strong> |{" "}
                {deletingAddress.phoneNumber}
              </p>
              <p>
                {deletingAddress.street}, {deletingAddress.ward},{" "}
                {deletingAddress.district}, {deletingAddress.city}
              </p>
            </div>
            <p className="delete-note-address">
              Hành động này không thể hoàn tác!
            </p>
            <div className="modal-actions-address">
              <button
                onClick={confirmDeleteAddress}
                className="btn-confirm-delete-address"
              >
                Xóa địa chỉ
              </button>
              <button
                onClick={closeDeleteModal}
                className="btn-cancel-delete-address"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmPopUp && (
        <div className="modal-overlay">
          <div
            className="modal-container-confirm-delete-product"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <h2 className="modal-title">Xác nhận cập nhật</h2>
              <p className="modal-message">Bạn có chắc chắn muốn cập nhật?</p>
              <div className="modal-actions">
                <button
                  onClick={handleCancelPopup}
                  className="btn-cancel-order"
                  disabled={isUpdating}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveInfo}
                  className="btn-update-status"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Đang cập nhật..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
