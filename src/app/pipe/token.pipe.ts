import { Pipe, PipeTransform } from '@angular/core';
import { BigNumber } from 'bignumber.js';

@Pipe({
  name: 'token'
})
export class TokenPipe implements PipeTransform {

    transform(value: BigNumber | string, args?: any): any {
        if(typeof value === 'string')
            value = new BigNumber(value);
        return value.div(1000000).toString(10);
    }

}
