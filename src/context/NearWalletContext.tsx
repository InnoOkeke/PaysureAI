"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { NEAR_CONFIG, isValidNearAccountId } from "@/lib/near/config";

interface NearWalletContextType {
  accountId: string | null;
  isConnected: boolean;
  balance: string;
  networkId: string;
  connect: (customAccountId?: string) => void;
  connectMyNearWallet: () => void;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  isConnecting: boolean;
  isFetchingBalance: boolean;
}

const NearWalletContext = createContext<NearWalletContextType>({
  accountId: null,
  isConnected: false,
  balance: "0.00",
  networkId: NEAR_CONFIG.networkId,
  connect: () => {},
  connectMyNearWallet: () => {},
  disconnect: () => {},
  refreshBalance: async () => {},
  isConnecting: false,
  isFetchingBalance: false,
});

async function queryLiveNearBalance(account: string): Promise<string> {
  try {
    const res = await fetch(NEAR_CONFIG.nodeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "live-near-balance",
        method: "query",
        params: {
          request_type: "view_account",
          finality: "final",
          account_id: account,
        },
      }),
    });
    const data = await res.json();
    if (data.result?.amount) {
      // 1 NEAR = 10^24 yoctoNEAR
      const YOCTO_PER_NEAR = BigInt("1000000000000000000000000");
      const YOCTO_CENT = BigInt("10000000000000000000000");
      const yocto = BigInt(data.result.amount);
      const whole = yocto / YOCTO_PER_NEAR;
      const frac = (yocto % YOCTO_PER_NEAR) / YOCTO_CENT;
      return `${whole}.${frac.toString().padStart(2, "0")}`;
    }
    return "0.00";
  } catch (err) {
    console.error("Live NEAR balance fetch error:", err);
    return "0.00";
  }
}

export function NearWalletProvider({ children }: { children: React.ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState("0.00");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

  // Initialize session & check for MyNearWallet redirect callback (?account_id=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const returnedAccount = urlParams.get("account_id");

      if (returnedAccount && isValidNearAccountId(returnedAccount)) {
        setAccountId(returnedAccount);
        localStorage.setItem("paysure_near_account", returnedAccount);
        // Clean URL params without page reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        return;
      }

      // Restore from localStorage
      const saved = localStorage.getItem("paysure_near_account");
      if (saved && isValidNearAccountId(saved)) {
        setAccountId(saved);
      }
    }
  }, []);

  // Fetch live balance on account change
  useEffect(() => {
    if (accountId) {
      refreshBalance();
    }
  }, [accountId]);

  const refreshBalance = async () => {
    if (!accountId) return;
    setIsFetchingBalance(true);
    try {
      const liveBal = await queryLiveNearBalance(accountId);
      setBalance(liveBal);
    } finally {
      setIsFetchingBalance(false);
    }
  };

  const connect = async (customAccountId?: string) => {
    if (!customAccountId) {
      connectMyNearWallet();
      return;
    }
    const target = customAccountId.trim();
    if (!isValidNearAccountId(target)) {
      alert("Invalid NEAR account format. Example: alice.testnet");
      return;
    }
    setIsConnecting(true);
    try {
      // Query real on-chain account data
      const res = await fetch(NEAR_CONFIG.nodeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "verify-exists",
          method: "query",
          params: {
            request_type: "view_account",
            finality: "final",
            account_id: target,
          },
        }),
      });
      const d = await res.json();
      if (d.error) {
        alert(`Account '${target}' does not exist on NEAR Testnet! Please use an active testnet account or connect via MyNearWallet.`);
        setIsConnecting(false);
        return;
      }
      const liveBal = await queryLiveNearBalance(target);
      setAccountId(target);
      localStorage.setItem("paysure_near_account", target);
      setBalance(liveBal);
    } catch (e: any) {
      alert(`Network error querying NEAR Testnet: ${e.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectMyNearWallet = () => {
    if (typeof window === "undefined") return;
    const currentUrl = window.location.href;
    const loginUrl = `${NEAR_CONFIG.walletUrl}/login/?success_url=${encodeURIComponent(
      currentUrl
    )}&failure_url=${encodeURIComponent(currentUrl)}`;
    window.location.href = loginUrl;
  };

  const disconnect = () => {
    setAccountId(null);
    setBalance("0.00");
    localStorage.removeItem("paysure_near_account");
  };

  return (
    <NearWalletContext.Provider
      value={{
        accountId,
        isConnected: !!accountId,
        balance,
        networkId: NEAR_CONFIG.networkId,
        connect,
        connectMyNearWallet,
        disconnect,
        refreshBalance,
        isConnecting,
        isFetchingBalance,
      }}
    >
      {children}
    </NearWalletContext.Provider>
  );
}

export function useNearWallet() {
  return useContext(NearWalletContext);
}
