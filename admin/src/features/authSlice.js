import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../config";

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const LoginUser = createAsyncThunk(
  "user/LoginUser",
  async (user, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/auth/handle-login`, {
        email: user.email,
        password: user.password,
      });
      return res.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.msg;
        return thunkAPI.rejectWithValue(message);
      }
    }
  }
);

export const getMe = createAsyncThunk("user/getMe", async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${API_URL}/auth/me`);
    return res.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data.msg;
      return thunkAPI.rejectWithValue(message);
    }
  }
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.patch(
        `${API_URL}/auth/update-profile`,
        formData
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.msg || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const LogOut = createAsyncThunk("user/LogOut", async () => {
  await axios.delete(`${API_URL}/auth/handle-logout`);
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(LoginUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(LoginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = action.payload;
    });
    builder.addCase(LoginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    });

    // Get User Login
    builder.addCase(getMe.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getMe.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = action.payload;
    });
    builder.addCase(getMe.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    });

    // Tambahkan di extraReducers
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = {
        ...state.user,
        ...action.payload,
      };
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
