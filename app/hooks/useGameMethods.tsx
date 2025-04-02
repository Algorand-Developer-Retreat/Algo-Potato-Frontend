import { useWallet } from '@txnlab/use-wallet-react';

import { encodeAddress } from 'algosdk';
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount';
import * as algokit from '@algorandfoundation/algokit-utils';
import { useState } from 'react';

import { algorandClient as testnetClient } from '@/lib/testnetAlgoClient';
import { algorandClient as mainnetClient } from '@/lib/mainnetAlgoClient';
import { AlgoPotatoFactory } from '../../clients/AlgoPotato';

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

const useGameMethods = () => {
  const { transactionSigner, activeAddress } = useWallet();
  const [appId, setAppId] = useState<bigint | null>(null);
  const [openGames, setOpenGames] = useState<OpenGameState[]>([]);

  const createAndFund = async (network: 'testnet' | 'mainnet') => {
    console.log('network', network);
    console.log('hit create');
    const factory = new AlgoPotatoFactory({
      algorand: network === 'testnet' ? testnetClient : mainnetClient,
      defaultSender: activeAddress!,
      defaultSigner: transactionSigner,
    });

    const { appClient } = await factory.send.create.bare();

    if (network === 'testnet') {
      await testnetClient.send.payment({
        sender: activeAddress!,
        signer: transactionSigner,
        receiver: appClient.appAddress,
        amount: AlgoAmount.Algo(0.1),
      });
    } else {
      await mainnetClient.send.payment({
        sender: activeAddress!,
        signer: transactionSigner,
        receiver: appClient.appAddress,
        amount: AlgoAmount.Algo(0.1),
      });
    }

    setAppId(appClient.appId); // Store the appId for future reference
  };

  const getAppClient = async (network: 'testnet' | 'mainnet') => {
    algokit.Config.configure({ populateAppCallResources: true });

    const clientToUse = network === 'testnet' ? testnetClient : mainnetClient;

    console.log('clientToUse', network);

    const factory = new AlgoPotatoFactory({
      algorand: clientToUse,
      defaultSender: activeAddress!,
      defaultSigner: transactionSigner,
    });

    const appIdToUse =
      network === 'testnet'
        ? BigInt(process.env.NEXT_PUBLIC_TESTNET_APP_ID!)
        : BigInt(process.env.NEXT_PUBLIC_MAINNET_APP_ID!);

    console.log('appIdToUse', appIdToUse);

    return factory.getAppClientById({
      appId: appIdToUse,
    });
  };

  const createGame = async (amount: number, network: 'testnet' | 'mainnet') => {
    const clientToUse = network === 'testnet' ? testnetClient : mainnetClient;
    const algoPotatoClient = await getAppClient(network);
    const appAddress = algoPotatoClient.appAddress;

    const assetDeposit = await clientToUse.createTransaction.payment({
      sender: activeAddress!,
      signer: transactionSigner,
      receiver: appAddress,
      amount: AlgoAmount.MicroAlgo(amount),
    });

    const mbrFee = clientToUse.createTransaction.payment({
      sender: activeAddress!,
      signer: transactionSigner,
      receiver: appAddress,
      amount: AlgoAmount.MicroAlgo(60_100),
    });

    const txnResponse = await algoPotatoClient.send.createGame({
      args: {
        assetDeposit: assetDeposit,
        mbrFee: mbrFee,
      },
    });

    const txIds = txnResponse.txIds;
    const abiResults = txnResponse.return;
    // 736531012

    console.log(`Tx IDs: ${txIds}`);
    console.log(`ABI Results: ${abiResults}`);
  };

  const joinAlgoGame = async (
    openGameState: OpenGameState,
    network: 'testnet' | 'mainnet'
  ) => {
    const clientToUse = network === 'testnet' ? testnetClient : mainnetClient;
    const algoPotatoClient = await getAppClient(network);
    const appAddress = algoPotatoClient.appAddress;

    const assetDeposit = clientToUse.createTransaction.payment({
      sender: activeAddress!,
      signer: transactionSigner,
      receiver: appAddress,
      amount: AlgoAmount.MicroAlgo(openGameState.assetAmount),
    });

    const primeResponse = await algoPotatoClient.send.primeGameVrf({
      args: {
        gameBoxName: {
          player_1: openGameState.player_1,
          counter: openGameState.counter,
        },
        assetDeposit: assetDeposit,
      },
    });

    const primeTxIds = primeResponse.txIds;
    const primeTxResults = primeResponse.return;

    console.table({ primeTxResults, primeTxIds });
  };

  const joinAssetGame = async (
    openGameState: OpenGameState,
    network: 'testnet' | 'mainnet'
  ) => {
    const clientToUse = network === 'testnet' ? testnetClient : mainnetClient;
    const algoPotatoClient = await getAppClient(network);
    const appAddress = algoPotatoClient.appAddress;

    const assetDeposit = clientToUse.createTransaction.assetTransfer({
      sender: activeAddress!,
      signer: transactionSigner,
      receiver: appAddress,
      assetId: BigInt(openGameState.asset),
      amount: openGameState.assetAmount,
    });
    const primeResponse = await algoPotatoClient.send.primeGameVrf({
      args: {
        gameBoxName: {
          player_1: openGameState.player_1,
          counter: openGameState.counter,
        },
        assetDeposit: assetDeposit,
      },
    });

    const primeTxIds = primeResponse.txIds;
    const primeTxResults = primeResponse.return;
    console.table({ primeTxResults, primeTxIds });
  };

  const playGame = async (
    openGameState: OpenGameState,
    network: 'testnet' | 'mainnet'
  ) => {
    const algoPotatoClient = await getAppClient(network);
    const playTxnResponse = await algoPotatoClient.send.playGame({
      args: {
        gameBoxName: {
          player_1: openGameState.player_1,
          counter: openGameState.counter,
        },
      },
      populateAppCallResources: true,
      coverAppCallInnerTransactionFees: true,
      maxFee: AlgoAmount.MicroAlgo(260_000),
    });

    const playTxIds = playTxnResponse.txIds;
    const playTxResults = playTxnResponse.return;

    console.table({ playTxIds, playTxResults });
  };

  const createAssetGame = async (
    assetId: bigint,
    amount: bigint,
    network: 'testnet' | 'mainnet'
  ) => {
    const clientToUse = network === 'testnet' ? testnetClient : mainnetClient;
    const algoPotatoClient = await getAppClient(network);

    const appAddress = algoPotatoClient.appAddress;

    const assetDeposit = clientToUse.createTransaction.assetTransfer({
      sender: activeAddress!,
      signer: transactionSigner,
      receiver: appAddress,
      assetId,
      amount,
    });

    const mbrFee = clientToUse.createTransaction.payment({
      sender: activeAddress!,
      signer: transactionSigner,
      receiver: appAddress,
      amount: AlgoAmount.MicroAlgo(60_100),
    });

    const newAppGroupTx = algoPotatoClient.newGroup();

    let contractOptedIntoAsset = true;

    const accountInformation = await clientToUse.client.algod
      .accountAssetInformation(appAddress, Number(assetId))
      .do()
      .catch(() => (contractOptedIntoAsset = false));

    console.log(accountInformation);

    console.log(contractOptedIntoAsset);

    if (!contractOptedIntoAsset) {
      const optInFee = clientToUse.createTransaction.payment({
        sender: activeAddress!,
        signer: transactionSigner,
        receiver: appAddress,
        amount: AlgoAmount.Algo(0.1),
      });

      newAppGroupTx.assetOptIn({
        args: { asset: assetId, mbrPayment: optInFee },
        maxFee: AlgoAmount.Algo(0.01),
      });
    }

    newAppGroupTx.createGame({
      args: { assetDeposit: assetDeposit, mbrFee },
      maxFee: AlgoAmount.Algo(0.01),
    });

    const txnResponse = await newAppGroupTx.send({
      populateAppCallResources: true,
      coverAppCallInnerTransactionFees: true,
      // **NOTE LEO has 'cover_app_call_inner_transaction_fees': True on the 🐍 scripts but I don't see that option for the TS library
      // https://github.com/atsoc1993/Hot-Potato-Contract-AVM/blob/main/2b_create_game_asset.py#L69
    });

    const txIds = txnResponse.txIds;
    const abiResults = txnResponse.returns;

    console.log(`Tx IDs: ${txIds}`);
    console.log(`ABI Results: ${abiResults[0]}`);
  };

  const cancelGame = async (
    openGameState: OpenGameState,
    network: 'testnet' | 'mainnet'
  ) => {
    const algoPotatoClient = await getAppClient(network);

    const txnResponse = await algoPotatoClient.send.cancelGame({
      args: {
        gameBoxName: {
          player_1: openGameState.player_1,
          counter: openGameState.counter,
        },
      },
      maxFee: AlgoAmount.MicroAlgo(2_000),
      populateAppCallResources: true,
      coverAppCallInnerTransactionFees: true,
    });

    const txnIds = txnResponse.txIds;
    const abiResult = txnResponse.return;

    console.table({ txnIds, abiResult });
  };

  const getOpenGames = async (network: 'testnet' | 'mainnet') => {
    const algoPotatoClient = await getAppClient(network);
    const _openGames: OpenGameState[] = [];

    (await algoPotatoClient.state.box.gameBox.getMap()).forEach(
      (value, key) => {
        console.log('hit');
        const {
          player_1,
          player_2,
          player_1Round,
          player_2Round,
          vrfRound,
          asset,
          assetAmount,
        } = value;

        const { counter } = key;

        console.log(`
          BoxKey: ${key.counter}-${key.player_1}
          Player 1: ${player_1}
          Player 2: ${
            encodeAddress(new Uint8Array(32)) !== player_2 ? player_2 : null
          }
          Player 1 Round: ${player_1Round}
          Player 2 Round: ${player_2Round !== BigInt(0) ? player_2Round : null}
          VRF Round: ${vrfRound === BigInt(0) ? null : vrfRound}
          Asset: ${asset === BigInt(0) ? 'Algorand' : asset}
          Amount: ${assetAmount.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}`);

        _openGames.push({
          player_1,
          player_2,
          player_1Round,
          player_2Round,
          vrfRound,
          asset,
          assetAmount,
          counter,
        });
      }
    );
    _openGames.sort(
      (a, b) => Number(a.player_1Round) - Number(b.player_1Round)
    );
    setOpenGames(_openGames);
  };

  return {
    createAndFund,
    appId,
    createGame,
    createAssetGame,
    getOpenGames,
    openGames,
    joinAlgoGame,
    playGame,
    joinAssetGame,
    cancelGame,
  };
};

export default useGameMethods;
