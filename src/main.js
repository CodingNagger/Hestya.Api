var throng = require('throng');
var express = require('express');
var bodyParser = require('body-parser');

process.on('unhandledRejection', (reason, promise) => { 
  console.log(JSON.stringify(promise));
  throw reason;
 });

var jwtOptions = require('./configuration/jwtOptions');

var AuthenticationUtilities = require('./utility/authentication');

var serviceOptions = {
  mongo: require('./configuration/mongoConnector'),
  authUtils: AuthenticationUtilities,
  jwt: jwtOptions,
}

var ProfilesService = require('./services/account/profile')(serviceOptions);

var JwtStrategy = require("passport-jwt").Strategy;

var strategy = new JwtStrategy(jwtOptions, function (jwtPayload, next) {
    console.log('payload received', jwtPayload);

    ProfilesService.validateUserFromPayload(jwtPayload)
        .then((user) => next(null, user))
        .catch(() => next(null, false));
});

// consts
var ApiProtectionKey = 'H34cUle$';

// passport
var passport = require("passport");
passport.use(strategy);

passport.serializeUser(function(user, done) {
  delete user.encryptedPassword;

  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var apiOptions = {
  service: serviceOptions,
  authenticator: passport.authenticate('jwt', { session: true }),
};


// controllers
var account = require('./controllers/account')(apiOptions);
var profile = require('./controllers/profile')(apiOptions);

// api
var app = express();
app.use(passport.initialize());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
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

app.use('/account', account);
app.use('/me', profile);

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