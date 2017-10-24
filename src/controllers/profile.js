var express = require('express');

module.exports = (options) => {
    var RolesService = require('../services/account/roles')(options.service);

    var profile = express();
    
    profile.get("/", options.authenticator, (req, res) => {
        console.log('getting user details: ' + JSON.stringify(req.user));
        res.json(req.user);
    });

    profile.post("/roles", options.authenticator, (req, res) => {
        console.log('role received: ' + JSON.stringify(req.body.role));
        RolesService.addRole(req.user, req.body.role)
            .then(() => {
                console.log('role added');
                res.json({});
            })
            .catch((err) => {
                console.log('fail: '+err);
                res.sendStatus(500);
            });
    });

    return profile;
};