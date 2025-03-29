import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { algorandClient } from './algoClient';
import { toast } from '@/hooks/use-toast';
import Big from 'big.js';

Big.DP = 20; // Decimal precision
Big.RM = Big.roundDown; // Rounding mode

const activeNetwork = process.env.NEXT_PUBLIC_ALGOD_NETWORK;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitial(text: string): string {
  return text?.charAt(0).toUpperCase() || '';
}

export function getBackgroundColor(
  classType: string,
  hex: boolean = false
): string {
  switch (classType?.toLowerCase()) {
    case 'common':
      return hex ? '#FCE7F3' : 'bg-pink-100';
    case 'preferred':
      return hex ? '#F3E8FF' : 'bg-purple-100';
    case 'warrants':
      return hex ? '#FEF3C7' : 'bg-yellow-100';
    default:
      return hex ? '#F3F4F6' : 'bg-gray-100';
  }
}

export function getHeaderBackgroundColor(
  classType: string,
  hex: boolean = false
): string {
  switch (classType?.toLowerCase()) {
    case 'common':
      return hex ? '#FDF2F8' : 'bg-pink-50';
    case 'preferred':
      return hex ? '#FAF5FF' : 'bg-purple-50';
    case 'warrants':
      return hex ? '#FFFBEB' : 'bg-yellow-50';
    default:
      return hex ? '#F9FAFB' : 'bg-gray-50';
  }
}

export function getInitialsLetters(name?: string) {
  const value = name;
  const capitalLetters = value?.match(/[A-Z]/g);

  if (capitalLetters) {
    return [capitalLetters[0], capitalLetters[1] || ''].join('');
  } else {
    return 'C';
  }
}

export function capitalizeWords(input: string): string {
  return input
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const unlimitedShares = BigInt('9223372036854775808');

// Algorand related
export async function checkAlgoBalance(address: string) {
  const { account } = await algorandClient.client.indexer
    .lookupAccountByID(address)
    .do();
  return [account.amount, account['minBalance']];
}

export function copyAddress(address: string) {
  window.navigator.clipboard.writeText(address).then(
    () => {
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Copied wallet address to clipboard!',
      });
    },
    () => {
      toast({
        variant: 'error',
        title: 'There was an error',
        description: 'Failed to copy wallet address to clipboard',
      });
    }
  );
}
export const USDC = {
  assetId: activeNetwork === 'testnet' ? 10458941 : 31566704,
  decimals: 6,
  unitName: 'USDC',
  tokenName: 'USDC',
};

export const isOptedIn = async (address: string, assetId: number) => {
  try {
    const { assets } = await algorandClient.client.indexer
      .lookupAccountAssets(address)
      .assetId(assetId)
      .do();
    return assets.length > 0;
  } catch (error) {
    console.log('isOptedIn error: ', error);
    return false;
  }
};

export const validateDecimalPlaces = (value: number, maxDecimals: number) => {
  const valueStr = value.toString();
  const decimalPart = valueStr.includes('.') ? valueStr.split('.')[1] : '';
  return decimalPart.length <= maxDecimals;
};

// Trims trailing zeros from a number
export const trimTrailingZeros = (num: number, maxDecimals: number): string => {
  const formatted = num.toFixed(maxDecimals);

  if (!formatted.includes('.')) return formatted;

  return formatted.replace(/\.?0+$/, '');
};

// Converts display value to raw value based on asset decimals
export const toRawValue = (
  value: number | undefined,
  decimals: number
): number => {
  if (value === undefined || isNaN(value)) return 0;
  try {
    const bigValue = new Big(value);
    const multiplier = new Big(10).pow(decimals);
    const rawValue = bigValue.times(multiplier).round(0);
    return Number(rawValue.toString());
  } catch (error) {
    console.log('toRawValue error:', error);
    return 0;
  }
};

// Converts raw value to display value based on asset decimals
export const toDisplayValue = (rawValue: number, decimals: number): number => {
  try {
    const bigValue = new Big(rawValue);
    const divisor = new Big(10).pow(decimals);
    const displayValue = bigValue.div(divisor);
    return Number(displayValue.toString());
  } catch (error) {
    console.log('toDisplayValue error:', error);
    return 0;
  }
};

// Calculates price per token
export const calculatePricePerToken = (
  targetRaise: number | undefined,
  tokensForSale: number | undefined
): number => {
  if (!targetRaise || !tokensForSale || tokensForSale <= 0) return 0;

  try {
    const bigTargetRaise = new Big(targetRaise);
    const bigTokensForSale = new Big(tokensForSale);
    const price = bigTargetRaise.div(bigTokensForSale);
    return Number(price.toString());
  } catch (error) {
    console.log('calculatePricePerToken error:', error);
    return 0;
  }
};

export const checkAssetBalance = async (
  address: string,
  assetId: number,
  assetDecimals: number
) => {
  try {
    const { balance } = await algorandClient.asset.getAccountInformation(
      address,
      BigInt(assetId)
    );
    return toDisplayValue(Number(balance), assetDecimals);
  } catch (error) {
    console.log('checkAssetBalance error', error);
    return 0;
  }
};
