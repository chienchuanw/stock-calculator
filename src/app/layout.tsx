import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ReduxProvider } from "@/providers/ReduxProvider";

// Font Awesome 配置
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "../lib/fontawesome";

// 避免 Font Awesome 圖示在頁面加載時閃爍
config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "股票計算器 - 追蹤台股最新資訊",
  description: "一個簡單易用的台股資訊追蹤和計算工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <Navbar />
          <main className="max-w-full">{children}</main>
        </ReduxProvider>
      </body>
    </html>
  );
}
