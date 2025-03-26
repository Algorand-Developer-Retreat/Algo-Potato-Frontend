"use client";
import { NetworkId, WalletId, WalletManager, WalletProvider } from "@txnlab/use-wallet-react";

const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.EXODUS,
    // {
    //   id: WalletId.WALLETCONNECT,
    // generate ID for companyPro
    // options: { projectId: process.env.NEXT_PUBLIC_WC2_PROJECT_ID || "" },
    // },
    {
      id: WalletId.LUTE,
      options: { siteName: "CompanyPro" },
    },
  ],
  network: (process.env.NEXT_PUBLIC_ALGOD_NETWORK as NetworkId) || "testnet",
});

export default function WalletProviderClient({ children }: { children: React.ReactNode }) {
  return <WalletProvider manager={walletManager}>{children}</WalletProvider>;
}
