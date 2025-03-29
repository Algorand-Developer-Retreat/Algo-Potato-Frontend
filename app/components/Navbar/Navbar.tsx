'use client';

import Link from 'next/link';
import { useState } from 'react';
import ConnectMenu from '../Txn-lab/Connect-menu';

export default function Navbar() {
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  const networkConfig = {
    testnet: {
      name: 'Testnet',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
    },
    mainnet: {
      name: 'Mainnet',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
  };

  const toggleNetwork = () => {
    setNetwork((prev) => (prev === 'testnet' ? 'testnet' : 'testnet'));
  };

  return (
    <nav className='sticky top-0 z-50 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg'>
      <div className='container mx-auto px-4'>
        <div className='flex h-20 items-center justify-between relative'>
          {/* Network Indicator */}
          <div className='absolute left-4 flex items-center'>
            <button
              onClick={toggleNetwork}
              className={`
                ${networkConfig[network].color} 
                ${networkConfig[network].hoverColor}
                text-white 
                px-3 
                py-1 
                rounded-full 
                text-sm 
                font-medium 
                transition-all 
                duration-300 
                hover:scale-105 
                cursor-pointer 
                shadow-md
                flex 
                items-center 
                gap-2
              `}
            >
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
              </span>
              {networkConfig[network].name}
            </button>
          </div>

          {/* Centered Logo with hover effect */}
          <div className='absolute left-1/2 transform -translate-x-1/2'>
            <Link href='/' className='flex-shrink-0'>
              <h1
                className='text-3xl font-extrabold text-transparent bg-clip-text 
                bg-gradient-to-r from-blue-600 to-purple-600 
                transition-all duration-300 
                hover:scale-105 
                hover:from-purple-600 hover:to-blue-600 
                cursor-pointer'
              >
                🥔 AlgoPotato 🥔
              </h1>
            </Link>
          </div>

          {/* Connect Menu on the right */}
          <div className='absolute right-4 flex items-center'>
            <ConnectMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
