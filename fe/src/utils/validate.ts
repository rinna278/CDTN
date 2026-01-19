import { toast } from "react-toastify";

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate tên (họ tên, tên người nhận, v.v.)
 * - Không được để trống
 * - Độ dài 2-100 ký tự
 * - Chỉ cho phép chữ cái (có dấu) và khoảng trắng
 * - Không cho số và ký tự đặc biệt
 * - Không cho nhiều khoảng trắng liên tiếp
 */
export const validateName = (
  name: string,
  fieldName: string = "Tên",
  showToast: boolean = true,
): boolean => {
  const trimmedName = name.trim();

  if (!trimmedName || trimmedName.length === 0) {
    if (showToast) toast.warning(`${fieldName} không được để trống`);
    return false;
  }

  if (trimmedName.length < 2) {
    if (showToast) toast.warning(`${fieldName} phải có ít nhất 2 ký tự`);
    return false;
  }

  if (trimmedName.length > 100) {
    if (showToast) toast.warning(`${fieldName} không được quá 100 ký tự`);
    return false;
  }

  // Chỉ cho phép chữ cái (có dấu) và khoảng trắng
  const nameRegex = /^[\p{L}]+(?:\s[\p{L}]+)*$/u;
  if (!nameRegex.test(trimmedName)) {
    if (showToast)
      toast.warning(`${fieldName} chỉ được chứa chữ cái và khoảng trắng`);
    return false;
  }

  // Không cho nhiều khoảng trắng liên tiếp
  if (/\s{2,}/.test(trimmedName)) {
    if (showToast)
      toast.warning(
        `${fieldName} không được chứa nhiều khoảng trắng liên tiếp`,
      );
    return false;
  }

  return true;
};

/**
 * Validate số điện thoại
 * - Không được để trống
 * - Chỉ cho phép số (0-9)
 * - Không cho khoảng trắng
 * - Độ dài 10-11 chữ số (chuẩn VN)
 * - Phải bắt đầu bằng số 0
 */
export const validatePhone = (
  phone: string,
  fieldName: string = "Số điện thoại",
  showToast: boolean = true,
): boolean => {
  const trimmedPhone = phone.trim();

  if (!trimmedPhone || trimmedPhone.length === 0) {
    if (showToast) toast.warning(`${fieldName} không được để trống`);
    return false;
  }

  // Không cho khoảng trắng
  if (/\s/.test(trimmedPhone)) {
    if (showToast) toast.warning(`${fieldName} không được chứa khoảng trắng`);
    return false;
  }

  // Chỉ cho phép số
  if (!/^\d+$/.test(trimmedPhone)) {
    if (showToast) toast.warning(`${fieldName} chỉ được chứa chữ số`);
    return false;
  }

  // Số điện thoại VN thường bắt đầu bằng 0
  if (trimmedPhone[0] !== "0") {
    if (showToast) toast.warning(`${fieldName} phải bắt đầu bằng số 0`);
    return false;
  }

  // Độ dài số điện thoại VN thường là 10-11 số
  if (trimmedPhone.length < 10 || trimmedPhone.length > 11) {
    if (showToast) toast.warning(`${fieldName} phải có 10 hoặc 11 chữ số`);
    return false;
  }

  return true;
};

/**
 * Validate email
 * - Không được để trống
 * - Định dạng email chuẩn
 * - Độ dài tối đa 254 ký tự
 * - Không cho khoảng trắng
 * - Kiểm tra cấu trúc local@domain
 */
