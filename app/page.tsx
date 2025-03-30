'use client';
import { useEffect, useState } from 'react';
import useGameMethods from '@/hooks/useGameMethods';
import { OpenGameState } from '@/hooks/useGameMethods';
import useAlgorand from './hooks/useAlgorand';
import { useWallet } from '@txnlab/use-wallet-react';

import RoundInfo from './components/ui/round-info';
export default function GameDashboard() {
  const { createGame, openGames, getOpenGames, joinAlgoGame, playGame } =
    useGameMethods();

  const { currentRound, getCurrentRound, getAccountAssets, accountAssets } =
    useAlgorand();

  const { activeAddress } = useWallet();

  const appId = process.env.NEXT_PUBLIC_APP_ID;

  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('ALGO');

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    createGame(Number(amount));
  };

  useEffect(() => {
    getOpenGames();
    getCurrentRound(); // Initial fetch

    const intervalId = setInterval(() => {
      getCurrentRound();
    }, 3000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    getAccountAssets();
  }, [activeAddress, getAccountAssets]);

  return (
    <main className='p-6 max-w-3xl mx-auto'>
      {/* Blockchain Info is now a separate component at the top of the page */}
      <div className='flex justify-end mb-4'>
        <RoundInfo appId={appId!} currentRound={currentRound} />
        <button onClick={getAccountAssets}>get info</button>
      </div>

      <div className='bg-gradient-to-b from-blue-100 to-purple-100 rounded-3xl shadow-xl overflow-hidden mb-8'>
        <div className='p-8'>
          <div className='flex items-center justify-between mb-8'>
            <h1 className='text-3xl font-bold text-gray-800'>
              Create New Game
            </h1>
          </div>

          <button
            onClick={() => getOpenGames()}
            className='px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mb-6 shadow-sm'
          >
            Refresh Games
          </button>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-4'>
              <label className='block'>
                <span className='text-gray-700 font-medium'>Select Asset</span>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-white p-3'
                >
                  {[{ assetId: 0, assetName: 'Algo' }, ...accountAssets].map(
                    (asset) => (
                      <option key={asset.assetId} value={Number(asset.assetId)}>
                        {asset.assetName} ({asset.assetId})
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className='block'>
                <span className='text-gray-700 font-medium'>Amount</span>
                <div className='mt-1 relative rounded-lg shadow-sm'>
                  <input
                    type='number'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='Enter amount'
                    min='0'
                    step='0.01'
                    className='block w-full rounded-lg border-gray-300 pr-12 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-3'
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                    <span className='text-gray-500 sm:text-sm'>
                      {selectedAsset}
                    </span>
                  </div>
                </div>
              </label>
            </div>

            <div className='pt-4'>
              <button
                type='submit'
                disabled={!amount}
                className='w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Create Game
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Open Games Section */}
      <div className='bg-gradient-to-b from-blue-100 to-purple-100 rounded-3xl shadow-xl overflow-hidden'>
        <div className='p-8'>
          <h2 className='text-2xl font-bold text-gray-800 mb-6'>Open Games</h2>

          {openGames.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              No open games available
            </div>
          ) : (
            <div className='space-y-4'>
              {openGames.map((game: OpenGameState, index: number) => (
                <div
                  key={index}
                  className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <div className='mb-2'>
                        <span className='text-gray-500 font-medium'>
                          BoxName:
                        </span>
                        <span className='ml-2 font-mono break-all'>
                          {game.counter} - {game.player_1}
                        </span>
                        <span className='text-gray-500 font-medium'>
                          Player 1:
                        </span>
                        <span className='ml-2 font-mono break-all'>
                          {game.player_1}
                        </span>
                      </div>
                      <div className='mb-2'>
                        <span className='text-gray-500 font-medium'>
                          Player 2:
                        </span>
                        <span className='ml-2 font-mono break-all'>
                          {game.player_2}
                        </span>
                      </div>
                      <div className='mb-2'>
                        <span className='text-gray-500 font-medium'>
                          Player 1 Round:
                        </span>
                        <span className='ml-2 font-mono'>
                          {game.player_1Round.toString()}
                        </span>
                      </div>
                      <div className='mb-2'>
                        <span className='text-gray-500 font-medium'>
                          Player 2 Round:
                        </span>
                        <span className='ml-2 font-mono'>
                          {game.player_2Round.toString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className='mb-2'>
                        <span className='text-gray-500 font-medium'>
                          VRF Round:
                        </span>
                        <span className='ml-2 font-mono'>
                          {game.vrfRound.toString()}
                        </span>
                      </div>
                      <div className='mb-2'>
                        <span className='text-gray-500 font-medium'>
                          Asset ID:
                        </span>
                        <span className='ml-2 font-mono'>
                          {game.asset.toString()}
                        </span>
                      </div>
                      <div className='mb-2'>
                        <span className='text-gray-500 font-medium'>
                          Asset Amount:
                        </span>
                        <span className='ml-2 font-mono'>
                          {game.assetAmount.toString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='mt-4 flex justify-end gap-3'>
                    <button
                      onClick={() => joinAlgoGame(game)} //This is where you would check if the game asset was algo or asset and call a different method depending
                      className='px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors'
                    >
                      Join Game
                    </button>
                    <button
                      onClick={() => playGame(game)}
                      className='px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors'
                    >
                      Play Game
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
