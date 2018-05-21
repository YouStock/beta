import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss']
})
export class PasswordComponent  {

    hide: boolean = true;
    unlock: boolean = false;
    password: string;

    constructor(
        public dialogRef: MatDialogRef<PasswordComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }


    ok() {
        this.dialogRef.close(<PasswordInput>{password: this.password, unlock: this.unlock});
    }

}

export interface PasswordInput {
    password: string;
    unlock: boolean;
}