export const validateEmail = (
  email: string,
  fieldName: string = "Email",
  showToast: boolean = true,
): boolean => {
  const trimmedEmail = email.trim();

  if (!trimmedEmail || trimmedEmail.length === 0) {
    if (showToast) toast.error(`${fieldName} không được để trống`);
    return false;
  }

  if (trimmedEmail.length > 254) {
    if (showToast) toast.error(`${fieldName} quá dài (tối đa 254 ký tự)`);
    return false;
  }

  // Kiểm tra không có khoảng trắng
  if (/\s/.test(trimmedEmail)) {
    if (showToast) toast.error(`${fieldName} không được chứa khoảng trắng`);
    return false;
  }

  // Kiểm tra regex email chuẩn
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!emailRegex.test(trimmedEmail.toLowerCase())) {
    if (showToast) toast.error(`${fieldName} không hợp lệ`);
    return false;
  }

  // Kiểm tra có @ và domain
  if (!trimmedEmail.includes("@") || trimmedEmail.split("@").length !== 2) {
    if (showToast)
      toast.error(`${fieldName} phải có định dạng user@domain.com`);
    return false;
  }

  const [localPart, domain] = trimmedEmail.split("@");

  if (localPart.length === 0 || localPart.length > 64) {
    if (showToast) toast.error(`${fieldName} không hợp lệ`);
    return false;
  }

  if (domain.length === 0 || !domain.includes(".")) {
    if (showToast) toast.error(`${fieldName} phải có domain hợp lệ`);
    return false;
  }

  return true;
};

/**
 * Validate mật khẩu
 * - Không được để trống
 * - Không cho khoảng trắng ở bất kỳ đâu
 * - Độ dài 6-128 ký tự
 * - Phải có ít nhất 1 chữ cái
 * - Phải có ít nhất 1 chữ số
 */
export const validatePassword = (
  password: string,
  fieldName: string = "Mật khẩu",
  showToast: boolean = true,
): boolean => {
  if (!password || password.length === 0) {
    if (showToast) toast.warning(`${fieldName} không được để trống`);
    return false;
  }

  if (password.trim().length === 0) {
    if (showToast)
      toast.warning(`${fieldName} không được chỉ chứa khoảng trắng`);
    return false;
  }

  if (/\s/.test(password)) {
    if (showToast) toast.warning(`${fieldName} không được chứa khoảng trắng`);
    return false;
  }

  if (password.length < 6) {
    if (showToast) toast.warning(`${fieldName} phải có ít nhất 6 ký tự`);
    return false;
  }

  if (password.length > 128) {
    if (showToast) toast.warning(`${fieldName} không được quá 128 ký tự`);
    return false;
  }

  if (!/[a-zA-Z]/.test(password)) {
    if (showToast) toast.warning(`${fieldName} phải chứa ít nhất một chữ cái`);
    return false;
  }

  if (!/\d/.test(password)) {
    if (showToast) toast.warning(`${fieldName} phải chứa ít nhất một chữ số`);
    return false;
  }

  return true;
};

/**
 * Validate OTP
 * - Không được để trống
 * - Chỉ cho phép số
 * - Đúng 6 chữ số
 * - Không cho khoảng trắng
 */
export const validateOTP = (
  otp: string,
  showToast: boolean = true,
): boolean => {
  const trimmedOTP = otp.trim();

  if (!trimmedOTP || trimmedOTP.length === 0) {
    if (showToast) toast.error("Vui lòng nhập OTP");
    return false;
  }

  if (trimmedOTP.length !== 6) {
    if (showToast) toast.error("OTP phải có đúng 6 chữ số");
    return false;
  }

  if (!/^\d+$/.test(trimmedOTP)) {
    if (showToast) toast.error("OTP chỉ được chứa chữ số");
    return false;
  }

  if (/\s/.test(trimmedOTP)) {
    if (showToast) toast.error("OTP không được chứa khoảng trắng");
    return false;
  }

  return true;
};

/**
 * Validate địa chỉ/đường phố
 * - Không được để trống
 * - Độ dài 5-200 ký tự
 * - Không cho nhiều khoảng trắng liên tiếp
 */
