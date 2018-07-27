import { Component, Input, OnInit } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Utils } from '../lib/utils';

@Component({
  selector: 'app-address-clip',
  templateUrl: './address-clip.component.html',
  styleUrls: ['./address-clip.component.scss']
})
export class AddressClipComponent {
    @Input() address: string;

    constructor(private toastr: ToastsManager) {}

    OnInit() {
        this.address = Utils.zeroX(this.address);
    }

    addressClipped(e) {
        this.toastr.success(e.text, "Copied address!", { timeOut: 900 });
    }

    zeroX(address: string): string {
        return Utils.zeroX(address);
    }
}
