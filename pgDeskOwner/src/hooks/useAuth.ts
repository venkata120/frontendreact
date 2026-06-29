import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithPassword, logout, clearError, setRole } from '../redux/slices/authSlice';
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

  return {
    ...auth,
    login,
    signOut,
    selectRole,
    resetError,
  };
};
