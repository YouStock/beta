'use strict';
const angular = require('angular');
const ngAnimate = require('angular-animate');
const ngCookies = require('angular-cookies');
const ngResource = require('angular-resource');
const ngSanitize = require('angular-sanitize');

import 'angular-socket-io';

const uiRouter = require('angular-ui-router');
const uiBootstrap = require('angular-ui-bootstrap');
import 'angular-validation-match';
import 'angular-local-storage';
import 'ng-file-upload';
const toastr = require('angular-toastr');
import 'ngclipboard';

import {routeConfig} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';
import dashboard from './dashboard/dashboard.component';
import wallet from './wallet/wallet.component';
import browse from './browse/browse.component';
import yourstock from './yourstock/yourstock.component';
import cryptodex from './cryptodex/cryptodex.component';
import market from './market/market.component';
import blockchain from './blockchain/blockchain.component';
import network from './network/network.component';
import purse from '../services/purse/purse.service';

import './app.scss';

angular.module('youStockApp', [
  ngCookies,
  ngResource,
  ngSanitize,
  ngAnimate,

  'btford.socket-io',

  uiRouter,
  uiBootstrap,

  'LocalStorageModule',
  'ngFileUpload',
  toastr,
  'ngclipboard',

  _Auth,
  account,
  admin,
  'validation.match',
  navbar,
  footer,
  main,
  constants,
  socket,
  util,

  purse,

  dashboard,
  wallet,
  browse,
  yourstock,
  cryptodex,
  market,
  blockchain,
  network
])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular
  .element(document)
  .ready(() => {
    angular.bootstrap(document, ['youStockApp'], {
      strictDi: true
    });
  });
