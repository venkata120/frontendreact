import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginWithPassword,
  logout,
  clearError,
  setRole,
  sendOtp,
  verifyOtp,
  resendOtp,
} from '../redux/slices/authSlice';
import type { RootState, AppDispatch } from '../redux/store';
import type { UserRole } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    (email: string, password: string, role?: UserRole) => {
      return dispatch(loginWithPassword({ email, password, role })).unwrap();
    },
    [dispatch]
  );

  const signOut = useCallback(() => {
    return dispatch(logout()).unwrap();
  }, [dispatch]);

  const selectRole = useCallback(
    (role: UserRole) => {
      dispatch(setRole(role));
    },
    [dispatch]
  );

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const sendOtpCallback = useCallback(
    (mobile: string) => {
      return dispatch(sendOtp(mobile)).unwrap();
    },
    [dispatch]
  );

  const verifyOtpCallback = useCallback(
    (mobile: string, otp: string) => {
      return dispatch(verifyOtp({ mobile, otp })).unwrap();
    },
    [dispatch]
  );

  const resendOtpCallback = useCallback(
    (reqId: string) => {
      return dispatch(resendOtp(reqId)).unwrap();
    },
    [dispatch]
  );

  return {
    ...auth,
    login,
    sendOtp: sendOtpCallback,
    verifyOtp: verifyOtpCallback,
    resendOtp: resendOtpCallback,
    signOut,
    selectRole,
    resetError,
  };
};
