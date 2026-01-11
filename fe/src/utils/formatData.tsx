export const formatCurrency = (
  amount: number | string | undefined | null
): string => {
  const value = Number(amount);

  // Kiểm tra nếu không phải là số hợp lệ thì trả về "0 ₫"
  if (isNaN(value)) return "0 ₫";

  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
};
