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

  // 如果正在載入或未驗證，顯示載入中訊息
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

  // 如果未登入，顯示未授權訊息
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4 text-red-600">需要登入</h2>
          <p className="text-gray-600 text-center mb-6">
            您需要登入才能訪問此頁面。請先登入或註冊新帳戶。
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/#login')}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              前往登入
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 如果已登入，顯示受保護的內容
  return <>{children}</>;
}
