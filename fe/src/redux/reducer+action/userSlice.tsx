import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  email: string;
  password: string;
  loggedIn: boolean;
  accessToken: string;

}

const initialState: UserState = {
  name: '',
  email: '',
  password: '',
  loggedIn: false,
  accessToken: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    //đăng kí
    register : (state, action: PayloadAction<{name: string; email: string; password: string}>) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.password = action.payload.password;
    },
    // đăng nhập
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      state.name = action.payload.email;
      state.email = action.payload.password;
      state.loggedIn = true;
    },
    // đăng xuất
    logout: (state) => {
      state.name = '';
      state.email = '';
      state.password = '';
      state.loggedIn = false;
    },
    // cập nhật thông tin người dùng (nếu cần)
    updateProfile: (state, action: PayloadAction<{ name?: string; email?: string; password?:string }>) => {
      if (action.payload.name) state.name = action.payload.name;
      if (action.payload.email) state.email = action.payload.email;
      if (action.payload.password) state.password = action.payload.password;
    },
  },
});

export const { login, logout, updateProfile } = userSlice.actions;
export default userSlice.reducer;
