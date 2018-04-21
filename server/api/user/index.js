'use strict';

import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/bio', auth.isAuthenticated(), controller.setBio);
router.put('/:id/fullname', auth.isAuthenticated(), controller.setFullName);
router.put('/:id/symb', auth.isAuthenticated(), controller.setSymb);
router.put('/:id/stocktx', auth.isAuthenticated(), controller.setStockTx);
router.put('/:id/stockaddress', auth.isAuthenticated(), controller.setStockAddress);
router.put('/:id/decimals', auth.isAuthenticated(), controller.setDecimals);
router.put('/:id/total', auth.isAuthenticated(), controller.setTotal);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

module.exports = router;
