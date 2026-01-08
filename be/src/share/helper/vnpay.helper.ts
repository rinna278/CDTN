// share/helpers/vnpay.helper.ts
import * as crypto from 'crypto';
import * as qs from 'qs';

export interface VNPayConfig {
  vnp_TmnCode: string;
  vnp_HashSecret: string;
  vnp_Url: string;
  vnp_ReturnUrl: string;
}

export interface VNPayPaymentParams {
  orderId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  ipAddr: string;
  locale?: string;
  bankCode?: string;
}

export class VNPayHelper {
  private config: VNPayConfig;

  constructor(config: VNPayConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validate VNPay config
   */
  private validateConfig(): void {
    if (!this.config.vnp_TmnCode) {
      throw new Error('VNPay TMN Code is required');
    }
    if (!this.config.vnp_HashSecret) {
      throw new Error('VNPay Hash Secret is required');
    }
    if (!this.config.vnp_Url) {
      throw new Error('VNPay URL is required');
    }
    if (!this.config.vnp_ReturnUrl) {
      throw new Error('VNPay Return URL is required');
    }
  }

  /**
   * Tạo URL thanh toán VNPay
   */
  createPaymentUrl(params: VNPayPaymentParams): string {
    // Validate params
    if (!params.orderId || !params.amount || !params.orderInfo) {
      throw new Error('Missing required payment parameters');
    }

    if (params.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(
      new Date(date.getTime() + 15 * 60 * 1000), // Expire sau 15 phút
    );

    let vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.vnp_TmnCode,
      vnp_Locale: params.locale || 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: params.orderId,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: params.orderType,
      vnp_Amount: Math.round(params.amount * 100), // VNPay yêu cầu nhân 100 và làm tròn
      vnp_ReturnUrl: this.config.vnp_ReturnUrl,
      vnp_IpAddr: params.ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    if (params.bankCode) {
      vnpParams.vnp_BankCode = params.bankCode;
    }

    // Sắp xếp params theo alphabet
    vnpParams = this.sortObject(vnpParams);

    // Tạo secure hash
    const signData = qs.stringify(vnpParams, { encode: false });
    const secureHash = this.createSecureHash(signData);
    vnpParams.vnp_SecureHashType = 'SHA512';
    vnpParams.vnp_SecureHash = secureHash;

    // Tạo URL
    const paymentUrl = `${this.config.vnp_Url}?${qs.stringify(vnpParams, { encode: false })}`;

    // Debug log (xóa trong production)
    console.log('🔐 VNPay Payment URL Created:');
    console.log('  Order ID:', params.orderId);
    console.log('  Amount:', params.amount);
    console.log('  Sign Data:', signData.substring(0, 100) + '...');
    console.log('  Secure Hash:', secureHash.substring(0, 20) + '...');

    return paymentUrl;
  }

  /**
   * Verify callback từ VNPay
   */
  verifyReturnUrl(query: any): {
    isValid: boolean;
    message: string;
    data?: any;
  } {
    console.log('🔍 VNPay Callback Received:', JSON.stringify(query, null, 2));

    const secureHash = query.vnp_SecureHash;

    if (!secureHash) {
      console.error('❌ Missing vnp_SecureHash in callback');
      return {
        isValid: false,
        message: 'Missing secure hash',
      };
    }

    // Clone query to avoid modifying original
    const verifyQuery = { ...query };
    delete verifyQuery.vnp_SecureHash;
    delete verifyQuery.vnp_SecureHashType;

    const sortedQuery = this.sortObject(verifyQuery);
    const signData = qs.stringify(sortedQuery, { encode: false });
    const checkSum = this.createSecureHash(signData);

    if (secureHash === checkSum) {
      const responseCode = query.vnp_ResponseCode;

      if (responseCode === '00') {
        console.log('✅ Payment successful');
        return {
          isValid: true,
          message: 'Payment successful',
          data: {
            orderId: query.vnp_TxnRef,
            amount: query.vnp_Amount / 100,
            transactionNo: query.vnp_TransactionNo,
            bankCode: query.vnp_BankCode,
            payDate: query.vnp_PayDate,
            responseCode: responseCode,
          },
        };
      } else {
        console.warn('⚠️ Payment failed with code:', responseCode);
        return {
          isValid: true, // Signature is valid, but payment failed
          message: this.getResponseMessage(responseCode),
          data: {
            orderId: query.vnp_TxnRef,
            responseCode,
          },
        };
      }
    } else {
      console.error('❌ Invalid signature');
      return {
        isValid: false,
        message: 'Invalid signature',
      };
    }
  }

  /**
   * Tạo secure hash
   */
  private createSecureHash(data: string): string {
    const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
    hmac.update(data, 'utf8');
    return hmac.digest('hex');
  }

  /**
   * Sắp xếp object theo key
   */
  private sortObject(obj: any): any {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();

    keys.forEach((key) => {
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    });

    return sorted;
  }

  /**
   * Format date theo yêu cầu VNPay: yyyyMMddHHmmss
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Lấy message từ response code
   */
  private getResponseMessage(code: string): string {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
    };

    return messages[code] || 'Lỗi không xác định';
  }

  /**
   * Test helper - Generate test payment URL
   */
  generateTestPaymentUrl(orderId: string, amount: number): string {
    return this.createPaymentUrl({
      orderId,
      amount,
      orderInfo: `Test payment for order ${orderId}`,
      orderType: 'billpayment',
      ipAddr: '127.0.0.1',
      locale: 'vn',
    });
  }
}
