var ExtractJwt = require("passport-jwt").ExtractJwt;

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.JWT_SECRET || '!Qu1=adUC4ca;9uiC0l13?-'; // env variable

module.exports = jwtOptions;