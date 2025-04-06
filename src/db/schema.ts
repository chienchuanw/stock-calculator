import { pgTable, serial, varchar, integer, date, timestamp } from "drizzle-orm/pg-core";

export const dividends = pgTable("dividends", {
  id: serial("id").primaryKey(),
  stockSymbol: varchar("stock_symbol", { length: 10 }).notNull(),
  year: integer("year").notNull(),
  exDividendDate: date("ex_dividend_date"),
  cashDividend: varchar("cash_dividend", { length: 20 }),
  stockDividend: varchar("stock_dividend", { length: 20 }),
  totalDividend: varchar("total_dividend", { length: 20 }),
  issuedDate: date("issued_date"),
});

export const dailyStocks = pgTable("daily_stocks", {
  id: serial("id").primaryKey(),
  stockSymbol: varchar("stock_symbol", { length: 10 }).notNull().unique(),
  stockName: varchar("stock_name", { length: 50 }).notNull(),
  market: varchar("market", { length: 10 }).notNull(), // 例如：「上市」、「上櫃」
  tradeVolume: integer("trade_volume").notNull(),
  tradeDate: date("trade_date").notNull(),
});

export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  stockSymbol: varchar("stock_symbol", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
