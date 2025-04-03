import { pgTable, serial, varchar, integer, date } from "drizzle-orm/pg-core";

export const dividends = pgTable("dividends", {
  id: serial("id").primaryKey(),
  stockSymbol: varchar("stock_symbol", { length: 10 }).notNull(),
  year: integer("year").notNull(),
  dividendPerShare: integer("dividend_per_share").notNull(),
  payoutDate: date("payout_date"),
});
