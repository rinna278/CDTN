import React, { useState, useEffect } from "react";
import {
  getAllAddresses,
  getAllProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
  createAddress,
} from "../../services/apiService";
import {
  AddressData,
  CreateOrderPayload,
  PaymentMethod,
} from "../../types/type";
import { toast } from "react-toastify";
import "./checkout-modal.css";
import {
  validateName,
  validatePhone,
  validateStreet,
} from "../../utils/validate";

interface AddressWithId extends AddressData {
  id: string;
}

interface BuyNowItem {
  productId: string;
  quantity: number;
  color: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CreateOrderPayload) => void;
  totalAmount: number;
  selectedItemIds?: string[]; // Optional - cho cart
  buyNowItem?: BuyNowItem; // Optional - cho mua ngay
}

const CheckoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  selectedItemIds,
  buyNowItem,
}: CheckoutModalProps) => {
  const [addresses, setAddresses] = useState<AddressWithId[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.COD,
  );
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- Logic Thêm Địa Chỉ Mới ---
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProv, setSelectedProv] = useState<number | null>(null);
  const [selectedDist, setSelectedDist] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    recipientName: "",
    phoneNumber: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false,
  });

  const resetAddressForm = () => {
    setAddressForm({
      recipientName: "",
      phoneNumber: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      isDefault: false,
    });
    setSelectedProv(null);
    setSelectedDist(null);
    setDistricts([]);
    setWards([]);
  };

  const validateAddressForm = () => {
    const isNameValid = validateName(
      addressForm.recipientName,
      "Tên người nhận",
    );
    const isPhoneValid = validatePhone(addressForm.phoneNumber);
    const isStreetValid = validateStreet(addressForm.street);

    if (!addressForm.city) {
      toast.warning("Vui lòng chọn Tỉnh/Thành");
      return false;
    }
    if (!addressForm.district) {
      toast.warning("Vui lòng chọn Quận/Huyện");
      return false;
    }
    if (!addressForm.ward) {
      toast.warning("Vui lòng chọn Phường/Xã");
      return false;
    }

    return isNameValid && isPhoneValid && isStreetValid;
  };

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await getAllAddresses();
      setAddresses(response);
      const defaultAddr = response.find((a: any) => a.isDefault) || response[0];
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchAddresses();
  }, [isOpen]);

  useEffect(() => {
    if (showAddAddress) {
      getAllProvinces()
        .then(setProvinces)
        .catch(() => toast.error("Lỗi tải tỉnh thành"));
    }
  }, [showAddAddress]);

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const code = Number(e.target.value);
    const name = provinces.find((p) => p.code === code)?.name || "";
    setSelectedProv(code);
    setAddressForm({ ...addressForm, city: name, district: "", ward: "" });
    const data = await getDistrictsByProvinceCode(code);
    setDistricts(data);
    setWards([]);
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const code = Number(e.target.value);
    const name = districts.find((d) => d.code === code)?.name || "";
    setSelectedDist(code);
    setAddressForm({ ...addressForm, district: name, ward: "" });
    const data = await getWardsByDistrictCode(code);
    setWards(data);
  };

  const handleSaveNewAddress = async () => {
    if (!validateAddressForm()) {
      return;
    }

    try {
      await createAddress({
        ...addressForm,
        recipientName: addressForm.recipientName.trim(),
        phoneNumber: addressForm.phoneNumber.trim(),
        street: addressForm.street.trim(),
      });
      toast.success("Thêm địa chỉ thành công");
      resetAddressForm();
      setShowAddAddress(false);
      fetchAddresses();
    } catch (err) {
      toast.error("Lỗi khi lưu địa chỉ");
    }
  };

  const handleConfirmCheckout = () => {
    if (!selectedAddress) {
      toast.warning("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    // Tạo payload dựa trên loại checkout
    const orderData: CreateOrderPayload = {
      addressId: selectedAddress,
      paymentMethod: paymentMethod as any,
      notes: notes.trim(),
      ...(buyNowItem
        ? {
            // Mua ngay - truyền thông tin sản phẩm trực tiếp
            items: [
              {
                productId: buyNowItem.productId,
                quantity: buyNowItem.quantity,
                color: buyNowItem.color,
              },
            ],
          }
        : {
            // Đặt hàng từ giỏ - truyền danh sách cart item IDs
            cartItemIds: selectedItemIds || [],
          }),
    };

    onConfirm(orderData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Sub-modal: Thêm địa chỉ mới */}
        {showAddAddress && (
          <div className="sub-modal-overlay">
            <div className="sub-modal-content">
              <h3>Địa chỉ giao hàng mới</h3>
              <input
                placeholder="Tên người nhận"
                value={addressForm.recipientName}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    recipientName: e.target.value,
                  })
                }
                onBlur={() =>
                  setAddressForm((prev) => ({
                    ...prev,
                    recipientName: prev.recipientName.trim(),
                  }))
                }
              />

              <input
                placeholder="Số điện thoại"
                value={addressForm.phoneNumber}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    phoneNumber: e.target.value,
                  })
                }
              />

              <select
                onChange={handleProvinceChange}
                value={selectedProv || ""}
              >
                <option value="">Chọn Tỉnh/Thành</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                onChange={handleDistrictChange}
                disabled={!selectedProv}
                value={selectedDist || ""}
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                disabled={!selectedDist}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    ward:
                      wards.find((w) => w.code === Number(e.target.value))
                        ?.name || "",
                  })
                }
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Địa chỉ chi tiết (Số nhà, tên đường)"
                value={addressForm.street}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, street: e.target.value })
                }
                onBlur={() =>
                  setAddressForm((prev) => ({
                    ...prev,
                    street: prev.street.trim(),
                  }))
                }
              />

              <div className="sub-modal-actions">
                <button
                  onClick={() => {
                    setShowAddAddress(false);
                    resetAddressForm();
                  }}
                >
                  Hủy
                </button>
                <button className="btn-save" onClick={handleSaveNewAddress}>
                  Lưu địa chỉ
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="modal-header">
          <h2>Xác Nhận Đặt Hàng</h2>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <div className="section-header">
              <h4>📍 Địa chỉ giao hàng</h4>
              <button
                className="btn-add-inline"
                onClick={() => setShowAddAddress(true)}
              >
                + Thêm địa chỉ mới
              </button>
            </div>

            {isLoading ? (
              <p>Đang tải...</p>
            ) : (
              <div className="address-list">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`address-item ${
                      selectedAddress === addr.id ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                    />
                    <div className="addr-details">
                      <strong>
                        {addr.recipientName} - {addr.phoneNumber}
                      </strong>
                      <p>
                        {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="modal-section">
            <h4>💳 Phương thức thanh toán</h4>
            <div className="payment-options">
              {[
                {
                  id: PaymentMethod.COD,
                  label: "Thanh toán khi nhận hàng (COD)",
                },
                { id: PaymentMethod.VNPAY, label: "Thanh toán qua VNPAY" },
                { id: PaymentMethod.MOMO, label: "Thanh toán qua Ví MoMo" },
                {
                  id: PaymentMethod.BANK_TRANSFER,
                  label: "Thanh toán qua thẻ ngân hàng",
                },
              ].map((method) => (
                <label key={method.id} className="payment-label">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                  />
                  <span>{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <h4>📝 Ghi chú đơn hàng</h4>
            <textarea
              className="notes-area"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú cho cửa hàng (nếu có)..."
              maxLength={500}
            />
          </div>
        </div>

        <div className="modal-footer">
          <div className="total-info">
            <span>Tổng cộng:</span>
            <span className="amount">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalAmount)}
            </span>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel-checkout" onClick={onClose}>
              Quay lại
            </button>
            <button
              className="btn-confirm"
              disabled={!selectedAddress}
              onClick={handleConfirmCheckout}
            >
              Đặt Hàng Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
