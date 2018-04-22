'use strict';

export function UserResource($resource) {
    'ngInject';
    return $resource('/api/users/:id/:controller', {
        id: '@_id'
    }, {
        changePassword: {
            method: 'PUT',
            params: {
                controller: 'password'
            }
        },
        get: {
            method: 'GET',
            params: {
                id: 'me'
            }
        },
        setFullName: {
            method: 'PUT',
            params: {
                controller: 'fullname'
            }
        },
        setBio: {
            method: 'PUT',
            params: {
                controller: 'bio'
            }
        },
        setSymb: {
            method: 'PUT',
            params: {
                controller: 'symb'
            }
        },
        setStockAddress: {
            method: 'PUT',
            params: {
                controller: 'stockaddress'
            }
        },
        setStockTx: {
            method: 'PUT',
            params: {
                controller: 'stocktx'
            }
        },
        setDecimals: {
            method: 'PUT',
            params: {
                controller: 'decimals'
            }
        },
        setTotal: {
            method: 'PUT',
            params: {
                controller: 'total'
            }
        },
        setStockExpire: {
            method: 'PUT',
            params: {
                controller: 'stockexpire'
            }
        },
        setImg: {
            method: 'PUT',
            params: {
                controller: 'img'
            }
        }
    });
}
