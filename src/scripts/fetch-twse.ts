import * as dotenv from "dotenv";
dotenv.config();

import { db } from "@/db";
import { dailyStocks } from "@/db/schema";
import { format, subDays } from "date-fns";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

type StockRow = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

// 🔍 自動往前找最近的有效資料日
async function findLatestAvailableData(): Promise<{
  date: string;
  data: StockRow[];
}> {
  for (let i = 0; i < 7; i++) {
    const date = format(subDays(new Date(), i), "yyyyMMdd");
    const url = `https://www.twse.com.tw/exchangeReport/MI_INDEX?response=json&date=${date}&type=ALLBUT0999`;

    console.log(`🔍 嘗試抓取 TWSE 資料：${date}`);
    const res = await fetch(url);
    const json = await res.json();

    if (json.stat === "OK" && Array.isArray(json.tables)) {
      const table = json.tables.find(
        (t: { title: string }) =>
          typeof t.title === "string" && t.title.includes("每日收盤行情")
      );

      if (table && Array.isArray(table.data)) {
        console.log(`✅ 找到有效資料：${date}`);
        return { date, data: table.data };
      }
    }
  }

  throw new Error("❌ 連續 7 天都沒有 TWSE 資料，請確認 API 或市場狀態");
}

async function main() {
  const { date, data } = await findLatestAvailableData();

  for (const row of data) {
    const [stockSymbol, stockName, tradeVolumeStr] = [row[0], row[1], row[2]];

    const tradeVolume = parseInt(tradeVolumeStr.replace(/,/g, ""), 10);

    await db
      .insert(dailyStocks)
      .values({
        stockSymbol,
        stockName,
        market: "上市",
        tradeVolume,
        tradeDate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(
          6,
          8
        )}`,
      })
      .onConflictDoNothing();
  }

  console.log(`📦 Insert complete for: ${date}, 共 ${data.length} 筆`);
}

main().catch((err) => {
  console.error("❌ Error fetching TWSE:", err);
  process.exit(1);
});
