'use client';

import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ReactNode, useEffect } from 'react';
import { fetchCurrentUser } from '@/redux/authSlice';

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  // 在 client side 初始化時檢查用戶狀態
  useEffect(() => {
    store.dispatch(fetchCurrentUser());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