export const validateStreet = (
  street: string,
  fieldName: string = "Địa chỉ chi tiết",
  showToast: boolean = true,
): boolean => {
  const trimmedStreet = street.trim();

  if (!trimmedStreet || trimmedStreet.length === 0) {
    if (showToast) toast.warning(`${fieldName} không được để trống`);
    return false;
  }

  if (trimmedStreet.length < 5) {
    if (showToast) toast.warning(`${fieldName} phải có ít nhất 5 ký tự`);
    return false;
  }

  if (trimmedStreet.length > 200) {
    if (showToast) toast.warning(`${fieldName} không được quá 200 ký tự`);
    return false;
  }

  if (/\s{2,}/.test(trimmedStreet)) {
    if (showToast)
      toast.warning(
        `${fieldName} không được chứa nhiều khoảng trắng liên tiếp`,
      );
    return false;
  }

  return true;
};

/**
 * Validate mã bưu chính
 * - Tùy chọn (có thể để trống)
 * - Nếu có: chỉ cho phép số, đúng 6 chữ số, không cho khoảng trắng
 */
export const validatePostalCode = (
  postalCode: string,
  showToast: boolean = true,
): boolean => {
  if (!postalCode) return true; // Optional field

  const trimmedCode = postalCode.trim();

  if (trimmedCode.length === 0) return true;

  if (/\s/.test(trimmedCode)) {
    if (showToast) toast.warning("Mã bưu chính không được chứa khoảng trắng");
    return false;
  }

  if (!/^\d+$/.test(trimmedCode)) {
    if (showToast) toast.warning("Mã bưu chính chỉ được chứa chữ số");
    return false;
  }

  if (trimmedCode.length !== 6) {
    if (showToast) toast.warning("Mã bưu chính phải có đúng 6 chữ số");
    return false;
  }

  return true;
};

/**
 * Validate ghi chú/notes
 * - Tùy chọn (có thể để trống)
 * - Nếu có: tối đa 500 ký tự, không cho nhiều khoảng trắng liên tiếp
 */
export const validateNotes = (
  notes: string,
  maxLength: number = 500,
  fieldName: string = "Ghi chú",
  showToast: boolean = true,
): boolean => {
  if (!notes) return true; // Optional field

  const trimmedNotes = notes.trim();

  if (trimmedNotes.length === 0) return true;

  if (trimmedNotes.length > maxLength) {
    if (showToast)
      toast.warning(`${fieldName} không được quá ${maxLength} ký tự`);
    return false;
  }

  if (/\s{2,}/.test(trimmedNotes)) {
    if (showToast)
      toast.warning(
        `${fieldName} không được chứa nhiều khoảng trắng liên tiếp`,
      );
    return false;
  }

  return true;
};

/**
 * Validate text chung
 * - Độ dài tùy chỉnh
 * - Không cho nhiều khoảng trắng liên tiếp
 */
export const validateText = (
  text: string,
  minLength: number,
  maxLength: number,
  fieldName: string = "Trường",
  showToast: boolean = true,
): boolean => {
  const trimmedText = text.trim();

  if (!trimmedText || trimmedText.length === 0) {
    if (showToast) toast.warning(`${fieldName} không được để trống`);
    return false;
  }

  if (trimmedText.length < minLength) {
    if (showToast)
      toast.warning(`${fieldName} phải có ít nhất ${minLength} ký tự`);
    return false;
  }

  if (trimmedText.length > maxLength) {
    if (showToast)
      toast.warning(`${fieldName} không được quá ${maxLength} ký tự`);
    return false;
  }

  if (/\s{2,}/.test(trimmedText)) {
    if (showToast)
      toast.warning(
        `${fieldName} không được chứa nhiều khoảng trắng liên tiếp`,
      );
    return false;
  }

  return true;
};

// ==================== INPUT HANDLERS ====================

/**
 * Handler cho input tên - loại bỏ số và ký tự đặc biệt
 */
