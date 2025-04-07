"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

export default function PortfolioContent() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 模擬載入投資組合資料
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // 實際實作中，這裡會從 API 獲取資料
        // 這裡只是模擬資料
        const mockData = [
          { 
            id: 1, 
            stockSymbol: "2330", 
            stockName: "台積電", 
            quantity: 100, 
            purchasePrice: 500.0, 
            currentPrice: 675.0,
            purchaseDate: "2023-10-15" 
          },
          { 
            id: 2, 
            stockSymbol: "2317", 
            stockName: "鴻海", 
            quantity: 500, 
            purchasePrice: 120.5, 
            currentPrice: 151.5,
            purchaseDate: "2023-11-20" 
          },
          { 
            id: 3, 
            stockSymbol: "2412", 
            stockName: "中華電", 
            quantity: 300, 
            purchasePrice: 110.0, 
            currentPrice: 123.0,
            purchaseDate: "2024-01-10" 
          },
        ];

        // 模擬網路延遲
        setTimeout(() => {
          setPortfolio(mockData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("無法載入投資組合資料");
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const calculateProfit = (item: any) => {
    const invested = item.quantity * item.purchasePrice;
    const current = item.quantity * item.currentPrice;
    return current - invested;
  };

  const calculateProfitPercentage = (item: any) => {
    const profit = calculateProfit(item);
    const invested = item.quantity * item.purchasePrice;
    return (profit / invested) * 100;
  };

  const getTotalInvestment = () => {
    return portfolio.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  };

  const getCurrentValue = () => {
    return portfolio.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0);
  };

  const getTotalProfit = () => {
    return getCurrentValue() - getTotalInvestment();
  };

  const getTotalProfitPercentage = () => {
    const totalInvestment = getTotalInvestment();
    if (totalInvestment === 0) return 0;
    return (getTotalProfit() / totalInvestment) * 100;
  };

  const removeFromPortfolio = (id: number) => {
    setPortfolio(prevList => prevList.filter(item => item.id !== id));
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的投資組合</h1>
        <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center">
          <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
          新增持股
        </button>
      </div>
      
      {portfolio.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">您的投資組合中還沒有股票</p>
          <button 
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => window.location.href = "/stocks"}
          >
            瀏覽股票列表
          </button>
        </div>
      ) : (
        <>
          {/* 投資組合摘要 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">總投資額</p>
              <p className="text-xl font-bold">${getTotalInvestment().toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">當前價值</p>
              <p className="text-xl font-bold">${getCurrentValue().toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">總損益</p>
              <p className={`text-xl font-bold ${getTotalProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${getTotalProfit().toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">報酬率</p>
              <p className={`text-xl font-bold ${getTotalProfitPercentage() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {getTotalProfitPercentage().toFixed(2)}%
              </p>
            </div>
          </div>

          {/* 投資組合詳情 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    股票
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    數量
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    買入價
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    當前價
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    損益
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolio.map((stock) => {
                  const profit = calculateProfit(stock);
                  const profitPercentage = calculateProfitPercentage(stock);
                  
                  return (
                    <tr key={stock.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {stock.stockSymbol}
                            </div>
                            <div className="text-sm text-gray-500">
                              {stock.stockName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stock.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${stock.purchasePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${stock.currentPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${profit.toFixed(2)}
                        </div>
                        <div className={`text-xs ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profitPercentage.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => removeFromPortfolio(stock.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
