import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { portfolio } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/portfolio/[id] - 更新持有股票
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "無效的ID" },
        { status: 400 }
      );
    }
    
    // 檢查此 ID 是否存在
    const existingItem = await db.select()
      .from(portfolio)
      .where(eq(portfolio.id, id))
      .limit(1);
      
    if (existingItem.length === 0) {
      return NextResponse.json(
        { message: "找不到此持股項目" },
        { status: 404 }
      );
    }
    
    // 更新資料
    const updatedItem = await db.update(portfolio)
      .set({
        stockSymbol: data.stockSymbol,
        stockName: data.stockName,
        quantity: data.quantity,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate,
        notes: data.notes || null,
      })
      .where(eq(portfolio.id, id))
      .returning();
      
    return NextResponse.json({
      message: "已成功更新股票",
      item: updatedItem[0]
    });
  } catch (error) {
    console.error("更新持股錯誤:", error);
    return NextResponse.json(
      { message: "更新持股時發生錯誤" },
      { status: 500 }
    );
  }
}

// GET /api/portfolio/[id] - 獲取特定持有股票
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "無效的ID" },
        { status: 400 }
      );
    }
    
    const item = await db.select()
      .from(portfolio)
      .where(eq(portfolio.id, id))
      .limit(1);
      
    if (item.length === 0) {
      return NextResponse.json(
        { message: "找不到此持股項目" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item[0]);
  } catch (error) {
    console.error("獲取特定持股錯誤:", error);
    return NextResponse.json(
      { message: "獲取特定持股時發生錯誤" },
      { status: 500 }
    );
  }
}
