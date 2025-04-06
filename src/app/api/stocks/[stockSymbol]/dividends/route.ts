import { db } from "@/db";
import { dividends } from "@/db/schema";
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
    const stockDividends = await db
      .select()
      .from(dividends)
      .where(eq(dividends.stockSymbol, stockSymbol))
      .orderBy(dividends.year, "desc");

    return Response.json(stockDividends);
  } catch (error) {
    console.error("獲取股利資訊時發生錯誤:", error);
    return new Response(JSON.stringify({ message: "伺服器錯誤" }), {
      status: 500,
    });
  }
}
