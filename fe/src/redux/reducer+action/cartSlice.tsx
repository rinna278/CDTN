import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllItemInCart } from "../../services/apiService";

// Thunk để lấy dữ liệu từ API
export const fetchCartFromServer = createAsyncThunk(
  "cart/fetchCartFromServer",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllItemInCart();
      // Theo JSON bạn gửi, dữ liệu nằm trực tiếp trong response hoặc response.data
      const cartData = response.data || response;

      return {
        totalItems: cartData.totalItems, // Con số 6 trong JSON của bạn
        totalPrice: cartData.totalPrice, // 7.649.000
        distinctItems: cartData.items.length, // Số loại sản phẩm (3 loại)
        items: cartData.items, // Danh sách chi tiết
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Lỗi kết nối");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    totalItems: 0,
    totalPrice: 0,
    distinctItems: 0,
    items: [],
    loading: false,
  },
  reducers: {
    clearCart: (state) => {
      state.totalItems = 0;
      state.totalPrice = 0;
      state.distinctItems = 0;
      state.items = [];
    },
    setCartInfo: (state, action) => {
      state.totalItems = action.payload.totalItems;
      state.distinctItems = action.payload.distinctItems;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartFromServer.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartFromServer.fulfilled, (state, action: any) => {
        state.loading = false;
        state.totalItems = action.payload.totalItems;
        state.totalPrice = action.payload.totalPrice;
        state.distinctItems = action.payload.distinctItems;
        state.items = action.payload.items;
      })
      .addCase(fetchCartFromServer.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearCart, setCartInfo } = cartSlice.actions;
export default cartSlice.reducer;
