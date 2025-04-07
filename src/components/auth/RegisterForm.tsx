"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { registerUser, clearError } from "@/redux/authSlice";

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();
  
  // 用於確認密碼的比對
  const password = watch("password");
  
  useEffect(() => {
    // 清除先前的錯誤
    dispatch(clearError());
    
    // 如果已登入，重定向到首頁
    if (isAuthenticated) {
      router.push("/");
    }
  }, [dispatch, isAuthenticated, router]);
  
  const onSubmit = async (data: RegisterFormData) => {
    const { username, email, password } = data;
    await dispatch(registerUser({ username, email, password }));
  };
  
  return (
    <div className="w-full bg-white p-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">註冊</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700">
            用戶名
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faUser} className="text-gray-400" />
            </div>
            <input
              {...register("username", {
                required: "用戶名是必填項",
                minLength: {
                  value: 3,
                  message: "用戶名長度不能少於3個字符",
                },
              })}
              type="text"
              id="username"
              className={`pl-10 w-full p-2.5 border rounded-md focus:ring-2 focus:outline-none ${
                errors.username ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="your_username"
              disabled={loading}
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
            電子郵件
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
            </div>
            <input
              {...register("email", {
                required: "電子郵件是必填項",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "請輸入有效的電子郵件地址",
                },
              })}
              type="email"
              id="email"
              className={`pl-10 w-full p-2.5 border rounded-md focus:ring-2 focus:outline-none ${
                errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
            密碼
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faLock} className="text-gray-400" />
            </div>
            <input
              {...register("password", {
                required: "密碼是必填項",
                minLength: {
                  value: 6,
                  message: "密碼長度不能少於6個字符",
                },
              })}
              type="password"
              id="password"
              className={`pl-10 w-full p-2.5 border rounded-md focus:ring-2 focus:outline-none ${
                errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700">
            確認密碼
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faLock} className="text-gray-400" />
            </div>
            <input
              {...register("confirmPassword", {
                required: "請確認您的密碼",
                validate: (value) => value === password || "密碼不匹配",
              })}
              type="password"
              id="confirmPassword"
              className={`pl-10 w-full p-2.5 border rounded-md focus:ring-2 focus:outline-none ${
                errors.confirmPassword ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "註冊中..." : "註冊"}
        </button>
      </form>
    </div>
  );
}
