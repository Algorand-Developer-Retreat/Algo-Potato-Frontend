'use client';

import { Button } from './components/ui/button';
import useGameMethods from '@/hooks/useGameMethods';
import { useEffect, useState } from 'react';
import { Input } from './components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import {
  ArrowRight,
  RefreshCw,
  Trophy,
  Coins,
  ListIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';

export default function GameDashboard() {
  const [wagerAmount, setWagerAmount] = useState<string>('');
  const defaultGamebookID = BigInt(process.env.NEXT_PUBLIC_APP_ID!);
  const secondaryGamebookID = BigInt(process.env.NEXT_PUBLIC_FUNK_APP_ID!);

  // Define available gamebooks
  const gamebooks = [
    { id: defaultGamebookID, name: 'Classic Toss' },
    { id: secondaryGamebookID, name: 'Funk Edition' },
  ];

  // State for the currently selected gamebook
  const [selectedGamebookIndex, setSelectedGamebookIndex] = useState<number>(0);
  const [selectedGamebookId, setSelectedGamebookId] = useState<bigint>(
    gamebooks[0].id
  );

  const {
    registerGame,
    getOpenGames,
    openGames,
    playGame,
    getGameBookState,
    gameBookState,
  } = useGameMethods();

  const isValidWager =
    wagerAmount !== '' &&
    !isNaN(Number(wagerAmount)) &&
    Number(wagerAmount) > 0;
  const [activeTab, setActiveTab] = useState<string>('register');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Remove non-numeric characters
    setWagerAmount(value);
  };

  useEffect(() => {
    getOpenGames(selectedGamebookId);
    getGameBookState(selectedGamebookId);
  }, []);

  // Format win percentage to two decimal places
  const formatWinPercentage = () => {
    if (!gameBookState) return '0%';
    const totalGames = gameBookState.ownerWins + gameBookState.playerWins;
    if (totalGames === 0) return '0%';
    return ((gameBookState.ownerWins / totalGames) * 100).toFixed(2) + '%';
  };

  // Handle gamebook navigation
  const navigateGamebook = (direction: 'next' | 'prev') => {
    let newIndex = selectedGamebookIndex;

    if (direction === 'next') {
      newIndex = (selectedGamebookIndex + 1) % gamebooks.length;
    } else {
      newIndex =
        selectedGamebookIndex === 0
          ? gamebooks.length - 1
          : selectedGamebookIndex - 1;
    }

    setSelectedGamebookIndex(newIndex);
    setSelectedGamebookId(gamebooks[newIndex].id);
  };

  // Handle direct gamebook selection
  const handleGamebookSelection = (gamebookId: string) => {
    const index = gamebooks.findIndex((gb) => gb.id.toString() === gamebookId);
    if (index !== -1) {
      setSelectedGamebookIndex(index);
      setSelectedGamebookId(gamebooks[index].id);
    }

    console.log(selectedGamebookId);
  };

  return (
    <main className='p-6 max-w-3xl mx-auto'>
      <div className='bg-gradient-to-b from-blue-50 to-purple-50 rounded-3xl shadow-xl overflow-hidden'>
        {/* Game Stats Banner */}
        <div className='bg-indigo-600 text-white p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-2xl font-bold'>Game Dashboard</h1>
            <Button
              variant='outline'
              onClick={() => getGameBookState(selectedGamebookId)}
              className='bg-transparent border border-white hover:bg-white hover:text-indigo-600'
            >
              <RefreshCw className='w-4 h-4 mr-2' /> Refresh Stats
            </Button>
          </div>

          {/* Gamebook Selector */}
          <div className='mb-4'>
            <div className='flex items-center justify-between bg-indigo-700 rounded-lg p-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => navigateGamebook('prev')}
                className='text-white hover:bg-indigo-600'
              >
                <ChevronLeft className='w-5 h-5' />
              </Button>

              <Select
                value={selectedGamebookId.toString()}
                onValueChange={handleGamebookSelection}
              >
                <SelectTrigger className='flex-1 mx-2 bg-indigo-700 border-indigo-500 text-white'>
                  <SelectValue placeholder='Select Gamebook'>
                    {gamebooks[selectedGamebookIndex].name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {gamebooks.map((book) => (
                    <SelectItem
                      key={book.id.toString()}
                      value={book.id.toString()}
                    >
                      {book.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant='ghost'
                size='icon'
                onClick={() => navigateGamebook('next')}
                className='text-white hover:bg-indigo-600'
              >
                <ChevronRight className='w-5 h-5' />
              </Button>
            </div>
          </div>

          {gameBookState && (
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div className='bg-indigo-700 rounded-lg p-4'>
                <Trophy className='w-6 h-6 mx-auto mb-2' />
                <p className='text-sm'>Owner Wins</p>
                <p className='text-2xl font-bold'>{gameBookState.ownerWins}</p>
              </div>
              <div className='bg-indigo-700 rounded-lg p-4'>
                <Coins className='w-6 h-6 mx-auto mb-2' />
                <p className='text-sm'>Player Wins</p>
                <p className='text-2xl font-bold'>{gameBookState.playerWins}</p>
              </div>
              <div className='bg-indigo-700 rounded-lg p-4'>
                <div className='w-6 h-6 mx-auto mb-2 flex items-center justify-center'>
                  <span className='text-lg font-bold'>%</span>
                </div>
                <p className='text-sm'>Win Rate</p>
                <p className='text-2xl font-bold'>{formatWinPercentage()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className='p-6'>
          <Tabs
            defaultValue='register'
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid grid-cols-2 mb-6'>
              <TabsTrigger value='register' className='text-center py-3'>
                Register Game
              </TabsTrigger>
              <TabsTrigger value='open' className='text-center py-3'>
                Open Games
              </TabsTrigger>
            </TabsList>

            {/* Register Game Tab */}
            <TabsContent value='register' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center text-xl'>
                    <Coins className='w-5 h-5 mr-2 text-indigo-600' />
                    🤝 Toss It Up 🤝 - {gamebooks[selectedGamebookIndex].name}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <label
                      htmlFor='wagerAmount'
                      className='text-sm font-medium'
                    >
                      <span>Toss Up Amount</span>
                      <span className='text-xs text-gray-500 ml-2'>
                        (1 ALGO = 1,000,000 MicroAlgo)
                      </span>
                    </label>
                    <Input
                      id='wagerAmount'
                      type='text'
                      inputMode='numeric'
                      pattern='[0-9]*'
                      placeholder='Enter amount'
                      value={wagerAmount}
                      onChange={handleInputChange}
                      className='w-full'
                    />
                    {!isValidWager && wagerAmount !== '' && (
                      <p className='text-sm text-red-500'>
                        Please enter a valid wager amount.
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() =>
                      registerGame(Number(wagerAmount), selectedGamebookId)
                    }
                    variant='default'
                    disabled={!isValidWager}
                    className='w-full bg-indigo-600 hover:bg-indigo-700 text-white'
                  >
                    Register Game <ArrowRight className='w-4 ml-2' />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Open Games Tab */}
            <TabsContent value='open' className='space-y-4'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold flex items-center'>
                  <ListIcon className='w-5 h-5 mr-2 text-indigo-600' />
                  Available Games - {gamebooks[selectedGamebookIndex].name}
                </h2>
                <Button
                  onClick={() => getOpenGames(selectedGamebookId)}
                  variant='outline'
                  size='sm'
                >
                  <RefreshCw className='w-4 h-4 mr-2' /> Refresh
                </Button>
              </div>

              {openGames.length === 0 ? (
                <Card className='p-8 text-center text-gray-500'>
                  <p>No open games available at the moment.</p>
                  <p className='text-sm mt-2'>
                    Try refreshing or register your own game!
                  </p>
                </Card>
              ) : (
                <div className='grid gap-4'>
                  {openGames.map((game) => (
                    <Card
                      key={game.id.toString()}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardContent className='p-4'>
                        <div className='grid grid-cols-2 gap-2 mb-3'>
                          <div>
                            <p className='text-xs text-gray-500'>Owner</p>
                            <p className='font-medium truncate'>{game.owner}</p>
                          </div>
                          <div>
                            <p className='text-xs text-gray-500'>Amount</p>
                            <p className='font-medium'>
                              {game.amount!.toString()}
                            </p>
                          </div>
                        </div>
                        <div className='flex justify-between items-center'>
                          <div>
                            <p className='text-xs text-gray-500'>Game AppID</p>
                            <p className='text-sm truncate max-w-xs'>
                              {game.id.toString()}
                            </p>
                          </div>
                          <Button
                            className='bg-indigo-600 hover:bg-indigo-700 text-white'
                            onClick={() =>
                              playGame(game.amount!.microAlgos!, game.id!)
                            }
                          >
                            Play
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
