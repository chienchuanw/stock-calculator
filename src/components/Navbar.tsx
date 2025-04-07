"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faStar, faHome, faWallet, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutUser } from "@/redux/authSlice";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/");
  };
  
  // 導航項目點擊處理
  const handleNavigation = (path: string, needAuth: boolean = false) => {
    if (needAuth && !isAuthenticated) {
      // 如果需要登入但未登入，直接跳到登入頁面
      router.push('/#login');
    } else {
      // 否則正常導航
      router.push(path);
    }
  };
  
  return (
    <nav className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-800">
            <FontAwesomeIcon icon={faChartLine} className="text-blue-600" />
            <span className="hidden sm:inline">股票計算器</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1 overflow-x-auto pb-1 sm:pb-0">
              <div
                onClick={() => handleNavigation('/', false)}
                className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  pathname === "/" 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <FontAwesomeIcon icon={faHome} />
                  <span className="hidden sm:inline">首頁</span>
                </div>
              </div>
              
              <div
                onClick={() => handleNavigation('/stocks', false)}
                className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  pathname === "/stocks" || pathname.startsWith("/stocks/") 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <FontAwesomeIcon icon={faChartLine} />
                  <span className="hidden sm:inline">股票列表</span>
                </div>
              </div>
              
              <div
                onClick={() => handleNavigation('/watchlist', true)}
                className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  pathname === "/watchlist" 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                  <span className="hidden sm:inline">觀測名單</span>
                </div>
              </div>
              
              <div
                onClick={() => handleNavigation('/portfolio', true)}
                className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  pathname === "/portfolio" 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <FontAwesomeIcon icon={faWallet} className="text-green-600" />
                  <span className="hidden sm:inline">持有股票</span>
                </div>
              </div>
            </div>
            
            {/* 用戶認證區域 */}
            <div className="ml-2 relative">
              {isAuthenticated ? (
                <div>
                  <button
                    className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-200 focus:outline-none"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <FontAwesomeIcon icon={faUser} className="text-gray-600" />
                    <span className="hidden sm:inline">{user?.username}</span>
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        登出
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/#login"
                    className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    登入
                  </Link>
                  <Link
                    href="/#register"
                    className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    註冊
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
