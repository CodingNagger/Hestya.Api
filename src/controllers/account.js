

module.exports = (options) => {
    var express = require('express');
    var jwt = require('jsonwebtoken');

    var UserModelValidator = require('../models/validator/users');
    var ProfilesService = require('../services/account/profile')(options.service);

    var account = express();

    account.post("/login", (req, res) => {
        if (!req.body.username || !req.body.password) {
            res.status(401).json({ message: "invalid request" });
            return;
        }

        login(req.body.username, req.body.password, res);
    });

    account.post("/register", (req, res) => {

        console.log('in register')
        UserModelValidator.validateUser(req.body)
            .then((validUserInput) => {
                console.log('user validated')
                ProfilesService.userWithEmailExists(req.body.email)
                    .then((userExists) => {
                        console.log('user retrieved')
                        if (userExists) {
                            console.log('user exists')
                            res.status(400).json({ message: "a user already has this e-mail address" });
                        }
                        else {
                            console.log('user doesnt exist')
                            ProfilesService.saveNewUser(validUserInput)
                                .then(() => {
                                    console.log('start login')
                                    login(req.body.email, req.body.password, res);
                                })
                                .catch((err) => {
                                    console.log('could not persist user ' + err);
                                    res.sendStatus(500);
                                });
                        }
                    });
            })
            .catch((err) => {
                res.status(401).json({ message: "invalid request" });
            });
    });

    function login(username, password, res) {
        console.log('profile service: '+JSON.stringify(ProfilesService));
        ProfilesService.login(username, password)
            .then((token) => {
                console.log('logged in')
                res.json({ token: token });
            })
            .catch((error) => {
                console.log('didnt login: '+error)
                var statusCode = !!error.code ? error.code : 500;
                res.status(statusCode).json({ message: error.message })
            });
    }

    return account;
};