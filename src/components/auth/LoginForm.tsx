"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginUser, clearError } from "@/redux/authSlice";

type LoginFormData = {
  emailOrUsername: string;
  password: string;
};

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  
  useEffect(() => {
    // 清除先前的错误
    dispatch(clearError());
    
    // 如果已登入，重定向到首頁
    if (isAuthenticated) {
      router.push("/");
    }
  }, [dispatch, isAuthenticated, router]);
  
  const onSubmit = async (data: LoginFormData) => {
    await dispatch(loginUser(data));
  };
  
  return (
    <div className="w-full bg-white p-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">登入帳戶</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="emailOrUsername" className="block mb-1 text-sm font-medium text-gray-700">
            帳號
          </label>
          <div className="text-xs text-gray-500 mb-2">可使用電子郵件或用戶名登入</div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faUser} className="text-gray-400" />
            </div>
            <input
              {...register("emailOrUsername", {
                required: "帳號是必填項",
                minLength: {
                  value: 3,
                  message: "帳號長度不能少於3個字符",
                },
              })}
              type="text"
              id="emailOrUsername"
              className={`pl-10 w-full p-2.5 border rounded-md focus:ring-2 focus:outline-none ${
                errors.emailOrUsername ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="電子郵件或用戶名"
              disabled={loading}
            />
          </div>
          {errors.emailOrUsername && (
            <p className="mt-1 text-sm text-red-600">{errors.emailOrUsername.message}</p>
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
              type={showPassword ? "text" : "password"}
              id="password"
              className={`pl-10 pr-10 w-full p-2.5 border rounded-md focus:ring-2 focus:outline-none ${
                errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="••••••••"
              disabled={loading}
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="text-gray-400 hover:text-gray-600"
                title={showPassword ? "隱藏密碼" : "顯示密碼"}
              />
            </div>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "登入中..." : "登入"}
        </button>
      </form>
    </div>
  );
}
