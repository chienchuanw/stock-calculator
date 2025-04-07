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
  faEdit,
  faTrash,
  faInfoCircle,
  faCoins
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import AddStockModal from "./AddStockModal";

interface PortfolioItem {
  id: number;
  stockSymbol: string;
  stockName: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
}

export default function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [filteredData, setFilteredData] = useState<PortfolioItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputPage, setInputPage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [stockPrices, setStockPrices] = useState<{[key: string]: number}>({});
  
  // 載入持有股票列表
  const fetchPortfolioData = () => {
    setLoading(true);
    
    // 添加延遲，使載入狀態更明顯
    const fetchData = setTimeout(() => {
      fetch("/api/portfolio")
        .then(res => res.json())
        .then(data => {
          setPortfolioData(data);
          setFilteredData(data);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
          
          // 假設我們有獲取最新股價的 API (這裡模擬)
          const mockPrices: {[key: string]: number} = {};
          data.forEach((item: PortfolioItem) => {
            // 股價模擬成購買價格的 0.9-1.1 倍
            mockPrices[item.stockSymbol] = item.purchasePrice * (0.9 + Math.random() * 0.2);
          });
          setStockPrices(mockPrices);
        })
        .catch(error => {
          console.error("獲取持股數據時發生錯誤:", error);
          setNotification({
            message: "獲取持股數據時發生錯誤",
            type: "error"
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }, 1000);
    
    return () => clearTimeout(fetchData);
  };
  
  // 初始加載數據
  useEffect(() => {
    fetchPortfolioData();
  }, []);
  
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
      setFilteredData(portfolioData);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = portfolioData.filter(
        (item) =>
          item.stockSymbol.toLowerCase().includes(term) ||
          (item.stockName && item.stockName.toLowerCase().includes(term))
      );
      setFilteredData(filtered);
      setCurrentPage(1); // 重置到第一頁
    }
  }, [searchTerm, portfolioData]);
  
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
  
  // 處理刪除持股項目
  const handleDeleteItem = async (id: number) => {
    if (!confirm("確定要刪除這筆持股記錄嗎？")) {
      return;
    }
    
    try {
      const response = await fetch('/api/portfolio', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 更新本地數據
        setPortfolioData(prevState => prevState.filter(item => item.id !== id));
        setNotification({
          message: data.message || '已成功刪除持股項目',
          type: 'success'
        });
      } else {
        setNotification({
          message: data.message || '刪除失敗',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('刪除持股項目時發生錯誤:', error);
      setNotification({
        message: '刪除持股項目時發生錯誤',
        type: 'error'
      });
    }
    
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };
  
  // 計算總持股價值
  const calculateTotalValue = () => {
    return portfolioData.reduce((total, item) => {
      const currentPrice = stockPrices[item.stockSymbol] || item.purchasePrice;
      return total + (currentPrice * item.quantity);
    }, 0);
  };
  
  // 計算總成本
  const calculateTotalCost = () => {
    return portfolioData.reduce((total, item) => {
      return total + (item.purchasePrice * item.quantity);
    }, 0);
  };
  
  // 計算總盈虧
  const calculateTotalProfitLoss = () => {
    return calculateTotalValue() - calculateTotalCost();
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
  
  // 格式化數字為金額
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // 計算盈虧百分比
  const calculateProfitLossPercentage = (purchasePrice: number, currentPrice: number) => {
    return ((currentPrice - purchasePrice) / purchasePrice) * 100;
  };
  
  // 處理新增股票成功
  const handleAddSuccess = (newItem: PortfolioItem) => {
    setPortfolioData(prev => [...prev, newItem]);
    setShowAddModal(false);
    setNotification({
      message: '已成功新增持股項目',
      type: 'success'
    });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
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
          <h1 className="text-2xl font-bold text-gray-800">持有股票</h1>

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

            <button 
              className="flex items-center gap-2 text-sm text-white bg-green-500 hover:bg-green-600 rounded px-3 py-1"
              onClick={() => setShowAddModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>新增股票</span>
            </button>
          </div>
        </div>
        
        {/* 摘要卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">總投資成本</div>
            <div className="text-xl font-bold text-gray-800">{formatCurrency(calculateTotalCost())}</div>
          </div>
          
          <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">目前總市值</div>
            <div className="text-xl font-bold text-gray-800">{formatCurrency(calculateTotalValue())}</div>
          </div>
          
          <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">總盈虧</div>
            <div className={`text-xl font-bold ${calculateTotalProfitLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(calculateTotalProfitLoss())}
              <span className="text-sm ml-2">
                ({(calculateTotalProfitLoss() / calculateTotalCost() * 100).toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* 表格 */}
        <div
          className="bg-white shadow-sm rounded-md overflow-x-auto overflow-y-hidden border border-gray-100 relative w-full"
          style={{ minHeight: loading ? "300px" : "auto" }}
        >
          {loading ? (
            <div
              className="absolute inset-0 flex justify-center items-center bg-white z-10"
              style={{ minHeight: "300px" }}
            >
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-3"></div>
                <p className="text-gray-500 font-medium">正在載入持股資料...</p>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[768px]">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
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
                  <th className="text-right py-3 px-4 font-medium">
                    <div className="flex items-center gap-1 justify-end">
                      持有股數
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1" size="xs" />
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    <div className="flex items-center gap-1 justify-end">
                      買入價格
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1" size="xs" />
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    <div className="flex items-center gap-1 justify-end">
                      目前價格
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1" size="xs" />
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    <div className="flex items-center gap-1 justify-end">
                      市值
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1" size="xs" />
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    <div className="flex items-center gap-1 justify-end">
                      盈虧
                      <FontAwesomeIcon icon={faChevronDown} className="ml-1" size="xs" />
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item) => {
                    const currentPrice = stockPrices[item.stockSymbol] || item.purchasePrice;
                    const profitLoss = (currentPrice - item.purchasePrice) * item.quantity;
                    const profitLossPercentage = calculateProfitLossPercentage(item.purchasePrice, currentPrice);
                    
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {item.stockSymbol}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm truncate">
                          <a
                            href={`/stocks/${item.stockSymbol}`}
                            className="text-blue-500 hover:underline"
                            title={item.stockName}
                          >
                            {item.stockName || "-"}
                          </a>
                        </td>
                        <td className="py-3 px-4 text-sm text-right truncate">
                          {item.quantity.toLocaleString()} 股
                        </td>
                        <td className="py-3 px-4 text-sm text-right truncate">
                          {item.purchasePrice.toLocaleString()} 元
                        </td>
                        <td className="py-3 px-4 text-sm text-right truncate">
                          {currentPrice.toLocaleString()} 元
                        </td>
                        <td className="py-3 px-4 text-sm text-right truncate">
                          {formatCurrency(currentPrice * item.quantity)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right truncate">
                          <div className={`${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(profitLoss)}
                            <div className="text-xs">
                              {profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              className="text-blue-500 hover:text-blue-600"
                              title="編輯"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button 
                              className="text-red-500 hover:text-red-600"
                              title="刪除"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : searchTerm ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-4 px-4 text-sm text-center text-gray-500"
                    >
                      沒有符合 "{searchTerm}" 的搜尋結果
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-4 px-4 text-sm text-center text-gray-500"
                    >
                      沒有持股資料
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
                            ? "bg-green-500 text-white border border-green-500"
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
        
        {/* 新增股票 Modal */}
        {showAddModal && (
          <AddStockModal 
            onClose={() => setShowAddModal(false)} 
            onAddSuccess={handleAddSuccess}
          />
        )}
      </div>
    </div>
  );
}
