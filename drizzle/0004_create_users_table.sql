CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(50) NOT NULL UNIQUE,
  "email" VARCHAR(100) NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

-- 添加外鍵到 portfolio 表
ALTER TABLE "portfolio" ADD COLUMN "user_id" INTEGER;
