import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/contexts/StoreContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import StoreAuthSync from "@/components/StoreAuthSync";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Inventra",
  description: "Logistics & Innovation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0f1117] text-white`}>
        <SettingsProvider>
          <StoreProvider>
            <AuthProvider>
              <StoreAuthSync />
              {children}
            </AuthProvider>
          </StoreProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
