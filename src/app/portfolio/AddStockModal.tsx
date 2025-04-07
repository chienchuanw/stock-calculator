"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";

interface Stock {
  id: string;
  stockSymbol: string;
  stockName: string;
  market: string;
}

interface AddStockModalProps {
  onClose: () => void;
  onAddSuccess: (newItem: any) => void;
}

export default function AddStockModal({ onClose, onAddSuccess }: AddStockModalProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // 載入股票清單
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch("/api/stocks");
        const data = await response.json();
        setStocks(data);
        setFilteredStocks(data);
      } catch (error) {
        console.error("獲取股票列表時發生錯誤:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStocks();
  }, []);
  
  // 當搜尋詞變更時過濾股票列表
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStocks(stocks);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = stocks.filter(
        (stock) =>
          stock.stockSymbol.toLowerCase().includes(term) ||
          stock.stockName.toLowerCase().includes(term)
      );
      setFilteredStocks(filtered);
    }
  }, [searchTerm, stocks]);
  
  // 驗證表單
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!selectedStock) {
      errors.stock = "請選擇股票";
    }
    
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      errors.quantity = "請輸入有效的股數";
    }
    
    if (!purchasePrice || isNaN(Number(purchasePrice)) || Number(purchasePrice) <= 0) {
      errors.purchasePrice = "請輸入有效的購買價格";
    }
    
    if (!purchaseDate) {
      errors.purchaseDate = "請選擇購買日期";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stockSymbol: selectedStock?.stockSymbol,
          stockName: selectedStock?.stockName,
          quantity: Number(quantity),
          purchasePrice: Number(purchasePrice),
          purchaseDate,
          notes: notes.trim() !== "" ? notes : null,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onAddSuccess(data.item);
      } else {
        setFormErrors({
          submit: data.message || "新增失敗，請稍後再試",
        });
      }
    } catch (error) {
      console.error("新增持股時發生錯誤:", error);
      setFormErrors({
        submit: "新增持股時發生錯誤，請稍後再試",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 處理點擊背景關閉 Modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // 選擇股票
  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
    setSearchTerm("");
  };
  
  return (
    <div 
      className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">新增持有股票</h2>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit}>
            {/* 股票選擇區 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                選擇股票 <span className="text-red-500">*</span>
              </label>
              
              {selectedStock ? (
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md mb-2">
                  <div>
                    <div className="font-medium text-gray-800">
                      {selectedStock.stockSymbol} - {selectedStock.stockName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedStock.market}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setSelectedStock(null)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="搜尋股票代號或名稱..."
                      className="w-full border border-gray-200 rounded-md px-3 py-2 pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                    </div>
                  </div>
                  
                  {searchTerm && (
                    <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                      {loading ? (
                        <div className="p-3 text-center text-gray-500">
                          載入中...
                        </div>
                      ) : filteredStocks.length > 0 ? (
                        filteredStocks.slice(0, 10).map((stock) => (
                          <div
                            key={stock.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => handleSelectStock(stock)}
                          >
                            <div className="font-medium text-gray-800">
                              {stock.stockSymbol} - {stock.stockName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {stock.market}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">
                          沒有找到符合的股票
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {formErrors.stock && (
                <div className="text-sm text-red-500 mt-1">{formErrors.stock}</div>
              )}
            </div>
            
            {/* 股數 */}
            <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                持有股數 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                placeholder="輸入持有股數"
                className="w-full border border-gray-200 rounded-md px-3 py-2"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
              {formErrors.quantity && (
                <div className="text-sm text-red-500 mt-1">{formErrors.quantity}</div>
              )}
            </div>
            
            {/* 購買價格 */}
            <div className="mb-4">
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
                購買價格 (元/股) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="purchasePrice"
                placeholder="輸入購買價格"
                className="w-full border border-gray-200 rounded-md px-3 py-2"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                min="0"
                step="0.01"
              />
              {formErrors.purchasePrice && (
                <div className="text-sm text-red-500 mt-1">{formErrors.purchasePrice}</div>
              )}
            </div>
            
            {/* 購買日期 */}
            <div className="mb-4">
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                購買日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="purchaseDate"
                className="w-full border border-gray-200 rounded-md px-3 py-2"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
              {formErrors.purchaseDate && (
                <div className="text-sm text-red-500 mt-1">{formErrors.purchaseDate}</div>
              )}
            </div>
            
            {/* 備註 */}
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                備註
              </label>
              <textarea
                id="notes"
                placeholder="輸入備註 (選填)"
                className="w-full border border-gray-200 rounded-md px-3 py-2 min-h-[80px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            
            {/* 提交錯誤訊息 */}
            {formErrors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {formErrors.submit}
              </div>
            )}
            
            {/* 按鈕區 */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={onClose}
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "處理中..." : "確認新增"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
