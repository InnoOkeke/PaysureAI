import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@near-wallet-selector/modal-ui/styles.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/ui/ToastProvider";
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-accent/20 selection:text-ink`}>
        <ThemeProvider>
          <ToastProvider>
            <Web3Provider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <FloatingCopilot />
            </Web3Provider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
