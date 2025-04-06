import "dotenv/config";
import { db } from "@/db";
import { dailyStocks, dividends } from "@/db/schema";
import { eq } from "drizzle-orm";
import axios from "axios";

// FinMind 回傳型別定義
interface FinMindDividendRow {
  stock_id: string;
  date: string;
  year: number;
  cash_dividend?: number;
  stock_dividend?: number;
  total_dividend?: number;
  ex_dividend_trading_date?: string;
}

// CLI 參數解析
const args = process.argv.slice(2);
const symbolArg = args.find((arg) => arg.startsWith("--symbol="));
const symbolFromCli = symbolArg?.split("=")[1];

// 撈取所有尚未有股利資料的股票代號
async function getSymbolsWithoutDividends(): Promise<string[]> {
  const stocks = await db
    .select({ stockSymbol: dailyStocks.stockSymbol })
    .from(dailyStocks);
  const dividendsWithSymbol = await db
    .select({ stockSymbol: dividends.stockSymbol })
    .from(dividends);

  const hasDividendSet = new Set(dividendsWithSymbol.map((d) => d.stockSymbol));
  const result = [...new Set(stocks.map((s) => s.stockSymbol))].filter(
    (symbol) => !hasDividendSet.has(symbol)
  );

  return result;
}

// 取得單一股票歷年股利，並寫入資料庫
async function fetchAndInsertDividends(stockId: string) {
  try {
    const res = await axios.get("https://api.finmindtrade.com/api/v4/data", {
      params: {
        dataset: "TaiwanStockDividend",
        data_id: stockId,
        start_date: "2018-01-01",
        token: process.env.FINMIND_API_TOKEN,
      },
    });

    console.log(res);

    const rows: FinMindDividendRow[] = res.data.data;

    // 若是 CLI 指定個股，先刪除該股票舊資料
    if (symbolFromCli) {
      await db.delete(dividends).where(eq(dividends.stockSymbol, stockId));
      console.log(`🗑️ 已清除 ${stockId} 的舊有股利資料`);
    }

    for (const row of rows as any[]) {
      await db
        .insert(dividends)
        .values({
          stockSymbol: row.stock_id,
          year: Number(row.year),
          exDividendDate: row.CashExDividendTradingDate || null,
          cashDividend: row.CashEarningsDistribution?.toString() || null,
          stockDividend: row.StockEarningsDistribution?.toString() || null,
          totalDividend: (
            (row.CashEarningsDistribution ?? 0) +
              (row.StockEarningsDistribution ?? 0) || null
          )?.toString(),
          issuedDate: row.date || null,
        })
        .onConflictDoNothing();
    }

    console.log(`✅ 寫入完成：${stockId}，共 ${rows.length} 筆`);
  } catch (err) {
    console.error(`❌ ${stockId} 抓取失敗`, err);
  }
}

// 主程式
async function main() {
  let symbols: string[] = [];

  if (symbolFromCli) {
    symbols = [symbolFromCli];
    console.log(`🔎 僅抓取指定股票：${symbolFromCli}`);
  } else {
    symbols = await getSymbolsWithoutDividends();
    console.log(`🔍 將處理 ${symbols.length} 檔尚未有股利資料的股票`);
  }

  for (const stockId of symbols) {
    await fetchAndInsertDividends(stockId);
  }

  console.log("🎉 股利資料抓取完畢");
}

main().catch((err) => {
  console.error("❌ 執行錯誤:", err);
  process.exit(1);
});
