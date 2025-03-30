import { useWallet } from '@txnlab/use-wallet-react';

import { encodeAddress } from 'algosdk';
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount';
import * as algokit from '@algorandfoundation/algokit-utils';
import { useState } from 'react';

import { algorandClient } from '@/lib/algoClient';
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
  const [currentRound, setCurrentRound] = useState(BigInt(0));

  const getCurrentRound = async () => {
    try {
      const syncRound = (await algorandClient.client.algod.status().do())[
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

  const createAndFund = async () => {
    const factory = new AlgoPotatoFactory({
      algorand: algorandClient,
      defaultSender: activeAddress!,
      defaultSigner: transactionSigner,
    });

    const { appClient } = await factory.send.create.bare();

    await algorandClient.send.payment({
      sender: activeAddress!,
      signer: transactionSigner,
      receiver: appClient.appAddress,
      amount: AlgoAmount.Algo(0.1),
    });
    setAppId(appClient.appId); // Store the appId for future reference
  };

  const getAppClient = async () => {
    algokit.Config.configure({ populateAppCallResources: true });

    const factory = new AlgoPotatoFactory({
      algorand: algorandClient,
      defaultSender: activeAddress!,
      defaultSigner: transactionSigner,
    });
    const appId = BigInt(process.env.NEXT_PUBLIC_APP_ID!);

    return factory.getAppClientById({
      appId,
    });
  };

  const createGame = async (amount: number) => {
    const algoPotatoClient = await getAppClient();
    const appAddress = algoPotatoClient.appAddress;

    const assetDeposit = await algorandClient.createTransaction.payment({
      sender: activeAddress!,
      signer: transactionSigner,
      receiver: appAddress,
      amount: AlgoAmount.MicroAlgo(amount),
    });

    const mbrFee = algorandClient.createTransaction.payment({
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

  const joinAlgoGame = async (openGameState: OpenGameState) => {
    const algoPotatoClient = await getAppClient();
    const appAddress = algoPotatoClient.appAddress;

    const assetDeposit = algorandClient.createTransaction.payment({
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

  const playGame = async (openGameState: OpenGameState) => {
    const algoPotatoClient = await getAppClient();

    // const playTxnResponse = await algoPotatoClient
    //   .newGroup()
    //   .playGame({
    //     args: {
    //       gameBoxName: {
    //         player_1: openGameState.player_1,
    //         counter: openGameState.counter,
    //       },
    //     },
    //   })
    //   .send({ populateAppCallResources: true});

    const playTxnResponse = await algoPotatoClient.send.playGame({
      args: {
        gameBoxName: {
          player_1: openGameState.player_1,
          counter: openGameState.counter,
        },
      },
      populateAppCallResources: true,
      // **NOTE LEO has 'cover_app_call_inner_transaction_fees': True on the 🐍 scripts but I don't see that option for the TS library
      // https://github.com/atsoc1993/Hot-Potato-Contract-AVM/blob/main/2b_create_game_asset.py#L69
      // as a consequence maxFee calculations fail because they don't account for innerTxns forcing me to use StaticFee(aka the worst case each time)
      coverAppCallInnerTransactionFees: true,

      // staticFee: AlgoAmount.MicroAlgo(260_000),
    });

    const playTxIds = playTxnResponse.txIds;
    const playTxResults = playTxnResponse.return;

    console.table({ playTxIds, playTxResults });
  };

  const createGameAsset = async (assetId: bigint, amount: bigint) => {
    const algoPotatoClient = await getAppClient();

    const appAddress = algoPotatoClient.appAddress;

    const assetDeposit = algorandClient.createTransaction.assetTransfer({
      sender: activeAddress!,
      signer: transactionSigner,
      receiver: appAddress,
      assetId,
      amount,
    });

    const mbrFee = algorandClient.createTransaction.payment({
      sender: activeAddress!,
      signer: transactionSigner,
      receiver: appAddress,
      amount: AlgoAmount.MicroAlgo(60_100),
    });

    const newAppGroupTx = algoPotatoClient.newGroup();

    let contractOptedIntoAsset = true;

    const accountInformation = await algorandClient.client.algod
      .accountAssetInformation(appAddress, Number(assetId))
      .do()
      .catch(() => (contractOptedIntoAsset = false));

    console.log(accountInformation);

    console.log(contractOptedIntoAsset);

    if (!contractOptedIntoAsset) {
      const optInFee = algorandClient.createTransaction.payment({
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

  const getOpenGames = async () => {
    const algoPotatoClient = await getAppClient();
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
    setOpenGames(_openGames);
  };

  return {
    createAndFund,
    appId,
    createGame,
    createGameAsset,
    getOpenGames,
    openGames,
    joinAlgoGame,
    playGame,
    getCurrentRound,
    currentRound,
  };
};

export default useGameMethods;
