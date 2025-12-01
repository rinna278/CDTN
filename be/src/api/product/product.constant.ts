// src/modules/product/product.constant.ts

export const PRODUCT_CONST = {
  MODEL_NAME: 'products', // tên bảng trong database
  // Các hằng số khác có thể thêm sau:
  // MAX_NAME_LENGTH: 255,
  // DEFAULT_PRICE: 0,
  // DEFAULT_STATUS: 'active',
};

export enum ProductStatus {
  ACTIVE = 1,
  INACTIVE = 0,
  OUT_OF_STOCK = 2,
}
