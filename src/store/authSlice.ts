import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  admin: {
    id: string;
    email: string;
  } | null;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  admin: null,
  token: localStorage.getItem("adminToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        admin: { id: string; email: string };
        token: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      localStorage.setItem("adminToken", action.payload.token);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.admin = null;
      state.token = null;
      localStorage.removeItem("adminToken");
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        state.isAuthenticated = true;
        state.token = token;
        // In a real app, you'd verify the token and get admin info
        state.admin = { id: "1", email: "admin@dhiastore.com" };
      }
    },
  },
});

export const { login, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
