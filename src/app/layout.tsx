import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { FloatingCopilot } from "@/components/assistant/FloatingCopilot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PaySure AI — Autonomous Invoicing & Confirmation of Payee on NEAR Protocol",
  description:
    "AI-powered payment verification, Confirmation of Payee for named accounts, and intelligent invoice management on NEAR Protocol.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#070B14] text-slate-100 antialiased`}>
        <Web3Provider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingCopilot />
        </Web3Provider>
      </body>
    </html>
  );
}

