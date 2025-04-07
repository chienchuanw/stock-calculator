"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "登入失敗");
      }
      
      // 登入成功，重新整理頁面以套用新的身分驗證狀態
      router.refresh();
      // 重定向到首頁
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登入過程中發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full bg-white p-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">登入</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
            電子郵件
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faUser} className="text-gray-400" />
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "登入中..." : "登入"}
        </button>
      </form>
    </div>
  );
}
