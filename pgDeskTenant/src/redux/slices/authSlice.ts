import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '../../services/auth';
import type { User, UserRole } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  role: UserRole | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  role: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { phone: string; role?: UserRole }, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (payload: { phone: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await AuthService.verifyOTP(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await AuthService.logout();
});

export const loadSession = createAsyncThunk('auth/loadSession', async () => {
  const session = await AuthService.getSession();
  return session;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.role = action.payload.user.role;
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        return initialState;
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.role = action.payload.user.role;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { clearError, setRole } = authSlice.actions;
export default authSlice.reducer;
