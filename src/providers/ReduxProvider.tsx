"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { ReactNode, useEffect, useState } from "react";
import { fetchCurrentUser } from "@/redux/authSlice";

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  // Prevent initial hydration mismatch
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // 在客户端初始化时检查用户状态
    store.dispatch(fetchCurrentUser());
  }, []);

  // Prevent hydration mismatch by rendering nothing on server
  if (!isClient) {
    return null;
  }

  return <Provider store={store}>{children}</Provider>;
}
