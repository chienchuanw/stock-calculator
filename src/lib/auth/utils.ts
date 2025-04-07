import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const secretKey = new TextEncoder().encode(JWT_SECRET);

// 生成 JWT Token
export async function generateToken(userId: number) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // 七天過期
    .sign(secretKey);
}

// 驗證 JWT Token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}

// 設置 Cookie
export function setTokenCookie(token: string) {
  cookies().set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 七天
  });
}

// 取得當前用戶
export async function getCurrentUser() {
  const token = cookies().get("auth-token")?.value;
  
  if (!token) {
    return null;
  }
  
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    return null;
  }
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId as number),
  });
  
  if (!user) {
    return null;
  }
  
  // 不返回密碼哈希
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// 登出 - 刪除 Cookie
export function logout() {
  cookies().delete("auth-token");
}

// Auth middleware
export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}
