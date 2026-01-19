// src/utils/invoiceTemplate.ts

interface InvoiceData {
  orderCode: string;
  createdAt: string;
  deliveredAt: string;
  recipientName: string;
  phoneNumber: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  paymentMethod: "cod" | "vnpay";
  items: Array<{
    productName: string;
    color: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  discountCode?: string;
  totalAmount: number;
}

export const generateInvoiceHTML = (order: InvoiceData): string => {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa đơn - ${order.orderCode}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      color: #333;
      line-height: 1.6;
    }
    
    .invoice-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #333;
    }
    
    .invoice-header h1 {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 20px;
      letter-spacing: 1px;
    }
    
    .invoice-meta {
      text-align: center;
      margin-bottom: 10px;
    }
    
    .invoice-meta div {
      margin: 5px 0;
      font-size: 14px;
    }
    
    .section-divider {
      height: 2px;
      background: #ddd;
      margin: 25px 0;
    }
    
    .info-section {
      margin-bottom: 25px;
    }
    
    .info-section h3 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 12px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ddd;
    }
    
    .info-row {
      display: flex;
      padding: 6px 0;
      font-size: 14px;
    }
    
    .info-label {
      width: 180px;
      font-weight: 500;
      flex-shrink: 0;
    }
    
    .info-value {
      flex: 1;
    }
    
    .payment-section {
      margin: 25px 0;
    }
    
    .payment-section h3 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 12px;
    }
    
    .payment-method,
    .payment-status {
      padding: 8px 0;
      font-size: 14px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
    }
    
    table th {
      background: #f5f5f5;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #ddd;
    }
    
    table td {
      padding: 10px 8px;
      border: 1px solid #ddd;
    }
    
    table th:nth-child(1),
    table td:nth-child(1) {
      width: 50px;
      text-align: center;
    }
    
    table th:nth-child(4),
    table td:nth-child(4),
    table th:nth-child(5),
    table td:nth-child(5),
    table th:nth-child(6),
    table td:nth-child(6) {
      text-align: right;
    }
    
    .summary {
      margin-top: 20px;
      margin-left: auto;
      width: 350px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      border-bottom: 1px solid #eee;
    }
    
    .summary-row.total {
      border-top: 2px solid #333;
      border-bottom: 2px solid #333;
      margin-top: 10px;
      padding: 12px 0;
      font-size: 16px;
      font-weight: bold;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
    }
    
    .footer p {
      margin: 8px 0;
      font-size: 14px;
    }
    
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <h1>HÓA ĐƠN MUA HÀNG</h1>
    <div class="invoice-meta">
      <div><strong>Mã đơn hàng:</strong> ${order.orderCode}</div>
      <div><strong>Ngày đặt:</strong> ${new Date(
        order.createdAt
      ).toLocaleDateString("vi-VN")}</div>
      <div><strong>Ngày giao:</strong> ${new Date(
        order.deliveredAt
      ).toLocaleDateString("vi-VN")}</div>
    </div>
  </div>

  <div class="section-divider"></div>

  <div class="info-section">
    <h3>Thông tin người nhận:</h3>
    <div class="info-row">
      <span class="info-label">Họ tên:</span>
      <span class="info-value">${order.recipientName}</span>
    </div>
    <div class="info-row">
      <span class="info-label">SĐT:</span>
      <span class="info-value">${order.phoneNumber}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Địa chỉ:</span>
      <span class="info-value">${order.street}, ${order.ward}, ${
    order.district
  }, ${order.city}</span>
    </div>
  </div>

  <div class="payment-section">
    <h3>Phương thức thanh toán:</h3>
    <div class="payment-method">
      ${
        order.paymentMethod === "cod"
          ? "Thanh toán khi nhận hàng (COD)"
          : "Thanh toán online (VNPay)"
      }
    </div>
    <div class="payment-status">
      <strong>Trạng thái:</strong> Đã thanh toán
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>STT</th>
        <th>Sản phẩm</th>
        <th>Màu</th>
        <th>Số lượng</th>
        <th>Đơn giá</th>
        <th>Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      ${order.items
        .map(
          (item, index) => `
        <tr>
          <td style="text-align: center">${index + 1}</td>
          <td>${item.productName}</td>
          <td>${item.color}</td>
          <td style="text-align: right">${item.quantity}</td>
          <td style="text-align: right">${Number(
            item.price
          ).toLocaleString()}đ</td>
          <td style="text-align: right">${Number(
            item.subtotal
          ).toLocaleString()}đ</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-row">
      <span>Tạm tính:</span>
      <span>${Number(order.subtotal).toLocaleString()}đ</span>
    </div>
    <div class="summary-row">
      <span>Phí vận chuyển:</span>
      <span>${
        Number(order.shippingFee) === 0
          ? "Miễn phí"
          : Number(order.shippingFee).toLocaleString() + "đ"
      }</span>
    </div>
    ${
      Number(order.discountAmount) > 0
        ? `
      <div class="summary-row">
        <span>Giảm giá ${
          order.discountCode ? "(" + order.discountCode + ")" : ""
        }:</span>
        <span>-${Number(order.discountAmount).toLocaleString()}đ</span>
      </div>
    `
        : ""
    }
    <div class="summary-row total">
      <span>TỔNG CỘNG:</span>
      <span>${Number(order.totalAmount).toLocaleString()}đ</span>
    </div>
  </div>

  <div class="footer">
    <p><strong>Cảm ơn quý khách đã mua hàng!</strong></p>
    <p>Mọi thắc mắc vui lòng liên hệ: support@avici-flower-shop.com | Hotline: 1900-9867</p>
  </div>
</body>
</html>
  `;
};

export const printInvoice = (order: InvoiceData): void => {
  const invoiceHTML = generateInvoiceHTML(order);

  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.focus();

    // Đợi load xong rồi in
    setTimeout(() => {
      printWindow.print();

      // Tự động đóng sau khi in (tùy chọn)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 250);
  } else {
    throw new Error("Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.");
  }
};
