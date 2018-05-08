import { Pipe, PipeTransform } from '@angular/core';

import { BigNumber } from 'bignumber.js';

declare var require: any;
const Web3 = require('web3');

@Pipe({
    name: 'fromWei'
})
export class FromWeiPipe implements PipeTransform {

    transform(value: BigNumber | string, args?: any): any {
        if(typeof value !== 'string')
            value = value.toString(10);
        return Web3.utils.fromWei(value, 'ether');
    }

}
