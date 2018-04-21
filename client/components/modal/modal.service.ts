'use strict';
const angular = require('angular');
declare var Reflect: any;

export function Modal($rootScope, $uibModal, localStorageService, node, toastr) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $uibModal.open() returns
     */
    function openModal(scope = {}, modalClass = 'modal-default', template = require('./modal.html')) {
        var modalScope = $rootScope.$new();

        angular.extend(modalScope, scope);

        return $uibModal.open({
            template: template,
            windowClass: modalClass,
            scope: modalScope
        });
    }


    // Public API here
    return {

        /* Confirmation modals */
        confirm: {

            //TODO: check for pending stocks on startup
            newToken() {
                var modal = openModal({
                    modal: {
                        dismissable: false,
                        title: 'Creating stock',
                        html: 'Creating your stock',
                        buttons: []
                    }
                }, 'modal-success');

                function removeStock(txHash) {
                    var stocks = JSON.parse(localStorageService.get('pendingStocks') || '{}');
                    delete stocks[txHash];
                    localStorageService.set('pendingStocks', JSON.stringify(stocks));
                }

                function checkPendingStock(txHash: string, startDate) {
                    if(startDate > (new Date()).getTime() - 1000 * 60 * 60 * 24 * 2) {
                        node.getReceipt(txHash, (err, res) => {
                            if(res) {
                                if(!res.contractAddress) {
                                    toastr.error('error creating stock, no contract address on transaction receipt');
                                } else {
                                    toastr.success('Stock created successfully.');
                                    removeStock(txHash);
                                    modal.close();
                                }
                            }
                            else {
                                setTimeout(() => { checkPendingStock( txHash, startDate); }, 5000);
                            }
                        });
                    } else {
                        removeStock(txHash);
                    }
                }

                function checkPendingStocks() {
                    var stocks = JSON.parse(localStorageService.get('pendingStocks') || '{}');
                    for(var key in stocks) {
                        if(stocks.hasOwnProperty(key)) { //give it two days
                            checkPendingStock(key, stocks[key]);        
                        }
                    }
                }

                checkPendingStocks();

                modal.result.then(()=>{});
            },

            /**
             * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
             * @param  {Function} del - callback, ran when delete is confirmed
             * @return {Function}     - the function to open the modal (ex. myModalFn)
             */
            delete(del = angular.noop) {
                /**
                 * Open a delete confirmation modal
                 * @param  {String} name   - name or info to show on modal
                 * @param  {All}           - any additional args are passed straight to del callback
                 */
                return function(...args) {
                    var slicedArgs = Reflect.apply(Array.prototype.slice, args);
                    var name = slicedArgs.shift();
                    var deleteModal;

                    deleteModal = openModal({
                        modal: {
                            dismissable: true,
                            title: 'Confirm Delete',
                            html: '<p>Are you sure you want to delete <strong>' + name + '</strong> ?</p>',
                            buttons: [{
                                classes: 'btn-danger',
                                text: 'Delete',
                                click: function(e) {
                                    deleteModal.close(e);
                                }
                            }, {
                                classes: 'btn-default',
                                text: 'Cancel',
                                click: function(e) {
                                    deleteModal.dismiss(e);
                                }
                            }]
                        }
                    }, 'modal-danger');

                    deleteModal.result.then(function(event) {
                        Reflect.apply(del, event, slicedArgs);
                    });
                };
            }
        },

        password(cb) {
            var scope = { 
                modal: {
                    password: null, 
                    unlock: false,
                    buttons: [{
                        classes: 'btn-success',
                        text: 'Submit',
                        click: function(e) {
                            pwdModal.close(e);
                        }
                    }, {
                        classes: 'btn-default',
                        text: 'Cancel',
                        click: function(e) {
                            pwdModal.dismiss(e);
                        }
                    }]
                }
            };
            var pwdModal = openModal(scope, 'model-default', require('./password.html'));
            pwdModal.result.then(function(event) {
                cb(scope.modal.password, scope.modal.unlock);
            });
        }
    };
}

export default angular.module('youStockApp.Modal', [])
    .factory('Modal', Modal)
    .name;
