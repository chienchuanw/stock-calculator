"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChevronDown, 
  faChevronLeft, 
  faChevronRight,
  faSearch,
  faTimes,
  faBars,
  faDownload,
  faPlus,
  faEllipsis,
  faStar
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

export default function StocksPage() {
  const [allData, setAllData] = useState<Stock[]>([]);
  const [filteredData, setFilteredData] = useState<Stock[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputPage, setInputPage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [addingToWatchlist, setAddingToWatchlist] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });

  // 處理數據載入
  useEffect(() => {
    setLoading(true);

    // 添加延過，使 loading 狀態更明顯
    const fetchData = setTimeout(() => {
      Promise.all([
        fetch("/api/stocks").then(res => res.json()),
        fetch("/api/watchlist").then(res => res.json())
      ])
        .then(([stocksData, watchlistData]) => {
          setAllData(stocksData);
          setFilteredData(stocksData);
          setTotalPages(Math.ceil(stocksData.length / itemsPerPage));
          
          // 設置觀測名單
          const watchlistSymbols = watchlistData.map((item: WatchlistItem) => item.stockSymbol);
          setWatchlist(watchlistSymbols);
        })
        .catch((error) => {
          console.error("獲取資料時發生錯誤:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 1000); // 模擬網路延過 1 秒

    return () => clearTimeout(fetchData);
  }, [itemsPerPage]);

  // 當每頁顯示項目數量變更時重新計算總頁數
  useEffect(() => {
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    // 如果當前頁超過新的總頁數，則返回最後一頁
    if (currentPage > Math.ceil(filteredData.length / itemsPerPage)) {
      setCurrentPage(Math.ceil(filteredData.length / itemsPerPage) || 1);
    }
  }, [filteredData, itemsPerPage]);
  
  // 處理搜索邏輯
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(allData);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = allData.filter(
        (stock) =>
          stock.stockSymbol.toLowerCase().includes(term) ||
          stock.stockName.toLowerCase().includes(term)
      );
      setFilteredData(filtered);
      setCurrentPage(1); // 重置到第一頁
    }
  }, [searchTerm, allData]);

  // 計算當前頁面顯示的數據
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 處理頁面變更
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // 回到頁面頂部
  };

  // 處理頁碼輸入框變更
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只允許輸入數字
    const value = e.target.value.replace(/[^0-9]/g, '');
    setInputPage(value);
  };

  // 處理頁碼跳轉
  const handlePageJump = () => {
    const pageNumber = parseInt(inputPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      handlePageChange(pageNumber);
      setInputPage(""); // 跳轉後清空輸入框
    }
  };

  // 處理鍵盤事件（按下 Enter 鍵時跳轉）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageJump();
    }
  };
  
  // 添加股票到觀測名單
  const addToWatchlist = async (stockSymbol: string) => {
    if (watchlist.includes(stockSymbol)) {
      setNotification({
        message: '股票已在觀測名單中',
        type: 'error'
      });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
      return;
    }
    
    setAddingToWatchlist(stockSymbol);
    
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stockSymbol }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setWatchlist([...watchlist, stockSymbol]);
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
    } catch (error) {
      console.error('新增至觀測名單時發生錯誤:', error);
      setNotification({
        message: '新增至觀測名單時發生錯誤',
        type: 'error'
      });
    } finally {
      setAddingToWatchlist('');
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };
  
  // 從觀測名單移除股票
  const removeFromWatchlist = async (stockSymbol: string) => {
    setAddingToWatchlist(stockSymbol);
    
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
        setWatchlist(watchlist.filter(symbol => symbol !== stockSymbol));
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
      setAddingToWatchlist('');
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };

  // 產生頁碼陣列
  const getPaginationNumbers = () => {
    let pages = [];

    // 總是顯示第一頁
    if (currentPage > 3) {
      pages.push(1);
      // 如果不連續，顯示省略號
      if (currentPage > 4) {
        pages.push("...");
      }
    }

    // 計算當前頁前後顯示的頁碼
    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    // 總是顯示最後一頁
    if (currentPage < totalPages - 2) {
      // 如果不連續，顯示省略號
      if (currentPage < totalPages - 3) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-white">
      <div className="px-8 py-6 relative">
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
          <h1 className="text-2xl font-bold text-gray-800">股票資訊</h1>

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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">顯示</span>
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-200 rounded px-3 py-1 pr-8 text-sm"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // 重設為第一頁
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <FontAwesomeIcon icon={faChevronDown} className="text-gray-500" size="xs" />
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded px-3 py-1">
              <FontAwesomeIcon icon={faBars} />
              <span>篩選</span>
            </button>

            <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded px-3 py-1">
              <FontAwesomeIcon icon={faDownload} />
              <span>匯出</span>
            </button>

            <Link href="/watchlist" className="flex items-center gap-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded px-3 py-1">
              <FontAwesomeIcon icon={faStar} />
              <span>觀測名單</span>
            </Link>

            <button className="flex items-center gap-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded px-3 py-1">
              <FontAwesomeIcon icon={faPlus} />
              <span>新增股票</span>
            </button>
          </div>
        </div>

        {/* 表格 */}
        <div
          className="bg-white shadow-sm rounded-md overflow-hidden border border-gray-100 relative table-fixed w-full"
          style={{ minHeight: loading ? "300px" : "auto" }}
        >
          {loading ? (
            <div
              className="absolute inset-0 flex justify-center items-center bg-white z-10"
              style={{ minHeight: "300px" }}
            >
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-500 font-medium">正在載入股票資料...</p>
              </div>
            </div>
          ) : (
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: "15%" }} />
                <col style={{ width: "40%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "10%" }} />
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
                  <th className="text-left py-3 px-4 font-medium w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((stock) => (
                    <tr
                      key={stock.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {stock.stockSymbol}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm truncate">
                        <a
                          href={`/stocks/${stock.stockSymbol}`}
                          className="text-blue-500 hover:underline"
                          title={stock.stockName}
                        >
                          {stock.stockName}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-sm truncate">{stock.market}</td>
                      <td className="py-3 px-4 text-sm truncate">
                        {stock.tradeVolume.toLocaleString()} 股
                      </td>
                      <td className="py-3 px-4 text-sm w-20">
                        <div className="flex items-center space-x-2">
                          {watchlist.includes(stock.stockSymbol) ? (
                            <button 
                              className="text-yellow-400 hover:text-yellow-500 transition-colors"
                              title="從觀測名單移除"
                              onClick={() => removeFromWatchlist(stock.stockSymbol)}
                              disabled={addingToWatchlist === stock.stockSymbol}
                            >
                              {addingToWatchlist === stock.stockSymbol ? (
                                <div className="w-4 h-4 border-t-2 border-yellow-500 border-solid rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              )}
                            </button>
                          ) : (
                            <button 
                              className="text-gray-400 hover:text-yellow-400 transition-colors"
                              title="加入觀測名單"
                              onClick={() => addToWatchlist(stock.stockSymbol)}
                              disabled={addingToWatchlist === stock.stockSymbol}
                            >
                              {addingToWatchlist === stock.stockSymbol ? (
                                <div className="w-4 h-4 border-t-2 border-yellow-500 border-solid rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              )}
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-gray-600">
                            <FontAwesomeIcon icon={faEllipsis} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : searchTerm ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 px-4 text-sm text-center text-gray-500"
                    >
                      沒有符合 "{searchTerm}" 的搜尋結果
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 px-4 text-sm text-center text-gray-500"
                    >
                      沒有股票資料
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 分頁 */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
            <button
              className={`flex items-center gap-1 text-sm text-gray-500 px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
              上一頁
            </button>

            <div className="flex flex-wrap items-center gap-4 justify-center">
              <div className="flex">
                {getPaginationNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <button
                      key={index}
                      className={`flex items-center justify-center w-8 h-8 text-sm 
                        ${
                          page === currentPage
                            ? "bg-blue-500 text-white border border-blue-500"
                            : "border border-gray-200 hover:bg-gray-50"
                        } 
                        ${index === 0 ? "rounded-l" : ""} 
                        ${
                          index === getPaginationNumbers().length - 1
                            ? "rounded-r"
                            : ""
                        }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {String(page).padStart(2, "0")}
                    </button>
                  ) : (
                    <button
                      key={index}
                      className="flex items-center justify-center w-8 h-8 text-sm border border-gray-200"
                      disabled
                    >
                      ...
                    </button>
                  )
                )}
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">跳轉至頁碼：</span>
                <input
                  type="text"
                  className="w-16 h-8 text-sm border border-gray-200 rounded px-2"
                  value={inputPage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={String(currentPage)}
                />
                <button
                  onClick={handlePageJump}
                  className="ml-2 px-3 h-8 text-sm border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center"
                >
                  跳轉
                </button>
              </div>
            </div>

            <button
              className={`flex items-center gap-1 text-sm text-gray-500 px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              下一頁
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}

        {/* 顯示頁面資訊 */}
        {!loading && (
          <div className="text-sm text-gray-500 mt-4">
            顯示第{" "}
            {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} 至{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} 筆資料，共{" "}
            {filteredData.length} 筆
            {searchTerm && ` (搜尋結果)`}
          </div>
        )}
      </div>
    </div>
  );
}
