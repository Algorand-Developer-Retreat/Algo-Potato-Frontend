'use client';
import { useEffect, useState } from 'react';
import useGameMethods from '@/hooks/useGameMethods';
import { OpenGameState } from '@/hooks/useGameMethods';
import useAlgorand from '../hooks/useAlgorand';
import { useWallet } from '@txnlab/use-wallet-react';
import { Filter, Search, X } from 'lucide-react';

import RoundInfo from '../components/ui/round-info';
export default function GameDashboard() {
  const {
    createAndFund,
    createGame,
    openGames,
    getOpenGames,
    joinAlgoGame,
    playGame,
    createAssetGame,
    joinAssetGame,
    cancelGame,
  } = useGameMethods();

  const { currentRound, getCurrentRound, getAccountAssets, accountAssets } =
    useAlgorand();

  const { activeAddress } = useWallet();

  const appId = process.env.NEXT_PUBLIC_MAINNET_APP_ID;

  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('0');

  // Add active tab state
  const [activeTab, setActiveTab] = useState('open-games');

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filteredGames, setFilteredGames] = useState<OpenGameState[]>([]);
  const [filters, setFilters] = useState({
    player: '',
    assetId: '',
    minAmount: '',
    maxAmount: '',
    showMyGames: false,
    assetType: 'all', // 'all', 'algo', 'assets'
  });

  const disablePlayGame = (gameState: OpenGameState, currentRound: bigint) => {
    if (gameState.vrfRound === BigInt(0)) {
      return true;
    }
    if (gameState.asset === BigInt(0)) {
      return gameState.vrfRound + BigInt(15) >= currentRound ? true : false;
    }
    if (accountAssets.map((asset) => asset.assetId).includes(gameState.asset))
      return gameState.vrfRound + BigInt(15) >= currentRound ? true : false;
  };

  const disableCancelGame = (gameState: OpenGameState) => {
    if (gameState.vrfRound !== BigInt(0)) {
      return true;
    }
    if (activeAddress !== gameState.player_1) {
      return true;
    }
  };

  const disableJoinGame = (gameState: OpenGameState) => {
    if (gameState.vrfRound !== BigInt(0)) {
      return true;
    }
    if (activeAddress === gameState.player_1) {
      return true;
    }
    if (
      gameState.player_2 !==
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ'
    ) {
      return true;
    }
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (selectedAsset === '0') {
      createGame(Number(amount), 'mainnet');
    } else {
      createAssetGame(BigInt(selectedAsset), BigInt(amount), 'mainnet');
    }
  };

  const handleFilterChange = (event: {
    target: { name: string; value: string; type: string; checked?: boolean };
  }) => {
    const { name, value, type, checked } = event.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const clearFilters = () => {
    setFilters({
      player: '',
      assetId: '',
      minAmount: '',
      maxAmount: '',
      showMyGames: false,
      assetType: 'all',
    });
  };

  // Apply filters to games
  useEffect(() => {
    let result = [...openGames];

    // Filter by player address
    if (filters.player) {
      const playerLower = filters.player.toLowerCase();
      result = result.filter(
        (game) =>
          game.player_1.toLowerCase().includes(playerLower) ||
          game.player_2.toLowerCase().includes(playerLower)
      );
    }

    // Filter by asset ID
    if (filters.assetId) {
      result = result.filter(
        (game) => game.asset.toString() === filters.assetId
      );
    }

    // Filter by asset type
    if (filters.assetType === 'algo') {
      result = result.filter((game) => game.asset.toString() === '0');
    } else if (filters.assetType === 'assets') {
      result = result.filter((game) => game.asset.toString() !== '0');
    }

    // Filter by amount range
    if (filters.minAmount) {
      result = result.filter(
        (game) => game.assetAmount >= BigInt(filters.minAmount)
      );
    }

    if (filters.maxAmount) {
      result = result.filter(
        (game) => game.assetAmount <= BigInt(filters.maxAmount)
      );
    }

    // Filter by my games
    if (filters.showMyGames && activeAddress) {
      result = result.filter(
        (game) =>
          game.player_1 === activeAddress || game.player_2 === activeAddress
      );
    }

    setFilteredGames(result);
  }, [filters, openGames, activeAddress]);

  useEffect(() => {
    getOpenGames('mainnet');
    getCurrentRound('mainnet'); // Initial fetch

    const intervalId = setInterval(() => {
      getCurrentRound('mainnet');
      getOpenGames('mainnet');
    }, 3000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    getAccountAssets('mainnet');
  }, [activeAddress]);

  return (
    <main className='p-6 max-w-3xl mx-auto'>
      {/* Blockchain Info is now a separate component at the top of the page */}
      <div className='flex justify-end mb-4'>
        <RoundInfo appId={appId!} currentRound={currentRound} />
      </div>

      <button onClick={() => createAndFund('mainnet')}>Create</button>

      {/* Tab Navigation */}
      <div className='bg-gradient-to-b from-blue-100 to-purple-100 rounded-t-3xl shadow-xl overflow-hidden mb-px'>
        <div className='flex border-b border-gray-200'>
          <button
            onClick={() => setActiveTab('open-games')}
            className={`flex-1 py-4 text-center font-medium text-lg transition-colors ${
              activeTab === 'open-games'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            Open Games
          </button>
          <button
            onClick={() => setActiveTab('create-game')}
            className={`flex-1 py-4 text-center font-medium text-lg transition-colors ${
              activeTab === 'create-game'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            Create New Game
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className='bg-gradient-to-b from-blue-100 to-purple-100 rounded-b-3xl shadow-xl overflow-hidden mb-8'>
        <div className='p-8'>
          {/* Open Games Tab Content */}
          {activeTab === 'open-games' && (
            <>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>Open Games</h2>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className='flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm'
                  >
                    <Filter size={16} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  {Object.values(filters).some(
                    (value) =>
                      value !== '' && value !== false && value !== 'all'
                  ) && (
                    <button
                      onClick={clearFilters}
                      className='flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm'
                    >
                      <X size={16} />
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Section */}
              {showFilters && (
                <div className='bg-white p-4 rounded-lg shadow-md mb-6 animate-fadeIn'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block mb-4'>
                        <span className='text-gray-700 font-medium'>
                          Player Address
                        </span>
                        <div className='flex mt-1'>
                          <div className='relative flex-grow'>
                            <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                            <input
                              type='text'
                              name='player'
                              value={filters.player}
                              onChange={handleFilterChange}
                              placeholder='Search by player address'
                              className='pl-10 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-3'
                            />
                          </div>
                        </div>
                      </label>

                      <label className='block mb-4'>
                        <span className='text-gray-700 font-medium'>
                          Asset ID
                        </span>
                        <input
                          type='text'
                          name='assetId'
                          value={filters.assetId}
                          onChange={handleFilterChange}
                          placeholder='Filter by asset ID'
                          className='mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-3'
                        />
                      </label>
                    </div>

                    <div>
                      <div className='mb-4'>
                        <span className='text-gray-700 font-medium block mb-2'>
                          Amount Range
                        </span>
                        <div className='grid grid-cols-2 gap-4'>
                          <input
                            type='number'
                            name='minAmount'
                            value={filters.minAmount}
                            onChange={handleFilterChange}
                            placeholder='Min'
                            className='block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-3'
                          />
                          <input
                            type='number'
                            name='maxAmount'
                            value={filters.maxAmount}
                            onChange={handleFilterChange}
                            placeholder='Max'
                            className='block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-3'
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4 mb-2'>
                        <label className='flex items-center space-x-2'>
                          <input
                            type='checkbox'
                            name='showMyGames'
                            checked={filters.showMyGames}
                            onChange={handleFilterChange}
                            className='rounded text-blue-500 focus:ring-blue-500'
                          />
                          <span className='text-gray-700'>My Games Only</span>
                        </label>

                        <div>
                          <label className='block'>
                            <span className='text-gray-700 font-medium'>
                              Asset Type
                            </span>
                            <select
                              name='assetType'
                              value={filters.assetType}
                              onChange={handleFilterChange}
                              className='mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-3'
                            >
                              <option value='all'>All Types</option>
                              <option value='algo'>Algo Only</option>
                              <option value='assets'>ASAs Only</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Games List */}
              {filteredGames.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  No games match your filters
                </div>
              ) : (
                <div className='space-y-4'>
                  {filteredGames.map((game, index) => (
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
                              {game.counter.toString()} - {game.player_1}
                            </span>
                          </div>
                          <div className='mb-2'>
                            <span className='text-gray-500 font-medium'>
                              Player 1:
                            </span>
                            <span className='ml-2 font-mono break-all'>
                              {game.player_1}
                            </span>
                            {game.player_1 === activeAddress && (
                              <span className='ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                                You
                              </span>
                            )}
                          </div>
                          <div className='mb-2'>
                            <span className='text-gray-500 font-medium'>
                              Player 2:
                            </span>
                            <span className='ml-2 font-mono break-all'>
                              {game.player_2}
                            </span>
                            {game.player_2 === activeAddress && (
                              <span className='ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                                You
                              </span>
                            )}
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
                              {game.asset.toString() === '0' ? (
                                <span className='text-green-600 font-medium'>
                                  Algo
                                </span>
                              ) : (
                                game.asset.toString()
                              )}
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
                          onClick={() => {
                            if (game.asset === BigInt(0)) {
                              joinAlgoGame(game, 'mainnet');
                            } else {
                              joinAssetGame(game, 'mainnet');
                            }
                          }}
                          className='px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50'
                          disabled={disableJoinGame(game)}
                        >
                          Join Game
                        </button>
                        <button
                          onClick={() => playGame(game, 'mainnet')}
                          className='px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50'
                          disabled={disablePlayGame(game, currentRound)}
                        >
                          Play Game
                        </button>
                        <button
                          onClick={() => {
                            cancelGame(game, 'mainnet');
                          }}
                          disabled={disableCancelGame(game)}
                          className='px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50'
                        >
                          Cancel Game
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Create Game Tab Content */}
          {activeTab === 'create-game' && (
            <>
              <div className='flex items-center justify-between mb-8'>
                <h1 className='text-3xl font-bold text-gray-800'>
                  Create New Game
                </h1>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='space-y-4'>
                  <label className='block'>
                    <span className='text-gray-700 font-medium'>
                      Select Asset
                    </span>
                    <select
                      value={selectedAsset}
                      onChange={(e) => setSelectedAsset(e.target.value)}
                      className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-white p-3'
                    >
                      {[
                        { assetId: 0, assetName: 'Algo' },
                        ...accountAssets,
                      ].map((asset) => (
                        <option
                          key={asset.assetId}
                          value={Number(asset.assetId)}
                        >
                          {asset.assetName} ({asset.assetId})
                        </option>
                      ))}
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}
