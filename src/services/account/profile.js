var UserModelValidator = require('../../models/validator/users');
var jwt = require('jsonwebtoken');

module.exports = (options) => {
    // user service to get user
    return class ProfilesService {

        /**
         * 
         * @param {object} payload 
         */
        static validateUserFromPayload(payload) {
            console.log('validateUserFromPayload')
            return new Promise((resolve, reject) => {
                if (options.authUtils.validatePayload(payload)) {
                    options.mongo.connect()
                        .then((db) => {
                            db.collection(options.mongo.collectionNames.profile)
                                .findOne({ _id: new options.mongo.ObjectID(payload.id) })
                                .then((user) => {
                                    console.log('user found ' + user);
                                    db.close();
                                    resolve(user);
                                })
                                .catch((err) => {
                                    console.log('cannot find user ' + err);
                                    db.close();
                                    reject();
                                });
                        })
                        .catch((err) => {
                            console.log('cannot connect to mongodb ' + err);
                            reject();
                        });
                }
                else {
                    console.log('other error')
                    reject();
                }
            });
        }

        static login(username, password) {
            console.log('login');
            return new Promise((resolve, reject) => {
                console.log('created promise');
                options.mongo.connect()
                    .then((db) => {
                        console.log('got the db');
                        db.collection(options.mongo.collectionNames.profile)
                            .findOne(
                            { email: username },
                            { fields: { _id: 1, encryptedPassword: 1 } })
                            .then((user) => {

                                db.close();

                                if (!user) {
                                    console.log('cannot find user ' + username);
                                    reject({ code: 401, message: "no such user found" });
                                    return;
                                }

                                console.log('login ' + JSON.stringify(user));
                                UserModelValidator.checkUserPassword(password, user)
                                    .then(() => {
                                        console.log('id ' + user._id);
                                        var payload = options.authUtils.generatePayload({ id: user._id });
                                        var token = jwt.sign(payload, options.jwt.secretOrKey);
                                        resolve(token);
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        reject({ code: 401, message: "passwords did not match" });
                                    })
                            })
                            .catch((err) => {
                                console.log('cannot find user ' + err);
                                db.close();
                                reject({ code: 401, message: "no such user found" });
                            });
                    })
                    .catch((err) => {
                        console.log('no db ' + JSON.stringify(err))
                        reject({ code: 500, message: "cannot connect to db" });
                    })
            });
        }

        static userWithEmailExists(email) {
            return new Promise((resolve, reject) => {
                options.mongo.connect()
                    .then((db) => {
                        db.collection(options.mongo.collectionNames.profile).findOne({ email: email })
                            .then((user) => {
                                resolve(!!user);
                            })
                            .catch((err) => {
                                resolve(false);
                            });
                    })
                    .catch((err) => {
                        reject(err);
                    })
            });
        }

        static saveNewUser(user) {
            return new Promise((resolve, reject) => {
                options.mongo.connect()
                .then((db) => {
                    db.collection(options.mongo.collectionNames.profile).insertOne(user)
                        .then((result) => {
                            resolve(result.insertedId);
                        })
                })
                .catch((err) => {
                    reject(err);
                });
            });
        }
    };
};