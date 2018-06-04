import { BigNumber } from 'bignumber.js';

export const TOKEN_MULTIPLIER: BigNumber = new BigNumber(1000000); // 1 million
export const WEI_MULTIPLIER: BigNumber = new BigNumber(10).pow(18); // '1,000,000,000,000,000,000';
export const PRICE_RATIO: BigNumber = new BigNumber(10).pow(12); // wei / token
