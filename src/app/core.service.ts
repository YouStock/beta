import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { PasswordComponent, PasswordInput } from './password/password.component';

@Injectable()
export class CoreService {

    private passwordOpen: boolean;

    constructor(private dialog: MatDialog, private toastr: ToastsManager) { }

    promptPassword(f: (err, pass: PasswordInput) => void): void {
        if(this.passwordOpen) {
            return;
        }
        this.passwordOpen = true;
        let dialogRef = this.dialog.open(PasswordComponent);

        dialogRef.afterClosed().subscribe((result: PasswordInput) => {
            this.passwordOpen = false;
            f(null, result);
        });
    }
    
    err(err) {
        console.log(err);
        this.toastr.error(err); 
    }
}

