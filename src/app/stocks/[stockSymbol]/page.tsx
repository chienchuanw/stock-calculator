"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronUp,
  faChevronDown,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

interface Stock {
  id: string;
  stockSymbol: string;
  stockName: string;
  market: string;
  tradeVolume: number;
  tradeDate: string;
}

interface Dividend {
  id: string;
  stockSymbol: string;
  year: number;
  exDividendDate: string | null;
  cashDividend: string | null;
  stockDividend: string | null;
  totalDividend: string | null;
  issuedDate: string | null;
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [stock, setStock] = useState<Stock | null>(null);
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dividendsLoading, setDividendsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dividendsError, setDividendsError] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // 默認降序（新到舊）
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);
  const [watchlistLoading, setWatchlistLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });

  const stockSymbol = params.stockSymbol as string;

  // 檢查股票是否在觀測名單中
  useEffect(() => {
    if (!stockSymbol) return;
    
    fetch('/api/watchlist')
      .then(res => res.json())
      .then(data => {
        const isInList = data.some((item: any) => item.stockSymbol === stockSymbol);
        setIsInWatchlist(isInList);
      })
      .catch(error => {
        console.error('獲取觀測名單時發生錯誤:', error);
      });
  }, [stockSymbol]);

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

  // 獲取股利資訊
  useEffect(() => {
    if (!stockSymbol) return;

    setDividendsLoading(true);
    setDividendsError(null);

    fetch(`/api/stocks/${stockSymbol}/dividends`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 404 ? "找不到股利資訊" : "獲取股利資訊時發生錯誤"
          );
        }
        return res.json();
      })
      .then((data) => {
        // 預設依照年度降序排列
        const sortedData = sortDividends(data);
        setDividends(sortedData);
      })
      .catch((err) => {
        console.error("獲取股利資訊時發生錯誤:", err);
        setDividendsError(err.message);
      })
      .finally(() => {
        setDividendsLoading(false);
      });
  }, [stockSymbol]);

  // 重新排序股利資料
  const sortDividends = (data: Dividend[]) => {
    return [...data].sort((a, b) =>
      sortDirection === "desc" ? b.year - a.year : a.year - b.year
    );
  };

  // 切換排序方向
  const toggleSortDirection = () => {
    // 獲取新的排序方向
    const newDirection = sortDirection === "desc" ? "asc" : "desc";

    // 使用新的排序方向進行排序
    if (dividends.length > 0) {
      const sortedData = [...dividends].sort((a, b) =>
        newDirection === "desc" ? b.year - a.year : a.year - b.year
      );
      setDividends(sortedData);
    }

    // 更新狀態
    setSortDirection(newDirection);
  };

  const handleBack = () => {
    router.push("/stocks");
  };
  
  // 添加或移除股票到觀測名單
  const toggleWatchlist = async () => {
    if (!stockSymbol) return;
    
    setWatchlistLoading(true);
    
    try {
      if (isInWatchlist) {
        // 從觀測名單中移除
        const response = await fetch('/api/watchlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stockSymbol }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setIsInWatchlist(false);
          setNotification({
            message: data.message || '已從觀測名單移除',
            type: 'success'
          });
        } else {
          setNotification({
            message: data.message || '移除失敗',
            type: 'error'
          });
        }
      } else {
        // 添加到觀測名單
        const response = await fetch('/api/watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stockSymbol }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setIsInWatchlist(true);
          setNotification({
            message: data.message || '已新增到觀測名單',
            type: 'success'
          });
        } else {
          setNotification({
            message: data.message || '新增失敗',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.error('處理觀測名單操作時發生錯誤:', error);
      setNotification({
        message: '處理觀測名單操作時發生錯誤',
        type: 'error'
      });
    } finally {
      setWatchlistLoading(false);
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        {/* 通知元件 */}
        {notification.message && (
          <div className={`fixed top-6 right-6 z-50 p-4 rounded-md shadow-md animate-fade-in-out ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {notification.message}
              </span>
            </div>
          </div>
        )}
        
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-blue-500 hover:text-blue-600 hover:cursor-pointer"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />
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
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  {stock.stockName} ({stock.stockSymbol})
                </h1>
                <button 
                  className={`p-2 rounded-full transition-colors ${isInWatchlist ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-400'}`}
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  title={isInWatchlist ? '從觀測名單移除' : '加入觀測名單'}
                >
                  {watchlistLoading ? (
                    <div className="w-5 h-5 border-t-2 border-yellow-500 border-solid rounded-full animate-spin"></div>
                  ) : (
                    <FontAwesomeIcon icon={faStar} size="lg" />
                  )}
                </button>
              </div>
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

            {/* 股利資訊區塊 */}
            <div className="bg-white shadow-sm rounded-md overflow-hidden border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                歷年股利資訊
              </h2>

              {dividendsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : dividendsError ? (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
                  {dividendsError}
                </div>
              ) : dividends.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
                  此股票無股利資訊或尚未獲取到股利資料
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[768px]">
                    <colgroup>
                      <col className="w-[10%]" />
                      <col className="w-[18%]" />
                      <col className="w-[18%]" />
                      <col className="w-[18%]" />
                      <col className="w-[18%]" />
                      <col className="w-[18%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-gray-50">
                        <th
                          className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={toggleSortDirection}
                        >
                          <div className="flex items-center">
                            年度
                            {sortDirection === "desc" ? (
                              <FontAwesomeIcon
                                icon={faChevronUp}
                                className="ml-1"
                                size="sm"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                className="ml-1"
                                size="sm"
                              />
                            )}
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          除息日
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          現金股利
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          股票股利
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          合計股利
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          發放日期
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dividends.map((dividend) => (
                        <tr key={dividend.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 whitespace-nowrap">
                            {dividend.year}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {dividend.exDividendDate
                              ? new Date(
                                  dividend.exDividendDate
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {dividend.cashDividend || "-"}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {dividend.stockDividend || "-"}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-medium">
                            {dividend.totalDividend || "-"}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {dividend.issuedDate
                              ? new Date(
                                  dividend.issuedDate
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
