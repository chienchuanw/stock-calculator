"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChevronDown, 
  faChevronLeft, 
  faChevronRight,
  faSearch,
  faTimes,
  faStar,
  faExternalLinkAlt,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface Stock {
  id: string;
  stockSymbol: string;
  stockName: string;
  market: string;
  tradeVolume: number;
}

interface WatchlistItem {
  id: string;
  stockSymbol: string;
  createdAt: string;
}

export default function WatchlistPage() {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [stocksData, setStocksData] = useState<{[key: string]: Stock}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<WatchlistItem[]>([]);
  const [removingStock, setRemovingStock] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });

  // 載入觀測名單和股票資料
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 獲取觀測名單
        const watchlistResponse = await fetch("/api/watchlist");
        const watchlistData = await watchlistResponse.json();
        setWatchlistItems(watchlistData);
        setFilteredItems(watchlistData);
        
        // 獲取所有股票資料以顯示詳細信息
        const stocksResponse = await fetch("/api/stocks");
        const stocksData = await stocksResponse.json();
        
        // 將股票資料轉成以 stockSymbol 為鍵的對象，方便查詢
        const stocksMap: {[key: string]: Stock} = {};
        stocksData.forEach((stock: Stock) => {
          stocksMap[stock.stockSymbol] = stock;
        });
        
        setStocksData(stocksMap);
      } catch (error) {
        console.error("獲取觀測名單資料時發生錯誤:", error);
        setNotification({
          message: "獲取觀測名單資料時發生錯誤",
          type: "error"
        });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // 處理搜索
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(watchlistItems);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = watchlistItems.filter(
        (item) => {
          const stock = stocksData[item.stockSymbol];
          return item.stockSymbol.toLowerCase().includes(term) || 
                 (stock && stock.stockName.toLowerCase().includes(term));
        }
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, watchlistItems, stocksData]);
  
  // 從觀測名單中移除股票
  const removeFromWatchlist = async (stockSymbol: string) => {
    setRemovingStock(stockSymbol);
    
    try {
      const response = await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stockSymbol }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 從本地狀態中移除
        setWatchlistItems(prevItems => 
          prevItems.filter(item => item.stockSymbol !== stockSymbol)
        );
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
    } catch (error) {
      console.error('從觀測名單移除時發生錯誤:', error);
      setNotification({
        message: '從觀測名單移除時發生錯誤',
        type: 'error'
      });
    } finally {
      setRemovingStock('');
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };
  
  // 將日期格式化為 yyyy-MM-dd
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-white">
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
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">我的觀測名單</h1>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* 搜索框 */}
            <div className="relative w-full md:w-64 mb-4 md:mb-0">
              <input
                type="text"
                placeholder="搜尋股票代號或名稱..."
                className="w-full border border-gray-200 rounded px-3 py-2 pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm("")}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
            
            <Link href="/stocks" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded px-3 py-1">
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              <span>返回股票列表</span>
            </Link>
          </div>
        </div>

        {/* 表格 */}
        <div
          className="bg-white shadow-sm rounded-md overflow-x-auto overflow-y-hidden border border-gray-100 relative"
          style={{ minHeight: loading ? "300px" : "auto" }}
        >
          {loading ? (
            <div
              className="absolute inset-0 flex justify-center items-center bg-white z-10"
              style={{ minHeight: "300px" }}
            >
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-500 font-medium">正在載入觀測名單資料...</p>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[768px]">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[25%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1">
                      股票代號
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1" size="xs" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1">
                      股票名稱
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1" size="xs" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1">
                      成交股市
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1" size="xs" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1">
                      成交股數
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1" size="xs" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1">
                      添加日期
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1" size="xs" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const stock = stocksData[item.stockSymbol];
                    return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">
                            <FontAwesomeIcon icon={faStar} />
                          </span>
                          <span className="font-medium">
                            {item.stockSymbol}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm truncate">
                        {stock ? (
                          <Link
                            href={`/stocks/${item.stockSymbol}`}
                            className="text-blue-500 hover:underline"
                            title={stock.stockName}
                          >
                            {stock.stockName}
                          </Link>
                        ) : (
                          <span className="text-gray-400">資料載入中...</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm truncate">
                        {stock ? stock.market : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm truncate">
                        {stock ? `${stock.tradeVolume.toLocaleString()} 股` : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm truncate">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <button
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="從觀測名單移除"
                          onClick={() => removeFromWatchlist(item.stockSymbol)}
                          disabled={removingStock === item.stockSymbol}
                        >
                          {removingStock === item.stockSymbol ? (
                            <div className="w-4 h-4 border-t-2 border-red-500 border-solid rounded-full animate-spin"></div>
                          ) : (
                            <FontAwesomeIcon icon={faTrash} />
                          )}
                        </button>
                      </td>
                    </tr>
                  )})
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 px-4 text-center text-gray-500"
                    >
                      {searchTerm ? (
                        <div>
                          <p className="text-lg mb-2">沒有符合 "{searchTerm}" 的搜尋結果</p>
                          <p>請嘗試其他關鍵字</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg mb-2">您的觀測名單目前是空的</p>
                          <p className="mb-4">從股票列表中添加股票來追蹤它們</p>
                          <Link href="/stocks" className="text-blue-500 hover:text-blue-700 border border-blue-300 px-4 py-2 rounded">
                            前往股票列表
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
