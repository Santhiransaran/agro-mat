import type { Metadata } from "next";

import "./globals.css";

import Sidebar from "../components/layout/Sidebar";
export const metadata: Metadata = {
  title: "AgroSense",
  description:
    "IoT Smart Soil Monitoring and Fertilizer Recommendation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Sidebar />

        <main className="min-h-screen lg:ml-64">
          {children}
        </main>
      </body>
    </html>
  );
}