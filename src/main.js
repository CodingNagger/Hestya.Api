var throng = require('throng');
var express = require('express');
var bodyParser = require('body-parser');

var jwtOptions = require('./configuration/jwtOptions');

// consts
var ApiProtectionKey = 'H34cUle$';

// controllers
var account = require('./controllers/account');

var passport = require("passport");
passport.use(account.strategy);

passport.serializeUser(function(user, done) {
  delete user._id;
  delete user.encryptedPassword;

  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var app = express();
app.use(passport.initialize());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log('something something')
  if (process.env.DEV !== 1 // check if debugging
    && process.env.PRODUCTION !== 1 // check if production
    && (
      req.header('X-Forwarded-For') &&
      !process.env.ALLOWED_IPS.includes(req.header('X-Forwarded-For')))) { // for api protection 
    res.sendStatus(403);
    return;
  }

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  next();
});


app.use('/account', account.api);

// custom headers client call: https://github.com/request/request#custom-http-headers

// auth => https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/

// Use Bearer : Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzE2LCJpYXQiOjE1MDU0MDc1Njh9.uIDStet-eAuroCdiAGFHPlm6NdPZSgqLJh5TWWb5MpM
app.get("/me", passport.authenticate('jwt', { session: true }), (req, res) => {
  console.log('getting user details: '+JSON.stringify(req.user));
  res.json(req.user);
});

function start() {
  var port = process.env.PORT || 8888;

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