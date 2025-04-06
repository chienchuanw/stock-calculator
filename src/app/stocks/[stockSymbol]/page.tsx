"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Stock {
  id: string;
  stockSymbol: string;
  stockName: string;
  market: string;
  tradeVolume: number;
  tradeDate: string;
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const stockSymbol = params.stockSymbol as string;

  useEffect(() => {
    if (!stockSymbol) return;

    setLoading(true);
    setError(null);

    // 添加延過，使 loading 狀態更明顯
    const fetchData = setTimeout(() => {
      fetch(`/api/stocks/${stockSymbol}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(
              res.status === 404 ? "找不到此股票" : "獲取股票資訊時發生錯誤"
            );
          }
          return res.json();
        })
        .then((data) => {
          setStock(data);
        })
        .catch((err) => {
          console.error("獲取股票資訊時發生錯誤:", err);
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 1000); // 模擬網路延過 1 秒

    return () => clearTimeout(fetchData);
  }, [stockSymbol]);

  const handleBack = () => {
    router.push("/stocks");
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="px-8 py-6">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-blue-500 hover:text-blue-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          返回股票列表
        </button>

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-md shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-gray-500 font-medium">正在載入股票資料...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
            {error}
          </div>
        ) : stock ? (
          <div>
            <div className="bg-white shadow-sm rounded-md overflow-hidden border border-gray-100 p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {stock.stockName} ({stock.stockSymbol})
              </h1>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b border-gray-100 py-3">
                  <div className="text-sm text-gray-500">股票代號</div>
                  <div className="font-medium">{stock.stockSymbol}</div>
                </div>
                <div className="border-b border-gray-100 py-3">
                  <div className="text-sm text-gray-500">股票名稱</div>
                  <div className="font-medium">{stock.stockName}</div>
                </div>
                <div className="border-b border-gray-100 py-3">
                  <div className="text-sm text-gray-500">成交股市</div>
                  <div className="font-medium">{stock.market}</div>
                </div>
                <div className="border-b border-gray-100 py-3">
                  <div className="text-sm text-gray-500">成交股數</div>
                  <div className="font-medium">
                    {stock.tradeVolume.toLocaleString()} 股
                  </div>
                </div>
                <div className="border-b border-gray-100 py-3">
                  <div className="text-sm text-gray-500">交易日期</div>
                  <div className="font-medium">
                    {new Date(stock.tradeDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
            無法獲取股票資訊
          </div>
        )}
      </div>
    </div>
  );
}
