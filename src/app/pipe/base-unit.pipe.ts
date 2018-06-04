import { Pipe, PipeTransform } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { WEI_MULTIPLIER, TOKEN_MULTIPLIER, PRICE_RATIO } from '../lib/constants';

@Pipe({
    name: 'baseUnit'
})
export class BaseUnitPipe implements PipeTransform {
    transform(value: any, unit: string): string {
        switch(unit) {
            case 'token': return TOKEN_MULTIPLIER.times(value).toString(10);
            case 'wei': return WEI_MULTIPLIER.times(value).toString(10);
            case 'price': return PRICE_RATIO.times(value).toString(10);
        }
        console.log('unknown unit in base unit pipe: ' + (unit || ''));
        return value.toString();
    }
}
