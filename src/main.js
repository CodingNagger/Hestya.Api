var throng = require('throng');
var express = require('express');
var bodyParser = require('body-parser');

// consts
var ApiProtectionKey = 'H34cUle$';

// controllers
var account = require('./controllers/account');

var passport = require("passport");
passport.use(account.strategy);

var app = express();
app.use(passport.initialize());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
app.use((req, res, next) => {
  if (req.header('X-Hestya-Api-Key') !== ApiProtectionKey) { // for api protection 
    res.sendStatus(403);
    return;
  }
  next();
});
*/

app.use('/account', account.api);

// custom headers client call: https://github.com/request/request#custom-http-headers

// auth => https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/

// Use Bearer : Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzE2LCJpYXQiOjE1MDU0MDc1Njh9.uIDStet-eAuroCdiAGFHPlm6NdPZSgqLJh5TWWb5MpM
app.get("/secret", passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json("Success! You can not see this without a token. Authenticated user id is:" + req.user.id);
});

function start() {
  var port = process.env.PORT || 8080;

  var server = app.listen(port, () => {

    var host = server.address().address;
    var port = server.address().port;

    console.log("Hestya listening at http://%s:%s", host, port);
  })
}

var WORKERS = process.env.WEB_CONCURRENCY || 1;

throng({
  workers: WORKERS,
  lifetime: Infinity
}, start);

module.exports = app;