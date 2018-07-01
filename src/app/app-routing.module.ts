import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MarketComponent } from './market/market.component';
import { WalletComponent } from './wallet/wallet.component';
import { WalletNewComponent } from './wallet-new/wallet-new.component';
import { WalletOpenComponent } from './wallet-open/wallet-open.component';
import { YourstockComponent } from './yourstock/yourstock.component';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' }, 
    { path: 'home', component: HomeComponent }, 
    { path: 'market', component: MarketComponent }, 
    { path: 'market/:token', component: MarketComponent }, 
    { path: 'wallet/new', component: WalletNewComponent }, 
    { path: 'wallet/open', component: WalletOpenComponent }, 
    { path: 'wallet', component: WalletComponent }, 
    { path: 'yourstock', component: YourstockComponent }, 
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
