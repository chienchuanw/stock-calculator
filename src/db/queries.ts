import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { pgTable } from 'drizzle-orm/pg-core';

// 創建數據庫連接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  database: "db_stock",
});

// 創建帶有預先準備查詢的 drizzle 實例
export const db = drizzle(pool, { schema });
