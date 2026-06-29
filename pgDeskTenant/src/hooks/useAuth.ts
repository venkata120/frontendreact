import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, verifyOTP, logout, clearError, setRole } from '../redux/slices/authSlice';
import type { RootState, AppDispatch } from '../redux/store';
import type { UserRole } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const requestOTP = useCallback(
    (phone: string, role?: UserRole) => {
      return dispatch(login({ phone, role })).unwrap();
    },
    [dispatch]
  );

  const confirmOTP = useCallback(
    (phone: string, otp: string) => {
      return dispatch(verifyOTP({ phone, otp })).unwrap();
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

  return {
    ...auth,
    requestOTP,
    confirmOTP,
    signOut,
    selectRole,
    resetError,
  };
};
