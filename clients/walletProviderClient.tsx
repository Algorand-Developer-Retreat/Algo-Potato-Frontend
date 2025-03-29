'use client';
import {
  // NetworkId,
  WalletId,
  WalletManager,
  WalletProvider,
} from '@txnlab/use-wallet-react';

const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.EXODUS,
    {
      id: WalletId.LUTE,
      options: { siteName: 'Algo Potato' },
    },
  ],
  // networks: (process.env.NEXT_PUBLIC_ALGOD_NETWORK as NetworkId) || 'testnet',
});

export default function WalletProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletProvider manager={walletManager}>{children}</WalletProvider>;
}
