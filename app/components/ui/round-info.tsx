import React, { useState, useEffect } from 'react';

interface BlockchainInfoProps {
  appId: string;
  currentRound: bigint;
}

const RoundInfo: React.FC<BlockchainInfoProps> = ({ appId, currentRound }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevRound, setPrevRound] = useState(currentRound);

  // Trigger animation when currentRound changes
  useEffect(() => {
    if (currentRound !== prevRound) {
      setPrevRound(currentRound);
      setIsAnimating(true);

      // Reset animation after it completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000); // Animation duration is 1 second

      return () => clearTimeout(timer);
    }
  }, [currentRound, prevRound]);

  return (
    <div
      className={`bg-white px-4 py-3 rounded-lg shadow-sm transition-all duration-300 ${
        isAnimating ? 'bg-blue-50 scale-105' : ''
      }`}
    >
      <div className='flex flex-col space-y-1'>
        <div className='flex items-center'>
          <span className='text-sm text-gray-500 font-medium'>App ID:</span>
          <span className='ml-2 font-mono font-medium'>{appId}</span>
        </div>
        <div className='flex items-center'>
          <span className='text-sm text-gray-500 font-medium'>
            Current Round:
          </span>
          <span
            className={`ml-2 font-mono font-medium transition-colors duration-300 ${
              isAnimating ? 'text-blue-600 font-bold' : ''
            }`}
          >
            {currentRound.toString()}
          </span>

          {/* Animated pulse dot */}
          {isAnimating && (
            <span className='ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full animate-ping' />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundInfo;
