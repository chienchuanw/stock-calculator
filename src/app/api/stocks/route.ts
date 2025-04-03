import { db } from "@/db";
import { dailyStocks } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { format, subDays } from "date-fns";

async function findLatestAvailableDate(): Promise<string | null> {
  for (let i = 0; i < 7; i++) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(dailyStocks)
      .where(eq(dailyStocks.tradeDate, date));

    if (result[0]?.count > 0) {
      return date;
    }
  }

  return null;
}

export async function GET() {
  const latestDate = await findLatestAvailableDate();

  if (!latestDate) {
    return new Response(JSON.stringify({ message: "無資料" }), { status: 404 });
  }

  const result = await db
    .select()
    .from(dailyStocks)
    .where(eq(dailyStocks.tradeDate, latestDate))
    .orderBy(desc(dailyStocks.tradeVolume));

  return Response.json(result);
}
