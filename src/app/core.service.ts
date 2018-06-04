import { Injectable, ApplicationRef, ChangeDetectorRef } from '@angular/core';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { SimpleModalService } from 'ngx-simple-modal';

import { PasswordComponent, PasswordInput } from './password/password.component';

@Injectable()
export class CoreService {

    private passwordOpen: boolean;

    constructor(private toastr: ToastsManager, private modal: SimpleModalService, private appRef: ApplicationRef) { }

    promptPassword(f: (err, pass: PasswordInput) => void): void {
        if(this.passwordOpen) {
            return;
        }
        this.passwordOpen = true;
        var that = this;
        this.modal.addModal(PasswordComponent, null, { closeOnClickOutside: true, closeOnEscape: true }).subscribe((result: PasswordInput) => {
            that.passwordOpen = false;
            if(result)
                f(null, result);
            setTimeout(() => that.appRef.tick(), 0);
        });

        //ng5 async callback does not trigger change detection so we have to do this
        setTimeout(() => that.appRef.tick(), 0);
    }

    err(err) {
        console.log(err);
        this.toastr.error(err); 
    }

    detectChanges() {
        var that = this;
        setTimeout(() => that.appRef.tick(), 0);
    }
}

