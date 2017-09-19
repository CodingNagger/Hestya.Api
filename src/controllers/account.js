var express = require('express');
var mongodb =  require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;
var jwt = require('jsonwebtoken');

var MongoDbUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/hestya';
var UsersCollectionName = process.env.MONGODB_USERS || 'users';

var UserModelValidator = require('../models/validator/users');

var JwtStrategy = require("passport-jwt").Strategy;
var jwtOptions = require('../configuration/jwtOptions');

var strategy = new JwtStrategy(jwtOptions, function (jwtPayload, next) {
    console.log('payload received', jwtPayload);

    MongoClient.connect(MongoDbUrl)
        .then((db) => {
            db.collection(UsersCollectionName).findOne({ _id: new ObjectId(jwtPayload.id) })
                .then((user) => {
                    console.log('user found '+user);
                    db.close();
                    next(null, user);
                })
                .catch((err) => {
                    console.log('cannot find user ' + err);
                    db.close();
                    next(null, false);
                });
        })
        .catch((err) => {
            console.log('cannot connect to mongodb ' + err);
            next(null, false);
        });
});

var account = express();

account.post("/login", (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(401).json({ message: "invalid request" });
        return;
    }

    MongoClient.connect(MongoDbUrl)
        .then((db) => {
            db.collection(UsersCollectionName)
                .findOne(
                { email: req.body.email },
                { fields: { _id: 1, encryptedPassword: 1 } })
                .then((user) => {
                    console.log('login '+user);
                    db.close();
                    UserModelValidator.checkUserPassword(req.body.password, user)
                        .then(() => {
                            console.log('id '+user._id);
                            var payload = { id: user._id };
                            var token = jwt.sign(payload, jwtOptions.secretOrKey);
                            res.json({ token: token });
                        })
                        .catch(() => {
                            res.status(401).json({ message: "passwords did not match" });
                        })
                })
                .catch((err) => {
                    console.log('cannot find user ' + err);
                    db.close();
                    res.status(401).json({ message: "no such user found" });
                });
        })
        .catch((err) => {
            res.status(500).json({ message: "cannot connect to db" });
        })
});

account.post("/register", (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(401).json({ message: "invalid request" });
        return;
    }

    MongoClient.connect(MongoDbUrl)
        .then((db) => {
            db.collection(UsersCollectionName).findOne({ email: req.body.email })
                .then((user) => {
                    console.log(user);

                    if (!user) {
                        UserModelValidator.validateUser(req.body)
                            .then((user) => {
                                db.collection(UsersCollectionName).insertOne(user)
                                    .then((result) => {
                                        var payload = { id: result.insertedId };
                                        var token = jwt.sign(payload, jwtOptions.secretOrKey);
                                        res.status(201).json({ token: token });
                                    })
                                    .catch((err) => {
                                        console.log('could not persist user ' + err);
                                        res.sendStatus(500);
                                    });
                            })
                            .catch((errorMessage) => {
                                res.status(400).json({ message: errorMessage });
                            });
                    }
                    else {
                        res.status(400).json({ message: "a user already has this e-mail address" });
                    }
                })
                .catch((err) => {
                    db.close();
                    console.log(err);
                    res.sendStatus(500);
                });
        })
        .catch((err) => {
            res.status(500).json({ message: "cannot connect to db" });
        })
});

module.exports = {
    api: account,
    strategy: strategy
};