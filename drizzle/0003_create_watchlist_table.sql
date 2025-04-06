CREATE TABLE IF NOT EXISTS "watchlist" (
  "id" SERIAL PRIMARY KEY,
  "stock_symbol" VARCHAR(10) NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
