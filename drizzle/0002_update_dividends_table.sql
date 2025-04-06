-- 如果表已存在則先刪除
DROP TABLE IF EXISTS "dividends";

-- 創建新的 dividends 表結構
CREATE TABLE "dividends" (
	"id" serial PRIMARY KEY NOT NULL,
	"stock_symbol" varchar(10) NOT NULL,
	"year" integer NOT NULL,
	"ex_dividend_date" date,
	"cash_dividend" varchar(20),
	"stock_dividend" varchar(20),
	"total_dividend" varchar(20),
	"issued_date" date
);