'use strict';
/* eslint no-sync: 0 */
const angular = require('angular');

export class NavbarComponent {
  menu = [{
    'title': 'Home',
    'state': 'main'
	 },
	 {
    'title': 'Dashboard',
    'state': 'dashboard'
	 },
	 {
    'title': 'Wallet',
    'state': 'wallet'
	 },
	 {
    'title': 'YourStock',
    'state': 'yourstock'
	 },
	 {
    'title': 'Browse',
    'state': 'browse'
	 },
	 {
    'title': 'Market',
    'state': 'market'
	 },
	 {
    'title': 'CryptoDEX',
    'state': 'cryptodex'
	 },
	 {
    'title': 'Blockchain',
    'state': 'blockchain'
	 },
	 {
    'title': 'Network',
    'state': 'network'
  }];
  isLoggedIn: Function;
  isAdmin: Function;
  getCurrentUser: Function;
  isCollapsed = true;

  constructor(Auth) {
    'ngInject';
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
  }

}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
