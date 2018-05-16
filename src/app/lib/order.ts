import { BigNumber } from 'bignumber.js';

export class Order {
    buy: boolean;
    id: string;
    amount: BigNumber;
    price: BigNumber;
    owner: string;
    sum: BigNumber;
}
