import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhereBox — Every package. One place.",
  description: "Universal package tracking and delivery management across Amazon, Flipkart, Myntra, Delhivery, Blue Dart, DTDC, India Post, and global couriers.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WhereBox",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased scroll-smooth">
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-indigo-500 selection:text-white pb-20 md:pb-0">
        {children}
      </body>
    </html>
  );
}
