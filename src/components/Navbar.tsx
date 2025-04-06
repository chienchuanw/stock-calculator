"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faStar, faHome } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-8 shadow-sm">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-800">
            <FontAwesomeIcon icon={faChartLine} className="text-blue-600" />
            <span>股票計算器</span>
          </Link>
          
          <div className="flex space-x-1">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/" 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHome} />
                <span>首頁</span>
              </div>
            </Link>
            
            <Link 
              href="/stocks" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/stocks" || pathname.startsWith("/stocks/") 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} />
                <span>股票列表</span>
              </div>
            </Link>
            
            <Link 
              href="/watchlist" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/watchlist" 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                <span>觀測名單</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
