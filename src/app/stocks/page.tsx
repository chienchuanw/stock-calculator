"use client";
import { useEffect, useState } from "react";

interface Stock {
  id: string;
  stockSymbol: string;
  stockName: string;
  market: string;
  tradeVolume: number;
}

export default function StocksPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/stocks")
      .then((res) => res.json())
      .then(setData);
  }, []);

  console.log(data);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">今日股市資訊</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">股票代號</th>
            <th className="border p-2">股票名稱</th>
            <th className="border p-2">成交股市</th>
            <th className="border p-2">成交股數</th>
          </tr>
        </thead>
        <tbody>
          {data.map((stock: Stock) => (
            <tr key={stock.id}>
              <td className="border p-2">{stock.stockSymbol}</td>
              <td className="border p-2">{stock.stockName}</td>
              <td className="border p-2">{stock.market}</td>
              <td className="border p-2">
                {stock.tradeVolume.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
