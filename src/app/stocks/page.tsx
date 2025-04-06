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
  const [allData, setAllData] = useState<Stock[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputPage, setInputPage] = useState<string>("");

  // 處理數據載入
  useEffect(() => {
    setLoading(true);

    // 添加延過，使 loading 狀態更明顯
    const fetchData = setTimeout(() => {
      fetch("/api/stocks")
        .then((res) => res.json())
        .then((data) => {
          setAllData(data);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        })
        .catch((error) => {
          console.error("獲取股票資料時發生錯誤:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 1000); // 模擬網路延過 1 秒

    return () => clearTimeout(fetchData);
  }, [itemsPerPage]);

  // 當每頁顯示項目數量變更時重新計算總頁數
  useEffect(() => {
    setTotalPages(Math.ceil(allData.length / itemsPerPage));
    // 如果當前頁超過新的總頁數，則返回最後一頁
    if (currentPage > Math.ceil(allData.length / itemsPerPage)) {
      setCurrentPage(Math.ceil(allData.length / itemsPerPage) || 1);
    }
  }, [allData, itemsPerPage]);

  // 計算當前頁面顯示的數據
  const currentData = allData.slice(
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
    <div className="bg-white min-h-screen">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">股票資訊</h1>

          <div className="flex gap-4">
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
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="#6B7280"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded px-3 py-1">
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
              >
                <path d="M3 7h18M3 12h18M3 17h12"></path>
              </svg>
              <span>篩選</span>
            </button>

            <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded px-3 py-1">
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
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>匯出</span>
            </button>

            <button className="flex items-center gap-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded px-3 py-1">
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
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>新增股票</span>
            </button>
          </div>
        </div>

        {/* 表格 */}
        <div
          className="bg-white shadow-sm rounded-md overflow-hidden border border-gray-100 relative"
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
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1">
                      股票代號
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1">
                      股票名稱
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1">
                      成交股市
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <div className="flex items-center gap-1">
                      成交股數
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
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
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {stock.stockSymbol}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <a
                          href={`/stocks/${stock.stockSymbol}`}
                          className="text-blue-500 hover:underline"
                        >
                          {stock.stockName}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-sm">{stock.market}</td>
                      <td className="py-3 px-4 text-sm">
                        {stock.tradeVolume.toLocaleString()} 股
                      </td>
                      <td className="py-3 px-4 text-sm w-20">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
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
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
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
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        )}

        {/* 顯示頁面資訊 */}
        {!loading && (
          <div className="text-sm text-gray-500 mt-4">
            顯示第{" "}
            {allData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} 至{" "}
            {Math.min(currentPage * itemsPerPage, allData.length)} 筆資料，共{" "}
            {allData.length} 筆
          </div>
        )}
      </div>
    </div>
  );
}
