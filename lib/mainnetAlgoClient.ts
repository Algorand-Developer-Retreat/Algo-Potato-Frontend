import { AlgorandClient, Config } from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import { ClientManager } from '@algorandfoundation/algokit-utils/types/client-manager';

Config.configure({
  logger: Config.getLogger(true),
});

const currentNetwork: 'testnet' | 'mainnet' = 'mainnet';

export const indexer = ClientManager.getIndexerClient(
  ClientManager.getAlgoNodeConfig(currentNetwork, 'indexer')
);

export const algod = ClientManager.getAlgodClient(
  ClientManager.getAlgoNodeConfig(currentNetwork, 'algod')
);

export const kmd: algosdk.Kmd | undefined = ClientManager.getKmdClient({
  server: 'http://localhost',
  port: '4002',
  token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
});

export const algorandClient = AlgorandClient.fromClients({
  algod,
  indexer,
  kmd,
});
