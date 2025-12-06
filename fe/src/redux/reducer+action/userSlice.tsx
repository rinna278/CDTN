import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  fullName: string;       // lưu fullName từ backend
  email: string;
  accessToken: string;
  refreshToken: string;
  loggedIn: boolean;
  isFirstTimeLogin: boolean;
  error?: string | null;
}

const initialState: UserState = {
  fullName: '',
  email: '',
  accessToken: '',
  refreshToken: '',
  loggedIn: false,
  isFirstTimeLogin: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // đăng nhập thành công
    loginSuccess: (state, action: PayloadAction<{
      fullName: string;
      email: string;
      accessToken: string;
      refreshToken: string;
      isFirstTimeLogin: boolean;
    }>) => {
      state.fullName = action.payload.fullName;
      state.email = action.payload.email;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isFirstTimeLogin = action.payload.isFirstTimeLogin;
      state.loggedIn = true;
      state.error = null;
    },

    // đăng nhập thất bại
    loginFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loggedIn = false;
      state.accessToken = '';
      state.refreshToken = ''
    },

    // đăng xuất
    logout: (state) => {
      state.fullName = '';
      state.email = '';
      state.accessToken = '';
      state.refreshToken = '';
      state.loggedIn = false;
      state.isFirstTimeLogin = false;
      state.error = null;
    },
  },
});

export const { loginSuccess, loginFailure, logout} = userSlice.actions;
export default userSlice.reducer;
