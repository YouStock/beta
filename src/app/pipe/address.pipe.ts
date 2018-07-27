import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from '../lib/utils';

@Pipe({
    name: 'address'
})
export class AddressPipe implements PipeTransform {

    transform(value: any, noX?: boolean): any {
        return Utils.address(value, noX);
    }
}
