CREATE TABLE "dividends" (
	"id" serial PRIMARY KEY NOT NULL,
	"stock_symbol" varchar(10) NOT NULL,
	"year" integer NOT NULL,
	"dividend_per_share" integer NOT NULL,
	"payout_date" date
);
