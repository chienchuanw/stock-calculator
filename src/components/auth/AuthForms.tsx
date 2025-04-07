"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthForms() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const searchParams = useSearchParams();
  
  // 檢查 URL 是否包含 #login 或 #register 以決定顯示哪個表單
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#register") {
      setActiveTab("register");
    } else if (hash === "#login") {
      setActiveTab("login");
    }
  }, []);
  
  // 切換標籤時更新 URL hash
  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    window.location.hash = tab;
  };
  
  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === "login"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => handleTabChange("login")}
        >
          登入
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === "register"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => handleTabChange("register")}
        >
          註冊
        </button>
      </div>
      
      <div className="p-6">
        {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