export const handleNameInput = (e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  // Loại bỏ số và ký tự đặc biệt, chỉ giữ chữ cái và khoảng trắng
  input.value = input.value.replace(/[^A-Za-zÀ-ỹ\s]/g, "");
  // Loại bỏ nhiều khoảng trắng liên tiếp
  input.value = input.value.replace(/\s{2,}/g, " ");
  // Không cho khoảng trắng ở đầu
  if (input.value[0] === " ") {
    input.value = input.value.trimStart();
  }
};

/**
 * Handler cho input số điện thoại - chỉ cho phép số
 */
export const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  // Chỉ giữ số, loại bỏ tất cả ký tự khác
  input.value = input.value.replace(/\D/g, "").slice(0, 11);
};

/**
 * Handler cho input email - loại bỏ khoảng trắng
 */
export const handleEmailInput = (e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  // Loại bỏ khoảng trắng
  input.value = input.value.replace(/\s/g, "");
};

/**
 * Handler cho input mật khẩu - loại bỏ khoảng trắng
 */
export const handlePasswordInput = (e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  // Loại bỏ khoảng trắng
  input.value = input.value.replace(/\s/g, "");
};

/**
 * Handler cho input OTP - chỉ cho phép số, tối đa 6 chữ số
 */
export const handleOTPInput = (e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  // Chỉ giữ số, loại bỏ tất cả ký tự khác
  input.value = input.value.replace(/\D/g, "").slice(0, 6);
};

/**
 * Handler cho input mã bưu chính - chỉ cho phép số, tối đa 6 chữ số
 */
export const handlePostalCodeInput = (e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  // Chỉ giữ số, tối đa 6 chữ số
  input.value = input.value.replace(/\D/g, "").slice(0, 6);
};

/**
 * Handler cho input text chung - loại bỏ nhiều khoảng trắng liên tiếp
 */
export const handleTextInput = (
  e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
) => {
  const input = e.currentTarget;
  // Loại bỏ nhiều khoảng trắng liên tiếp
  input.value = input.value.replace(/\s{2,}/g, " ");
  // Không cho khoảng trắng ở đầu
  if (input.value[0] === " ") {
    input.value = input.value.trimStart();
  }
};

// ==================== PASTE HANDLERS ====================

/**
 * Handler cho paste tên
 */
export const handleNamePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData("text");
  const cleanedText = pastedText
    .replace(/[^A-Za-zÀ-ỹ\s]/g, "")
    .replace(/\s{2,}/g, " ")
    .trimStart();
  e.currentTarget.value = cleanedText;
};

/**
 * Handler cho paste số điện thoại
 */
export const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData("text");
  const cleanedText = pastedText.replace(/\D/g, "").slice(0, 11);
  e.currentTarget.value = cleanedText;
};

/**
 * Handler cho paste email
 */
export const handleEmailPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData("text");
  const cleanedText = pastedText.replace(/\s/g, "");
  e.currentTarget.value = cleanedText;
};

/**
 * Handler cho paste mật khẩu
 */
export const handlePasswordPaste = (
  e: React.ClipboardEvent<HTMLInputElement>,
) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData("text");
  const cleanedText = pastedText.replace(/\s/g, "");
  e.currentTarget.value = cleanedText;
};

/**
 * Handler cho paste OTP
 */
export const handleOTPPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData("text");
  const cleanedText = pastedText.replace(/\D/g, "").slice(0, 6);
  e.currentTarget.value = cleanedText;
};

/**
 * Handler cho paste mã bưu chính
 */
export const handlePostalCodePaste = (
  e: React.ClipboardEvent<HTMLInputElement>,
) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData("text");
  const cleanedText = pastedText.replace(/\D/g, "").slice(0, 6);
  e.currentTarget.value = cleanedText;
};

/**
 * Handler cho paste text chung
 */
export const handleTextPaste = (
  e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData("text");
  const cleanedText = pastedText.replace(/\s{2,}/g, " ").trimStart();
  e.currentTarget.value = cleanedText;
};
