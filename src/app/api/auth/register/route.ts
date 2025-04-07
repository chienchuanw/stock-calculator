import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db/queries";
import { users } from "@/db/schema";
import { generateToken, setTokenCookie } from "@/lib/auth/utils";
import { eq, or } from "drizzle-orm";

// 註冊 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // 基本驗證
    if (!username || !email || !password) {
      return NextResponse.json({ error: "必須填寫所有欄位" }, { status: 400 });
    }

    // 檢查電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "電子郵件格式無效" }, { status: 400 });
    }

    // 檢查用戶名和電子郵件是否已存在
    const existingUser = await db.select()
      .from(users)
      .where(
        or(
          eq(users.username, username),
          eq(users.email, email)
        )
      )
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "用戶名或電子郵件已被使用" }, { status: 409 });
    }

    // 密碼哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 創建用戶
    const insertResult = await db.insert(users).values({
      username,
      email,
      passwordHash: hashedPassword,
    }).returning({ id: users.id });
    
    const newUser = insertResult[0];

    // 生成 JWT 令牌
    const token = await generateToken(newUser.id);
    
    // 設置 Cookie
    await setTokenCookie(token);

    return NextResponse.json({
      message: "註冊成功",
      user: { id: newUser.id, username, email },
    });
  } catch (error) {
    console.error("註冊錯誤:", error);
    return NextResponse.json(
      { error: "服務器錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
