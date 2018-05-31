import { Component, Inject } from '@angular/core';
import { SimpleModalComponent } from "ngx-simple-modal";

@Component({
    selector: 'app-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss']
})
export class PasswordComponent extends SimpleModalComponent<null, PasswordInput> implements PasswordInput {

    password: string;
    unlock: boolean;

    constructor() {
        super();
    }

    ok() {
        this.result = {
            password: this.password,
            unlock: this.unlock
        };
        this.close();
    }
}

export interface PasswordInput {
    password: string;
    unlock: boolean;
}
