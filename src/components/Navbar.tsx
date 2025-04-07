"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faStar, faHome } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-800">
            <FontAwesomeIcon icon={faChartLine} className="text-blue-600" />
            <span className="hidden sm:inline">股票計算器</span>
          </Link>
          
          <div className="flex space-x-1 overflow-x-auto pb-1 sm:pb-0">
            <Link 
              href="/" 
              className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === "/" 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <FontAwesomeIcon icon={faHome} />
                <span className="hidden sm:inline">首頁</span>
              </div>
            </Link>
            
            <Link 
              href="/stocks" 
              className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === "/stocks" || pathname.startsWith("/stocks/") 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <FontAwesomeIcon icon={faChartLine} />
                <span className="hidden sm:inline">股票列表</span>
              </div>
            </Link>
            
            <Link 
              href="/watchlist" 
              className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === "/watchlist" 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                <span className="hidden sm:inline">觀測名單</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
