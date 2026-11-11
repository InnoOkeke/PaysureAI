"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { NEAR_CONFIG, isValidNearAccountId } from "@/lib/near/config";

interface NearWalletContextType {
  accountId: string | null;
  isConnected: boolean;
  balance: string;
  networkId: string;
  connect: (customAccountId?: string) => void;
  disconnect: () => void;
  isConnecting: boolean;
}

const NearWalletContext = createContext<NearWalletContextType>({
  accountId: null,
  isConnected: false,
  balance: "0.00",
  networkId: NEAR_CONFIG.networkId,
  connect: () => {},
  disconnect: () => {},
  isConnecting: false,
});

export function NearWalletProvider({ children }: { children: React.ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState("124.50"); // Sample testnet NEAR balance
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Restore session from localStorage if available
    const saved = localStorage.getItem("paysure_near_account");
    if (saved && isValidNearAccountId(saved)) {
      setAccountId(saved);
    }
  }, []);

  const connect = (customAccountId?: string) => {
    setIsConnecting(true);
    setTimeout(() => {
      // Default to user's testnet account or custom prompt
      const target = customAccountId || "paysure-treasury.testnet";
      setAccountId(target);
      localStorage.setItem("paysure_near_account", target);
      setBalance("148.82");
      setIsConnecting(false);
    }, 400);
  };

  const disconnect = () => {
    setAccountId(null);
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
        disconnect,
        isConnecting,
      }}
    >
      {children}
    </NearWalletContext.Provider>
  );
}

export function useNearWallet() {
  return useContext(NearWalletContext);
}

