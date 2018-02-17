'use strict';
/* eslint no-sync: 0 */
const angular = require('angular');

export class NavbarComponent {
  isLoggedIn: Function;
  isAdmin: Function;
  getCurrentUser: Function;
  isCollapsed = true;
  appTheme = 'superhero';
  themes = ['superhero', 'cosmo', 'flatly', 'cerulean', 'cyborg', 'readable', 'slate', 'spacelab', 'journal'];
  storage;

  constructor(Auth, localStorageService) {
    'ngInject';
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.storage = localStorageService;
    this.appTheme = localStorageService.get('appTheme') || this.appTheme;
    this.setTheme(this.appTheme);
  }

  setTheme(theme) {
    this.appTheme = theme;
    this.storage.set('appTheme', theme);
    var href = 'https://cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.7/' + theme + '/bootstrap.min.css';
    if($('head link[title="bootswatch"]').length == 0) {
      var link = '<link title="bootswatch" rel="stylesheet" href="' + href + '" type="text/css" media="screen">';
      $('head').append(link);
    }
    $('head link[title="bootswatch"]').attr('href', href);
  };


}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
