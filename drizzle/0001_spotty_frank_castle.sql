CREATE TABLE "daily_stocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"stock_symbol" varchar(10) NOT NULL,
	"stock_name" varchar(50) NOT NULL,
	"market" varchar(10) NOT NULL,
	"trade_volume" integer NOT NULL,
	"trade_date" date NOT NULL
);
