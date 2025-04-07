"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faSearch, faWallet } from "@fortawesome/free-solid-svg-icons";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";

export default function StocksContent() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const router = useRouter();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // 模擬載入股票資料
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        // 實際實作中，這裡會從 API 獲取資料
        // 這裡只是模擬資料
        const mockData = [
          { id: 1, stockSymbol: "2330", stockName: "台積電", currentPrice: 675.0, change: 10.0, changePercent: 1.5 },
          { id: 2, stockSymbol: "2317", stockName: "鴻海", currentPrice: 151.5, change: -1.5, changePercent: -0.98 },
          { id: 3, stockSymbol: "2412", stockName: "中華電", currentPrice: 123.0, change: 0.5, changePercent: 0.41 },
          { id: 4, stockSymbol: "2454", stockName: "聯發科", currentPrice: 920.0, change: 15.0, changePercent: 1.66 },
          { id: 5, stockSymbol: "2308", stockName: "台達電", currentPrice: 320.0, change: 3.5, changePercent: 1.1 },
          { id: 6, stockSymbol: "2303", stockName: "聯電", currentPrice: 52.0, change: -0.2, changePercent: -0.38 },
          { id: 7, stockSymbol: "2881", stockName: "富邦金", currentPrice: 78.5, change: 1.2, changePercent: 1.55 },
          { id: 8, stockSymbol: "2882", stockName: "國泰金", currentPrice: 59.0, change: 0.7, changePercent: 1.2 },
        ];

        // 模擬網路延遲
        setTimeout(() => {
          setStocks(mockData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("無法載入股票資料");
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const handleAddToWatchlist = (stockId: number) => {
    if (!isAuthenticated) {
      router.push('/#login');
      return;
    }
    
    // 實際實作中，這裡會呼叫 API 添加到觀測名單
    alert(`已將股票添加到觀測名單（ID: ${stockId}）`);
  };

  const handleAddToPortfolio = (stockId: number) => {
    if (!isAuthenticated) {
      router.push('/#login');
      return;
    }
    
    // 實際實作中，這裡會導航到添加持股表單
    alert(`前往添加持股表單（股票ID: ${stockId}）`);
  };

  // 過濾股票
  const filteredStocks = stocks.filter(stock => 
    stock.stockSymbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    stock.stockName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">股票列表</h1>
      
      {/* 搜尋欄 */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="搜尋股票代碼或名稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* 股票列表 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                股票代碼
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                股票名稱
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                當前價格
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                漲跌幅
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStocks.map((stock) => (
              <tr key={stock.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stock.stockSymbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stock.stockName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stock.currentPrice.toFixed(2)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="flex items-center">
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} 
                    <span className="ml-1">({stock.changePercent.toFixed(2)}%)</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end">
                  <button 
                    className="text-yellow-500 hover:text-yellow-700 p-2"
                    onClick={() => handleAddToWatchlist(stock.id)}
                    title="加入觀測名單"
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </button>
                  <button 
                    className="text-green-600 hover:text-green-800 p-2"
                    onClick={() => handleAddToPortfolio(stock.id)}
                    title="加入持有股票"
                  >
                    <FontAwesomeIcon icon={faWallet} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 提示訊息（未登入時顯示） */}
      {!isAuthenticated && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-700 text-sm">
            提示：您需要<a href="/#login" className="font-bold underline">登入</a>後才能將股票新增到觀測名單或投資組合。
          </p>
        </div>
      )}
    </div>
  );
}
