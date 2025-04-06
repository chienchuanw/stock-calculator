import { db } from "@/db";
import { watchlist, dailyStocks } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const watchlistItems = await db.select().from(watchlist);
    return Response.json(watchlistItems);
  } catch (error) {
    console.error("獲取觀測名單時發生錯誤:", error);
    return new Response(JSON.stringify({ message: "獲取觀測名單時發生錯誤" }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const { stockSymbol } = await request.json();

    if (!stockSymbol) {
      return new Response(JSON.stringify({ message: "股票代號不能為空" }), {
        status: 400,
      });
    }

    // 檢查是否已存在於觀測名單中
    const existingStock = await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.stockSymbol, stockSymbol));

    if (existingStock.length > 0) {
      return new Response(JSON.stringify({ message: "股票已在觀測名單中" }), {
        status: 409,
      });
    }

    // 新增股票到觀測名單
    const result = await db.insert(watchlist).values({ stockSymbol }).returning();

    return Response.json({
      message: "已成功新增到觀測名單",
      stock: result[0],
    });
  } catch (error) {
    console.error("新增股票到觀測名單時發生錯誤:", error);
    return new Response(
      JSON.stringify({ message: "新增股票到觀測名單時發生錯誤" }),
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { stockSymbol } = await request.json();

    if (!stockSymbol) {
      return new Response(JSON.stringify({ message: "股票代號不能為空" }), {
        status: 400,
      });
    }

    await db.delete(watchlist).where(eq(watchlist.stockSymbol, stockSymbol));

    return Response.json({ message: "已從觀測名單中移除" });
  } catch (error) {
    console.error("從觀測名單移除股票時發生錯誤:", error);
    return new Response(
      JSON.stringify({ message: "從觀測名單移除股票時發生錯誤" }),
      { status: 500 }
    );
  }
}
