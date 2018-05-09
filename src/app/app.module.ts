import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { NgxImgModule } from 'ngx-img';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { ClipboardModule } from 'ngx-clipboard';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WalletComponent } from './wallet/wallet.component';
import { MarketComponent } from './market/market.component';
import { YourstockComponent } from './yourstock/yourstock.component';
import { NavbarComponent } from './navbar/navbar.component';
import { WalletOpenComponent } from './wallet-open/wallet-open.component';
import { WalletNewComponent } from './wallet-new/wallet-new.component';
import { SettingsComponent } from './settings/settings.component';

import { NodeService } from './node.service';
import { DataService } from './data.service';
import { SettingsService } from './settings.service';

import { FromWeiPipe } from './from-wei.pipe';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        DashboardComponent,
        WalletComponent,
        MarketComponent,
        YourstockComponent,
        NavbarComponent,
        WalletOpenComponent,
        WalletNewComponent,
        FromWeiPipe,
        SettingsComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ToastModule.forRoot(),
        ClipboardModule,
        NgxImgModule.forRoot(),
        FormsModule,
        NgxQRCodeModule
    ],
    providers: [NodeService, DataService, SettingsService],
    bootstrap: [AppComponent]
})
export class AppModule { }
