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
        name: 'Product name',
        description: 'Product description',
        price: 100000,
        discount: 10,
        stock: 50,
        category: 'Flower',
        images: ['image1.jpg', 'image2.jpg'],
        color: 'Red',
        occasions: ['Birthday', 'Anniversary'],
        status: 1,
        soldCount: 5,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    },
  },
  CREATE_SUCCESS: {
    description: 'Product created successfully',
    schema: {
      example: {
        id: 'uuid',
        name: 'New Product',
        description: 'Product description',
        price: 100000,
        discount: 0,
        stock: 100,
        category: 'Flower',
        images: [],
        color: 'Red',
        occasions: [],
        status: 1,
        soldCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    },
  },
  UPDATE_SUCCESS: {
    description: 'Product updated successfully',
  },
  DELETE_SUCCESS: {
    description: 'Product deleted successfully',
  },
};
