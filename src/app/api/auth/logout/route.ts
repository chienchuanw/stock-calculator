import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 登出 API
export async function POST() {
  try {
    // 刪除認證 Cookie
    cookies().delete("auth-token");
    
    return NextResponse.json({ message: "已成功登出" });
  } catch (error) {
    console.error("登出錯誤:", error);
    return NextResponse.json(
      { error: "服務器錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
