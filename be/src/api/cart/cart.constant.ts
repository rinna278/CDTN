export const CART_CONST = {
  MODEL_NAME: 'cart',
  MODEL_PROVIDER: 'CART_MODEL',
};

export const CART_SWAGGER_RESPONSE = {
  GET_SUCCESS: {
    description: 'Get cart successfully',
    status: 200,
  },
  ADD_ITEM_SUCCESS: {
    description: 'Add item to cart successfully',
    status: 201,
  },
  UPDATE_ITEM_SUCCESS: {
    description: 'Update cart item successfully',
    status: 204,
  },
  REMOVE_ITEM_SUCCESS: {
    description: 'Remove item from cart successfully',
    status: 204,
  },
  CLEAR_CART_SUCCESS: {
    description: 'Clear cart successfully',
    status: 204,
  },
};

export enum CartStatus {
  ACTIVE = 1,
  INACTIVE = 0,
}
