// src/modules/product/product.constant.ts

export const PRODUCT_CONST = {
  MODEL_NAME: 'products', // tên bảng trong database
  // Các hằng số khác có thể thêm sau:
  // MAX_NAME_LENGTH: 255,
  // DEFAULT_PRICE: 0,
  // DEFAULT_STATUS: 'active',
};

export interface IProductImage {
  url: string;
  publicId: string;
}

export interface IProductVariant {
  color: string; // Tên màu: "Đỏ", "Xanh", "Trắng"
  image: IProductImage;
  stock: number; // Số lượng tồn kho của màu này
}

export enum ProductStatus {
  ACTIVE = 1,
  INACTIVE = 0,
  OUT_OF_STOCK = 2,
}

export const PRODUCT_SWAGGER_RESPONSE = {
  GET_LIST_SUCCESS: {
    description: 'Get product list successfully',
    schema: {
      example: {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    },
  },
  GET_SUCCESS: {
    description: 'Get product successfully',
    schema: {
      example: {
        id: 'uuid',
        name: 'Hoa Hồng Ecuador',
        description: 'Hoa hồng nhập khẩu cao cấp',
        price: 100000,
        discount: 10,
        category: 'Flower',
        // ẢNH CHUNG CỦA PRODUCT (hiển thị đầu tiên)
        images: [
          { url: 'main-1.jpg', publicId: 'products/main-1' },
          { url: 'main-2.jpg', publicId: 'products/main-2' },
          { url: 'main-3.jpg', publicId: 'products/main-3' },
        ],
        occasions: ['Birthday', 'Anniversary'],
        // CÁC VARIANTS - MỖI MÀU CÓ 1 ẢNH RIÊNG
        variants: [
          {
            color: 'Đỏ',
            image: { url: 'red-rose.jpg', publicId: 'products/red-rose' },
            stock: 50,
          },
          {
            color: 'Trắng',
            image: { url: 'white-rose.jpg', publicId: 'products/white-rose' },
            stock: 30,
          },
          {
            color: 'Hồng',
            image: { url: 'pink-rose.jpg', publicId: 'products/pink-rose' },
            stock: 40,
          },
        ],
        status: 1,
        soldCount: 5,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    },
  },
  CREATE_SUCCESS: {
    description: 'Product created successfully',
  },
  UPDATE_SUCCESS: {
    description: 'Product updated successfully',
  },
  DELETE_SUCCESS: {
    description: 'Product deleted successfully',
  },
};
