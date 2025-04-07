import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { portfolio } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/portfolio - 獲取所有持有股票
export async function GET() {
  try {
    const portfolioItems = await db.select().from(portfolio);
    return NextResponse.json(portfolioItems);
  } catch (error) {
    console.error("獲取持股列表錯誤:", error);
    return NextResponse.json(
      { message: "獲取持股列表時發生錯誤" },
      { status: 500 }
    );
  }
}

// POST /api/portfolio - 新增持有股票
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 檢查必須欄位
    if (!data.stockSymbol || !data.quantity || !data.purchasePrice || !data.purchaseDate) {
      return NextResponse.json(
        { message: "缺少必要欄位" },
        { status: 400 }
      );
    }
    
    // 插入資料
    const newItem = await db.insert(portfolio).values({
      stockSymbol: data.stockSymbol,
      stockName: data.stockName,
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
      purchaseDate: data.purchaseDate,
      notes: data.notes || null,
    }).returning();
    
    return NextResponse.json({ 
      message: "已成功新增股票", 
      item: newItem[0] 
    });
  } catch (error) {
    console.error("新增持股錯誤:", error);
    return NextResponse.json(
      { message: "新增持股時發生錯誤" },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolio - 刪除持有股票
export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { message: "未提供ID" },
        { status: 400 }
      );
    }
    
    await db.delete(portfolio).where(eq(portfolio.id, data.id));
    
    return NextResponse.json({ message: "已成功刪除股票" });
  } catch (error) {
    console.error("刪除持股錯誤:", error);
    return NextResponse.json(
      { message: "刪除持股時發生錯誤" },
      { status: 500 }
    );
  }
}
