'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

function validationError(res, statusCode) {
    statusCode = statusCode || 422;
    return function(err) {
        return res.status(statusCode).json(err);
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        return res.status(statusCode).send(err);
    };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
    return User.find({}, '-salt -password').exec()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res) {
    var newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.role = 'user';
    newUser.save()
        .then(function(user) {
            var token = jwt.sign({ _id: user._id }, config.secrets.session, {
                expiresIn: 60 * 60 * 5
            });
            res.json({ token });
        })
        .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
    var userId = req.params.id;

    return User.findById(userId).exec()
        .then(user => {
            if(!user) {
                return res.status(404).end();
            }
            res.json(user.profile);
        })
        .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
    return User.findByIdAndRemove(req.params.id).exec()
        .then(function() {
            res.status(204).end();
        })
        .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
    var userId = req.user._id;
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    return User.findById(userId).exec()
        .then(user => {
            if(user.authenticate(oldPass)) {
                user.password = newPass;
                return user.save()
                    .then(() => {
                        res.status(204).end();
                    })
                    .catch(validationError(res));
            } else {
                return res.status(403).end();
            }
        });
}

function changeUserParam(req, changer) {
     var userId = req.user._id;

    return User.findById(userId).exec()
        .then(user => {
            changer(user, req);
            return user.save()
                .then(() => {
                    res.status(204).end();
                })
                .catch(validationError(res));
        });
}

export function setBio(req, res) {
    return changeUserParam(req, (user) => {
        user.bio = String(req.body.bio);
    });
}

export function setFullName(req, res) {
    return changeUserParam(req, (user) => {
        user.fullName = String(req.body.fullName);
    });
}

export function setSymb(req, res) {
    return changeUserParam(req, (user) => {
        user.symb = String(req.body.symb);
    });
}

export function setStockTx(req, res) {
    return changeUserParam(req, (user) => {
        user.stockTx = String(req.body.stockTx);
    });
}

export function setDecimals(req, res) {
    return changeUserParam(req, (user) => {
        user.decimals = String(req.body.decimals);
    });
}

export function setTotal(req, res) {
    return changeUserParam(req, (user) => {
        user.total = String(req.body.total);
    });
}

export function setStockExpire(req, res) {
    return changeUserParam(req, (user) => {
        user.stockExpire = String(req.body.stockExpire);
    });
}

export function setImg(req, res) {
    return changeUserParam(req, (user) => {
        user.img = String(req.body.img);
    });
}

//TODO: validate stock address
export function setStockAddress(req, res) {
    var userId = req.user._id;
    var stockAddress = String(req.body.stockAddress);

    try {
        return changeUserParam(req, (user) => {
            if((user.stockAddress || '') == '') {
                user.stockAddress = stockAddress;
            } else {
                throw 'stockAddressAlreadySet';
            }
        });
    } catch(error) {
        console.log(error);
        return res.status(403).end();
    }
}

/**
 * Get my info
 */
export function me(req, res, next) {
    var userId = req.user._id;

    return User.findOne({ _id: userId }, '-salt -password').exec()
        .then(user => { // don't ever give out the password or salt
            if(!user) {
                return res.status(401).end();
            }
            res.json(user);
        })
        .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
    res.redirect('/');
}
