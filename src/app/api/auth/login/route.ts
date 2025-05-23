import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db/queries";
import { users } from "@/db/schema";
import { generateToken, setTokenCookie } from "@/lib/auth/utils";
import { eq } from "drizzle-orm";

// 登入 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrUsername, password } = body;

    // 基本驗證
    if (!emailOrUsername || !password) {
      return NextResponse.json({ error: "帳號和密碼是必填欄位" }, { status: 400 });
    }

    // 查找用戶 - 先根據電子郵件查找
    let userResults = await db.select()
      .from(users)
      .where(eq(users.email, emailOrUsername))
      .limit(1);

    // 如果電子郵件查找無結果，則根據用戶名查找
    if (userResults.length === 0) {
      userResults = await db.select()
        .from(users)
        .where(eq(users.username, emailOrUsername))
        .limit(1);
    }

    const user = userResults[0];

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
    await setTokenCookie(token);

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
