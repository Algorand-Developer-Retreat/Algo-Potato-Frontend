'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  MinusCircle,
  PlusCircle,
  Wallet,
  HandCoins,
} from 'lucide-react';
import { useWallet } from '@txnlab/use-wallet-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { checkAlgoBalance, copyAddress } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface WalletBalanceProps {
  total: string;
  available: string;
  isMobile?: boolean;
}

function WalletBalance({
  total,
  available,
  isMobile = false,
}: WalletBalanceProps) {
  if (isMobile) {
    return (
      <div className='md:hidden w-full flex flex-row gap-x-6 my-6 bg-slate-100 p-4 rounded-lg'>
        <div className='flex flex-row items-center gap-x-3'>
          <p className='text-sm font-medium'>Total</p>
          <div className='flex flex-row items-center'>
            <Image
              className='mr-2'
              src='/logos/algorandLogo.svg'
              alt='Algorand logo'
              width={15}
              height={15}
            />
            <p className='text-sm'>{total}</p>
          </div>
        </div>
        <div className='flex flex-row items-center gap-x-3'>
          <p className='text-sm font-medium'>Available</p>
          <div className='flex flex-row items-center'>
            <Image
              className='mr-2'
              src='/logos/algorandLogo.svg'
              alt='Algorand logo'
              width={15}
              height={15}
            />
            <p className='text-sm'>{available}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='hidden md:flex flex-row h-20 w-full md:w-fit pl-4 my-4 md:pl-0 md:my-0'>
      <div className='border-r border-slate-200 pr-4 mr-4 flex flex-col md:items-end justify-around'>
        <p className='text-sm font-medium'>Total</p>
        <p className='text-sm font-medium'>Available</p>
      </div>
      <div className='flex flex-col w-30 justify-around'>
        <div className='flex flex-row items-center'>
          <Image
            className='mr-2'
            src='/logos/algorandLogo.svg'
            alt='Algorand logo'
            width={15}
            height={15}
          />
          <p className='text-sm'>{total}</p>
        </div>
        <div className='flex flex-row items-center'>
          <Image
            className='mr-2'
            src='/logos/algorandLogo.svg'
            alt='Algorand logo'
            width={15}
            height={15}
          />
          <p className='text-sm'>{available}</p>
        </div>
      </div>
    </div>
  );
}

export default function ConnectMenu() {
  const { wallets, activeAccount } = useWallet();
  const [algoBalance, setAlgoBalance] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyAddress = (address: string) => {
    copyAddress(address);
  };

  const network = process.env.NEXT_PUBLIC_ALGOD_NETWORK;

  useEffect(() => {
    const handleOpenDropdown = () => setIsOpen(true);
    window.addEventListener('open-wallet-dropdown', handleOpenDropdown);
    return () => {
      window.removeEventListener('open-wallet-dropdown', handleOpenDropdown);
    };
  }, []);

  useEffect(() => {
    const handleCheckAlgoBalance = async () => {
      if (!activeAccount?.address) return;
      setIsLoading(true);
      try {
        const balance = await checkAlgoBalance(activeAccount.address);
        setAlgoBalance(balance);
      } catch (error) {
        console.log('Failed to fetch balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeAccount?.address) {
      handleCheckAlgoBalance();
    }
  }, [activeAccount]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatBalance = (balance: number) =>
    (Number(balance) / Math.pow(10, 6)).toFixed(3);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='w-fit border-slate-200 bg-white hover:bg-slate-100'
          id='connectWallet'
        >
          {isClient && activeAccount ? (
            <div className='flex items-center gap-2'>
              <Wallet className='h-4 w-4' />
              <p className='hidden sm:block'>
                {activeAccount.address.substring(0, 6)}...
                {activeAccount.address.substring(54, 58)}
              </p>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Wallet className='h-4 w-4' />
              <span className='hidden sm:block'>Connect Wallet</span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-screen sm:max-w-[screen] md:w-[560px] p-4 rounded-xl'>
        {activeAccount && (
          <div className='space-y-4'>
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <div className='h-11 w-11 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center'>
                  <Wallet className='h-5 w-5 text-slate-600' />
                </div>
                <div className='space-y-1'>
                  <h3 className='font-medium'>{activeAccount.name}</h3>
                  <button
                    onClick={() => handleCopyAddress(activeAccount.address)}
                    className='flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900'
                  >
                    <span>
                      {activeAccount.address.substring(0, 6)}...
                      {activeAccount.address.substring(54, 58)}
                    </span>
                    <Copy className='h-4 w-4' />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className='w-full md:w-auto space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-24' />
                </div>
              ) : (
                algoBalance && (
                  <>
                    <WalletBalance
                      total={formatBalance(algoBalance[0])}
                      available={formatBalance(
                        Number(algoBalance[0]) - Number(algoBalance[1])
                      )}
                    />
                    <WalletBalance
                      total={formatBalance(algoBalance[0])}
                      available={formatBalance(
                        Number(algoBalance[0]) - Number(algoBalance[1])
                      )}
                      isMobile
                    />
                  </>
                )
              )}
            </div>

            {network === 'testnet' && (
              <>
                <div className='flex justify-end'>
                  <Button asChild variant='outline' size='sm'>
                    <Link
                      href='https://bank.testnet.algorand.network/'
                      target='_blank'
                      className='flex items-center gap-2'
                    >
                      <HandCoins className='h-4 w-4' />
                      Testnet Dispenser
                    </Link>
                  </Button>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
          </div>
        )}

        <div className='space-y-2 pt-2'>
          {wallets?.map((wallet) => (
            <div
              key={wallet.id}
              className='py-4 first:pt-0 last:pb-0 border-b border-slate-100 last:border-0'
            >
              {wallet.isActive && wallet.accounts.length ? (
                <div className='flex flex-col md:flex-col gap-4'>
                  <div className='flex items-start gap-4 flex-1'>
                    <Image
                      className='rounded-full w-11 h-11'
                      alt={`${wallet.metadata.name} icon`}
                      src={wallet.metadata.icon || '/placeholder.svg'}
                      width={44}
                      height={44}
                    />
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-medium mb-2'>
                        {wallet.metadata.name}
                      </h4>
                      <Select onValueChange={wallet.setActiveAccount}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={activeAccount?.address} />
                        </SelectTrigger>
                        <SelectContent>
                          {wallet.accounts.map((account) => (
                            <SelectItem
                              key={account.address}
                              value={account.address}
                            >
                              {account.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    className='w-full md:w-auto'
                    variant='secondary'
                    onClick={wallet.disconnect}
                    disabled={!wallet.isConnected}
                  >
                    <MinusCircle className='h-4 w-4 mr-2' />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-4'>
                    <Image
                      className='rounded-full w-11 h-11'
                      alt={`${wallet.metadata.name} icon`}
                      src={wallet.metadata.icon || '/placeholder.svg'}
                      width={44}
                      height={44}
                    />
                    <h4 className='font-medium'>{wallet.metadata.name}</h4>
                  </div>
                  {!wallet.isConnected ? (
                    <Button
                      variant='secondary'
                      onClick={() => {
                        wallet.connect().catch((error) => {
                          if (error.data?.type === 'CONNECT_MODAL_CLOSED') {
                            console.log(error.message);
                            return;
                          }
                          console.log('Failed to connect wallet:', error);
                        });
                      }}
                      disabled={wallet.isConnected}
                    >
                      <PlusCircle className='h-4 w-4 mr-2' />
                      Connect
                    </Button>
                  ) : (
                    <Button
                      variant='secondary'
                      onClick={wallet.setActive}
                      disabled={!wallet.isConnected || wallet.isActive}
                    >
                      <CheckCircle2 className='h-4 w-4 mr-2' />
                      Set Active
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
