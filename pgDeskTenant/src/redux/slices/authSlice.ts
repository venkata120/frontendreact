import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { AuthService, mapBackendRole } from '../../services/auth';
import { usersService } from '../../api/services';
import type { Session, User, UserRole } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  userName: string | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  role: UserRole | null;
  otpReqId: string | null;
  otpMobile: string | null;
  otpLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  userId: null,
  userName: null,
  userRole: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  role: null,
  otpReqId: null,
  otpMobile: null,
  otpLoading: false,
};

const hydrateFromSession = (state: AuthState, session: Session) => {
  state.token = session.accessToken;
  state.refreshToken = session.refreshToken;
  state.userId = session.userId;
  state.userName = session.userName;
  state.userRole = mapBackendRole(session.userRole);
  state.isAuthenticated = true;
  state.user = state.user || {
    id: session.userId,
    name: session.userName,
    email: '',
    role: mapBackendRole(session.userRole),
    active: true,
  };
};

export const loginWithPassword = createAsyncThunk(
  'auth/loginWithPassword',
  async (
    payload: { email: string; password: string; role?: UserRole },
    { rejectWithValue }
  ) => {
    try {
      const session = await AuthService.loginWithPassword(payload);
      if (!session?.userId) {
        console.error('[auth/loginWithPassword] login response missing userId', session);
        return rejectWithValue('Login succeeded but user id is missing from server response.');
      }
      const fullUser = await usersService.getById(session.userId);
      return { session, user: fullUser };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const loadSession = createAsyncThunk('auth/loadSession', async (_, { rejectWithValue }) => {
  try {
    const session = await AuthService.getSession();
    if (!session) return null;
    if (!session.userId) {
      console.error('[auth/loadSession] stored session missing userId', session);
      await AuthService.logout();
      return null;
    }
    const user = await AuthService.fetchUserForSession(session);
    return { session, user };
  } catch (error: any) {
    return rejectWithValue(error?.response?.data?.message || error.message || 'Session load failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await AuthService.logout();
});

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (mobile: string, { rejectWithValue }) => {
    try {
      return await AuthService.sendOtp(mobile);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (
    payload: { mobile: string; otp: string; reqId: string },
    { rejectWithValue }
  ) => {
    try {
      const { session, user } = await AuthService.verifyOtpAndLogin(
        payload.mobile,
        payload.otp,
        payload.reqId
      );
      return { session, user };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'OTP verification failed');
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (reqId: string, { rejectWithValue }) => {
    try {
      return await AuthService.resendOtp(reqId);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to resend OTP');
    }
  }
);

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
    resetLoadingFlags: (state) => {
      state.loading = false;
      state.otpLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.loading = false;
        hydrateFromSession(state, action.payload.session);
        state.user = action.payload.user
          ? { ...action.payload.user, role: mapBackendRole(action.payload.user.role as any) }
          : state.user;
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Login failed';
      })
      .addCase(logout.fulfilled, () => initialState)
      .addCase(loadSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.session) {
          hydrateFromSession(state, action.payload.session);
          if (action.payload.user) {
            state.user = { ...action.payload.user, role: mapBackendRole(action.payload.user.role as any) };
          }
        }
      })
      .addCase(loadSession.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })
      .addCase(sendOtp.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpReqId = action.payload.reqId;
        state.otpMobile = action.meta.arg;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.error = (action.payload as string) || 'Failed to send OTP';
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        hydrateFromSession(state, action.payload.session);
        state.user = action.payload.user
          ? { ...action.payload.user, role: mapBackendRole(action.payload.user.role as any) }
          : state.user;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'OTP verification failed';
      })
      .addCase(resendOtp.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpReqId = action.payload.reqId;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.error = (action.payload as string) || 'Failed to resend OTP';
      })
      .addCase(REHYDRATE, (state) => {
        // Reset transient loading flags so a persisted-in-progress state
        // does not leave buttons stuck showing a spinner after app restart.
        state.loading = false;
        state.otpLoading = false;
      });
  },
});

export const { clearError, setRole, resetLoadingFlags } = authSlice.actions;
export default authSlice.reducer;
