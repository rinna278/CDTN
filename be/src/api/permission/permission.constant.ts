import { swaggerSchemaExample } from '../../share/utils/swagger_schema';

export const PERMISSION_CONST = {
  MODEL_NAME: 'permission',
  MODEL_PROVIDER: 'PERMISSIONS_MODEL',
};

export const PERMISSIONS = {
  ALL: 'all',

  // User
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_GET_ALL: 'user:getall',

  // Product
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  PRODUCT_STOCK_UPDATE: 'product:stock:update',

  // Role
  ROLE_SEARCH: 'role:search',
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_EDIT: 'role:update',
  ROLE_DELETE: 'role:delete',

  // Permission
  PERMISSION_READ: 'permission:read',

  // Order
  ORDER_CREATE: 'order:create',
  ORDER_READ: 'order:read',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',
  ORDER_STATUS_UPDATE: 'order:status:update',
  ORDER_SHIPPING_UPDATE: 'order:shipping:update',
  ORDER_REFUND_PROCESS: 'order:refund:process',
  ORDER_STATISTICS: 'order:statistics',

  // Cart
  CART_READ: 'cart:read',
  CART_CREATE: 'cart:create',
  CART_UPDATE: 'cart:update',
  CART_DELETE: 'cart:delete',

  // Cart Detail
  CART_DETAIL_CREATE: 'cart:detail:create',
  CART_DETAIL_READ: 'cart:detail:read',
  CART_DETAIL_UPDATE: 'cart:detail:update',
  CART_DETAIL_DELETE: 'cart:detail:delete',

  // Address
  ADDRESS_CREATE: 'address:create',
  ADDRESS_READ: 'address:read',
  ADDRESS_UPDATE: 'address:update',
  ADDRESS_DELETE: 'address:delete',

  // Auth
  AUTH_REGISTER: 'auth:register',

  // Admin
  ADMIN_CREATE: 'admin:create',
  ADMIN_DASHBOARD: 'admin:dashboard',
};

export const MOCK_DATA = {
  id: 1,
  name: 'user:create',
};

export const PERMISSION_SWAGGER_RESPONSE = {
  GET_PERMISSION_SUCCESS: swaggerSchemaExample(
    {
      data: [
        // User permissions
        { id: 1, name: 'user:create' },
        { id: 2, name: 'user:read' },
        { id: 3, name: 'user:update' },
        { id: 4, name: 'user:delete' },
        { id: 5, name: 'user:getall' },

        // Product permissions
        { id: 6, name: 'product:create' },
        { id: 7, name: 'product:read' },
        { id: 8, name: 'product:update' },
        { id: 9, name: 'product:delete' },
        { id: 10, name: 'product:stock:update' },

        // Role permissions
        { id: 11, name: 'role:create' },
        { id: 12, name: 'role:read' },
        { id: 13, name: 'role:update' },
        { id: 14, name: 'role:delete' },
        { id: 15, name: 'role:search' },

        // Permission permissions
        { id: 16, name: 'permission:read' },

        // Order permissions
        { id: 17, name: 'order:create' },
        { id: 18, name: 'order:read' },
        { id: 19, name: 'order:update' },
        { id: 20, name: 'order:delete' },
        { id: 21, name: 'order:status:update' },
        { id: 22, name: 'order:shipping:update' },
        { id: 23, name: 'order:refund:process' },
        { id: 24, name: 'order:statistics' },

        // Cart permissions
        { id: 25, name: 'cart:read' },
        { id: 26, name: 'cart:create' },
        { id: 27, name: 'cart:update' },
        { id: 28, name: 'cart:delete' },

        // Cart Detail permissions
        { id: 29, name: 'cart:detail:create' },
        { id: 30, name: 'cart:detail:read' },
        { id: 31, name: 'cart:detail:update' },
        { id: 32, name: 'cart:detail:delete' },

        // Address permissions
        { id: 33, name: 'address:create' },
        { id: 34, name: 'address:read' },
        { id: 35, name: 'address:update' },
        { id: 36, name: 'address:delete' },

        // Auth permissions
        { id: 37, name: 'auth:register' },

        // Admin permissions
        { id: 38, name: 'admin:create' },
        { id: 39, name: 'admin:dashboard' },
      ],
    },
    'Get success',
  ),
};
