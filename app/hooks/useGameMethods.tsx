import { useWallet } from "@txnlab/use-wallet-react";
import { TransactionSignerAccount } from "@algorandfoundation/algokit-utils/types/account";
import algosdk from "algosdk";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import * as algokit from "@algorandfoundation/algokit-utils";

import { GameMakerFactory } from "../../clients/GameMakerClient";
import { TossUpFactory } from "../../clients/TossUpClient";
import { algorandClient } from "@/lib/algoClient";

import { useState } from "react";

type GameInfo = {
  id: bigint;
  owner?: string;
  amount?: AlgoAmount;
};

const useGameMethods = () => {
  const { transactionSigner, activeAddress } = useWallet();
  const [openGames, setOpenGames] = useState<GameInfo[]>([]);
  const [gameBookState, setGameBookState] = useState<{ ownerWins: number; playerWins: number } | undefined>();

  const connectedWalletSignerAcc: TransactionSignerAccount = {
    addr: activeAddress!,
    signer: transactionSigner,
  };

  const getGameClient = async () => {
    algokit.Config.configure({ populateAppCallResources: true });

    const appId = BigInt(process.env.NEXT_PUBLIC_APP_ID!);

    const gameMakerFactory = algorandClient.client.getTypedAppFactory(GameMakerFactory, {
      defaultSender: connectedWalletSignerAcc.addr,
      defaultSigner: connectedWalletSignerAcc.signer,
    });

    const gameClient = gameMakerFactory.getAppClientById({
      appId,
    });

    return gameClient;
  };

  const getGameBookState = async () => {
    const gameBookClient = await getGameClient();
    const globalState = await gameBookClient.state.global.getAll();

    setGameBookState({
      ownerWins: Number(globalState.ownerWins ?? 0),
      playerWins: Number(globalState.playerWins ?? 0),
    });

    return globalState;
  };

  const getGameState = async (appId: bigint) => {
    algokit.Config.configure({ populateAppCallResources: true });

    // const appId = BigInt(736353239);

    const tossUpFactory = algorandClient.client.getTypedAppFactory(TossUpFactory);

    const gameClient = tossUpFactory.getAppClientById({
      appId,
    });

    const globalState = await gameClient.state.global.getAll();

    return { ...globalState, id: appId };
  };

  const getOpenGames = async () => {
    const gameClient = await getGameClient();
    const createdApps = (await algorandClient.account.getInformation(gameClient.appAddress)).createdApps!;
    console.log(createdApps);

    const appsGlobalState = await Promise.all(
      createdApps.map(async (app) => {
        const state = await getGameState(BigInt(app.id));
        return {
          ...state,
          amount: state.amount ? AlgoAmount.MicroAlgos(state.amount) : undefined,
        };
      })
    );
    setOpenGames(appsGlobalState as GameInfo[]);
    console.log(appsGlobalState);

    setOpenGames(appsGlobalState!);

    return appsGlobalState;
  };

  const registerGame = async (amount: number) => {
    const gameClient = await getGameClient();
    const registerPayment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: connectedWalletSignerAcc.addr,
      to: gameClient.appAddress,
      amount: amount,
      suggestedParams: await algorandClient.getSuggestedParams(),
    });

    const registerResponse = await gameClient.send.register({
      args: {
        payment: registerPayment,
      },
      staticFee: algokit.microAlgos(5_000),
    });

    console.log(registerResponse.return!);
  };

  const playGame = async (amount: bigint, appId: bigint) => {
    const gameClient = await getGameClient();
    const params = await algorandClient.getSuggestedParams();

    const playPayment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: connectedWalletSignerAcc.addr,
      to: gameClient.appAddress,
      amount: amount,
      suggestedParams: params,
    });
    const playResponse = await gameClient.send.play({
      args: {
        payment: playPayment,
        appId: appId,
      },
      staticFee: algokit.microAlgos(6_000),
    });

    console.log(playResponse.return!);
  };

  return {
    registerGame,
    getGameClient,
    getOpenGames,
    openGames,
    playGame,
    getGameBookState,
    gameBookState,
  };
};

export default useGameMethods;
