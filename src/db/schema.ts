import { pgTable, serial, varchar, integer, date } from "drizzle-orm/pg-core";

export const dividends = pgTable("dividends", {
  id: serial("id").primaryKey(),
  stockSymbol: varchar("stock_symbol", { length: 10 }).notNull(),
  year: integer("year").notNull(),
  dividendPerShare: integer("dividend_per_share").notNull(),
  payoutDate: date("payout_date"),
});

export const dailyStocks = pgTable("daily_stocks", {
  id: serial("id").primaryKey(),
  stockSymbol: varchar("stock_symbol", { length: 10 }).notNull(),
  stockName: varchar("stock_name", { length: 50 }).notNull(),
  market: varchar("market", { length: 10 }).notNull(), // 例如：「上市」、「上櫃」
  tradeVolume: integer("trade_volume").notNull(),
  tradeDate: date("trade_date").notNull(),
});
