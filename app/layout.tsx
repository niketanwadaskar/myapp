import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PrivateRoute from "@/components/coustom-compoent/PrivateRoute";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TweetX-Co",
  description: "Created by Niketan Wadaskar for study purpose",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="bg-white">
          
          <PrivateRoute>{children}</PrivateRoute>
        </div>
      </body>
    </html>
  );
}

