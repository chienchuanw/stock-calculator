'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';

interface ProtectedRouteProps {
  children: ReactNode;
}

// 此組件用於保護需要登入才能訪問的路由
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // 等待身分驗證狀態載入完成
    if (!loading) {
      // 如果用戶未登入，重定向到登入頁面
      if (!isAuthenticated) {
        router.replace('/#login');
      }
    }
  }, [isAuthenticated, loading, router]);

  // 如果正在載入，顯示載入中訊息
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  // 已登入則顯示内容，未登入時暂時顯示空白，等待重定向生效
  return isAuthenticated ? <>{children}</> : null;
}
