import { useWallet } from '@txnlab/use-wallet-react';
import { useState } from 'react';

import { algorandClient as testnetClient } from '@/lib/testnetAlgoClient';
import { algorandClient as mainnetClient } from '@/lib/mainnetAlgoClient';

export type OpenGameState = {
  player_1: string;
  player_2: string;
  player_1Round: bigint;
  player_2Round: bigint;
  vrfRound: bigint;
  asset: bigint;
  assetAmount: bigint;
  counter: bigint;
};

const useAlgorand = () => {
  const [currentRound, setCurrentRound] = useState(BigInt(0));
  const { activeAddress } = useWallet();
  const [accountAssets, setAccountAssets] = useState<
    { unitName?: string; assetName?: string; assetId: bigint }[]
  >([]);

  const getCurrentRound = async (network: 'testnet' | 'mainnet') => {
    const clientToUse = network === 'testnet' ? testnetClient : mainnetClient;

    try {
      const syncRound = (await clientToUse.client.algod.status().do())[
        'lastRound'
      ];
      console.log(syncRound);
      setCurrentRound(syncRound);
      return syncRound;
    } catch (error) {
      console.error('Error fetching current round:', error);
      return currentRound;
    }
  };

  const getAccountAssets = async (network: 'testnet' | 'mainnet') => {
    const clientToUse = network === 'testnet' ? testnetClient : mainnetClient;

    if (activeAddress) {
      const accountAssetsPromise = (
        await clientToUse.account.getInformation(activeAddress)
      ).assets
        ?.filter((asset) => {
          if (asset.amount > 0) {
            return asset;
          }
        })
        .map((asset) => clientToUse.asset.getById(asset.assetId));

      const accountAssets = (await Promise.all(accountAssetsPromise!)).map(
        (asset) => {
          const { unitName, assetName, assetId } = asset;
          return { unitName, assetName, assetId };
        }
      );

      setAccountAssets(accountAssets);

      console.log(accountAssets);
    }
  };

  const getAlgorandClient = (network: 'testnet' | 'mainnet') => {
    return network === 'testnet' ? testnetClient : mainnetClient;
  };

  return {
    currentRound,
    getCurrentRound,
    getAccountAssets,
    accountAssets,
    getAlgorandClient,
  };
};

export default useAlgorand;
