import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@near-wallet-selector/modal-ui/styles.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { FloatingCopilot } from "@/components/assistant/FloatingCopilot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PaySure — Autonomous Treasury & Counterparty Verification",
  description:
    "Cryptographic Confirmation of Payee, zero-trust invoice intelligence, and non-custodial multi-chain settlement on NEAR Protocol.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#050507] text-[#F5F5F7] antialiased selection:bg-blue-500/25 selection:text-white`}>
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

