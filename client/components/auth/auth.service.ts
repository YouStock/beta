'use strict';

import * as _ from 'lodash';
declare var Reflect: any;

// @flow
class _User {
    _id: string = '';
    name: string = '';
    email: string = '';
    role: string = '';
    stockAddress: string = '';
    bio: string = '';
    stockTx: string = '';
    fullName: string = '';
    symb: string = '';
    decimals: string = '';
    total: string = '';
    $promise = undefined;
}

export function AuthService($location, $http, $cookies, $q, appConfig, Util, User) {
    'ngInject';
    var safeCb = Util.safeCb;
    var currentUser: _User = new _User();
    var userRoles = appConfig.userRoles || [];
    /**
     * Check if userRole is >= role
     * @param {String} userRole - role of current user
     * @param {String} role - role to check against
     */
    var hasRole = function(userRole, role) {
        return userRoles.indexOf(userRole) >= userRoles.indexOf(role);
    };

    if($cookies.get('token') && $location.path() !== '/logout') {
        currentUser = User.get();
    }

    var Auth = {
        /**
         * Authenticate user and save token
         *
         * @param  {Object}   user     - login info
         * @param  {Function} callback - function(error, user)
         * @return {Promise}
         */
        login({email, password}, callback?: Function) {
            return $http.post('/auth/local', { email, password })
                .then(res => {
                    $cookies.put('token', res.data.token);
                    currentUser = User.get();
                    return currentUser.$promise;
                })
                .then(user => {
                    safeCb(callback)(null, user);
                    return user;
                })
                .catch(err => {
                    Auth.logout();
                    safeCb(callback)(err.data);
                    return $q.reject(err.data);
                });
        },

        /**
         * Delete access token and user info
         */
        logout() {
            $cookies.remove('token');
            currentUser = new _User();
        },

        /**
         * Create a new user
         *
         * @param  {Object}   user     - user info
         * @param  {Function} callback - function(error, user)
         * @return {Promise}
         */
        createUser(user, callback?: Function) {
            return User.save(user,
                function(data) {
                    $cookies.put('token', data.token);
                    currentUser = User.get();
                    return safeCb(callback)(null, user);
                },
                function(err) {
                    Auth.logout();
                    return safeCb(callback)(err);
                }).$promise;
        },

        /**
         * Change password
         *
         * @param  {String}   oldPassword
         * @param  {String}   newPassword
         * @param  {Function} callback    - function(error, user)
         * @return {Promise}
         */
        changePassword(oldPassword, newPassword, callback?: Function) {
            return User.changePassword({ id: currentUser._id }, { oldPassword, newPassword }, function() {
                return safeCb(callback)(null);
            }, function(err) {
                return safeCb(callback)(err);
            }).$promise;
        },

        setStockAddress(stockAddress, callback?: Function) {
            return User.setStockAddress({ id: currentUser._id}, { stockAddress }, function() {
                currentUser.stockAddress = stockAddress;
                return safeCb(callback)(null);
            }, function(err) {
                return safeCb(callback)(err);
            }).$promise;
        },

        setBio(bio, callback?: Function) {
            return User.setBio({ id: currentUser._id}, { bio }, function() {
                currentUser.bio = bio;
                return safeCb(callback)(null);
            }, function(err) {
                return safeCb(callback)(err);
            }).$promise;
        },

        setFullName(fullName, callback?: Function) {
            return User.setFullName({ id: currentUser._id}, { fullName }, function() {
                currentUser.fullName = fullName;
                return safeCb(callback)(null);
            }, function(err) {
                return safeCb(callback)(err);
            }).$promise;
        },

        setDecimals(decimals, callback?: Function) {
            return User.setDecimals({ id: currentUser._id}, { decimals }, function() {
                currentUser.decimals = decimals;
                return safeCb(callback)(null);
            }, function(err) {
                return safeCb(callback)(err);
            }).$promise;
        },

        setTotal(total, callback?: Function) {
            return User.setTotal({ id: currentUser._id}, { total }, function() {
                currentUser.total = total;
                return safeCb(callback)(null);
            }, function(err) {
                return safeCb(callback)(err);
            }).$promise;
        },

        setStockTx(stockTx, callback?: Function) {
            return User.setStockTx({ id: currentUser._id}, { stockTx }, function() {
                currentUser.stockTx = stockTx;
                return safeCb(callback)(null);
            }, function(err) {
                return safeCb(callback)(err);
            }).$promise;
        },

        setSymb(symb, callback?: Function) {
            return User.setSymb({ id: currentUser._id}, { symb }, function() {
                currentUser.symb = symb;
                return safeCb(callback)(null);
            }, function(err) {
                return safeCb(callback)(err);
            }).$promise;
        },


        /**
         * Gets all available info on a user
         *
         * @param  {Function} [callback] - function(user)
         * @return {Promise}
         */
        getCurrentUser(callback?: Function) {
            var value = _.get(currentUser, '$promise')
                ? currentUser.$promise
                : currentUser;

            return $q.when(value)
                .then(user => {
                    safeCb(callback)(user);
                    return user;
                }, () => {
                    safeCb(callback)({});
                    return {};
                });
        },

        /**
         * Gets all available info on a user
         *
         * @return {Object}
         */
        getCurrentUserSync() {
            return currentUser;
        },

        /**
         * Check if a user is logged in
         *
         * @param  {Function} [callback] - function(is)
         * @return {Promise}
         */
        isLoggedIn(callback?: Function) {
            return Auth.getCurrentUser(undefined)
                .then(user => {
                    let is = _.get(user, 'role');

                    safeCb(callback)(is);
                    return is;
                });
        },

        /**
         * Check if a user is logged in
         *
         * @return {Bool}
         */
        isLoggedInSync() {
            return !!_.get(currentUser, 'role');
        },

        /**
         * Check if a user has a specified role or higher
         *
         * @param  {String}     role     - the role to check against
         * @param  {Function} [callback] - function(has)
         * @return {Promise}
         */
        hasRole(role, callback?: Function) {
            return Auth.getCurrentUser(undefined)
                .then(user => {
                    let has = hasRole(_.get(user, 'role'), role);

                    safeCb(callback)(has);
                    return has;
                });
        },

        /**
         * Check if a user has a specified role or higher
         *
         * @param  {String} role - the role to check against
         * @return {Bool}
         */
        hasRoleSync(role) {
            return hasRole(_.get(currentUser, 'role'), role);
        },

        /**
         * Check if a user is an admin
         *   (synchronous|asynchronous)
         *
         * @param  {Function|*} callback - optional, function(is)
         * @return {Bool|Promise}
         */
        isAdmin(...args) {
            return Auth.hasRole(Reflect.apply([].concat, ['admin'], args));
        },

        /**
         * Check if a user is an admin
         *
         * @return {Bool}
         */
        isAdminSync() {
            // eslint-disable-next-line no-sync
            return Auth.hasRoleSync('admin');
        },

        /**
         * Get auth token
         *
         * @return {String} - a token string used for authenticating
         */
        getToken() {
            return $cookies.get('token');
        }
    };

    return Auth;
}
