var express = require('express');
var mongodb =  require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;

module.exports = (options) => {
    var profile = express();
    
    profile.get("/", options.authenticator, (req, res) => {
        console.log('getting user details: ' + JSON.stringify(req.user));
        res.json(req.user);
    });

    profile.post("/roles", options.authenticator, (req, res) => {
        console.log('role received: ' + JSON.stringify(req.body.role));
        res.end();
    });

    return profile;
};