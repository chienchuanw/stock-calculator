import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { generateToken, setTokenCookie } from "@/lib/auth/utils";
import { eq } from "drizzle-orm";

// 登入 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 基本驗證
    if (!email || !password) {
      return NextResponse.json({ error: "電子郵件和密碼是必填欄位" }, { status: 400 });
    }

    // 查找用戶
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json({ error: "無效的認證資訊" }, { status: 401 });
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "無效的認證資訊" }, { status: 401 });
    }

    // 生成 JWT 令牌
    const token = await generateToken(user.id);
    
    // 設置 Cookie
    setTokenCookie(token);

    // 返回用戶數據（不包含密碼）
    const { passwordHash, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      message: "登入成功",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("登入錯誤:", error);
    return NextResponse.json(
      { error: "服務器錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
