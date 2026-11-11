"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import { setupWalletSelector, actionCreators } from "@near-wallet-selector/core";
import { setupModal, type WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupSender } from "@near-wallet-selector/sender";
import { utils } from "near-api-js";
import { NEAR_CONFIG } from "@/lib/near/config";

interface NearWalletContextType {
  selector: WalletSelector | null;
  modal: WalletSelectorModal | null;
  accounts: Array<AccountState>;
  accountId: string | null;
  isConnected: boolean;
  balance: string;
  networkId: string;
  connect: () => void;
  disconnect: () => Promise<void>;
  sendNearPayment: (recipient: string, amount: string) => Promise<string>;
  refreshBalance: () => Promise<void>;
  isConnecting: boolean;
  isFetchingBalance: boolean;
}

const NearWalletContext = createContext<NearWalletContextType>({
  selector: null,
  modal: null,
  accounts: [],
  accountId: null,
  isConnected: false,
  balance: "0.00",
  networkId: NEAR_CONFIG.networkId,
  connect: () => {},
  disconnect: async () => {},
  sendNearPayment: async () => "",
  refreshBalance: async () => {},
  isConnecting: false,
  isFetchingBalance: false,
});

export function NearWalletProvider({ children }: { children: React.ReactNode }) {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState("0.00");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

  // Initialize official NEAR Wallet Selector with multi-wallet support
  useEffect(() => {
    let isMounted = true;

    async function initWalletSelector() {
      try {
        const _selector = await setupWalletSelector({
          network: "testnet",
          modules: [
            setupMyNearWallet(),
            setupHereWallet(),
            setupMeteorWallet(),
            setupNightly(),
            setupSender(),
          ],
        });

        const _modal = setupModal(_selector, {
          contractId: "paysure.testnet",
          description: "Connect your NEAR wallet to manage institutional invoices, guardrails & Confirmation of Payee.",
        });

        if (!isMounted) return;

        const state = _selector.store.getState();
        setSelector(_selector);
        setModal(_modal);
        setAccounts(state.accounts);

        // Find active account
        const active = state.accounts.find((a) => a.active) || state.accounts[0];
        if (active) {
          setAccountId(active.accountId);
        }

        // Subscribe to wallet/account state changes
        _selector.store.observable.subscribe((nextState) => {
          if (!isMounted) return;
          setAccounts(nextState.accounts);
          const currentActive = nextState.accounts.find((a) => a.active) || nextState.accounts[0];
          setAccountId(currentActive ? currentActive.accountId : null);
        });
      } catch (err) {
        console.error("NEAR Wallet Selector initialization error:", err);
      }
    }

    initWalletSelector();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!accountId) return;
    setIsFetchingBalance(true);
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
            account_id: accountId,
          },
        }),
      });
      const data = await res.json();
      if (data.result?.amount) {
        const formatted = parseFloat(utils.format.formatNearAmount(data.result.amount)).toFixed(2);
        setBalance(formatted);
      }
    } catch (err) {
      console.error("Live balance fetch error:", err);
    } finally {
      setIsFetchingBalance(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (accountId) {
      refreshBalance();
    }
  }, [accountId, refreshBalance]);

  const connect = useCallback(() => {
    if (modal) {
      modal.show();
    }
  }, [modal]);

  const disconnect = useCallback(async () => {
    if (!selector) return;
    try {
      const wallet = await selector.wallet();
      await wallet.signOut();
      setAccountId(null);
      setBalance("0.00");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  }, [selector]);

  // Execute live on-chain payment via the connected wallet
  const sendNearPayment = useCallback(
    async (recipient: string, amount: string): Promise<string> => {
      if (!selector) throw new Error("NEAR Wallet Selector not initialized.");
      const wallet = await selector.wallet();
      const depositYocto = utils.format.parseNearAmount(amount) || "0";

      const outcome = await wallet.signAndSendTransaction({
        receiverId: recipient,
        actions: [
          actionCreators.transfer(BigInt(depositYocto)),
        ],
      });

      let txHash = "";
      if (typeof outcome === "string") {
        txHash = outcome;
      } else if (outcome && typeof outcome === "object") {
        txHash =
          (outcome as any).transaction?.hash ||
          (outcome as any).transaction_outcome?.id ||
          "";
      }

      await refreshBalance();
      return txHash;
    },
    [selector, refreshBalance]
  );

  return (
    <NearWalletContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
        isConnected: !!accountId,
        balance,
        networkId: NEAR_CONFIG.networkId,
        connect,
        disconnect,
        sendNearPayment,
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
