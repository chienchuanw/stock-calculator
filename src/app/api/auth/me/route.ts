import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";

// 獲取當前登入用戶
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "未認證" }, { status: 401 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("獲取用戶錯誤:", error);
    return NextResponse.json(
      { error: "服務器錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
