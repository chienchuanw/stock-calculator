import { db } from "@/db";
import { dailyStocks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { stockSymbol: string } }
) {
  const { stockSymbol } = params;

  if (!stockSymbol) {
    return new Response(JSON.stringify({ message: "股票代號為必填" }), {
      status: 400,
    });
  }

  try {
    const stock = await db
      .select()
      .from(dailyStocks)
      .where(eq(dailyStocks.stockSymbol, stockSymbol))
      .limit(1);

    if (stock.length === 0) {
      return new Response(JSON.stringify({ message: "找不到此股票" }), {
        status: 404,
      });
    }

    return Response.json(stock[0]);
  } catch (error) {
    console.error("獲取股票資訊時發生錯誤:", error);
    return new Response(JSON.stringify({ message: "伺服器錯誤" }), {
      status: 500,
    });
  }
}
