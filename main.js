var throng = require('throng');
var express = require('express');
var bodyParser = require('body-parser');

var jwt = require('jsonwebtoken');

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'tasmanianDevil'; // env variable

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);

  var user = {id: 316}; // get user id, maybe get roles there (isParent, isNanny, etc), display first names
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);

var app = express();
app.use(passport.initialize());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {
  if (req.header('plot') !== 'twist') { // for api protection 
      res.sendStatus(403); 
      return;
  }

  next()
})

// custom headers client call: https://github.com/request/request#custom-http-headers

// auth => https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/

app.get('/', (req, res) => {
  res.send('Hello');
});

app.post("/login", (req, res) => {
  if(req.body.name && req.body.password){
    var name = req.body.name;
    var password = req.body.password;
  }
  // usually this would be a database call:
  var user = {id: 316};
  if (!user) {
    res.status(401).json({message:"no such user found"});
  }

  if(true) { // password check
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    var payload = {id: user.id};
    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({message: "ok", token: token});
  } else {
    res.status(401).json({message:"passwords did not match"});
  }
});

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