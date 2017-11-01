var UserModelValidator = require('../../models/validator/users');
var RolesValidator = require('../../models/validator/roles');
var jwt = require('jsonwebtoken');

module.exports = (options) => {
    var OauthService = require('./oauth')(options);

    // user service to get user
    return class ProfilesService {

        /**
         * 
         * @param {object} payload 
         */
        static validateUserFromPayload(payload) {
            if (options.authUtils.validatePayload(payload)) {
                return this.getUserById(payload.id);
            }
            
            return Promise.reject('Validation failed for payload: '+JSON.stringify(payload));
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
                                        console.log('password ok');
                                        OauthService.generateCredentials(user._id)
                                            .then((credentials) => resolve(credentials))
                                            .catch((err) => { message: "failed to generate credentials" })
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
                                db.close();
                                resolve(!!user);
                            })
                            .catch((err) => {
                                db.close();
                                resolve(false);
                            });
                    })
                    .catch((err) => {
                        db.close();
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
                                db.close();
                                resolve(result.insertedId);
                            })
                    })
                    .catch((err) => {
                        db.close();
                        reject(err);
                    });
            });
        }

        static getUserById(userId) {
            return new Promise((resolve, reject) => {
                options.mongo.connect()
                    .then((db) => {
                        db.collection(options.mongo.collectionNames.profile)
                            .findOne({ _id: new options.mongo.ObjectID(userId) })
                            .then((loadedUser) => {
                                db.close();
                                resolve(loadedUser);
                            })
                            .catch((err) => {
                                db.close();
                                reject(err);
                            });
                    })
                    .catch((err) => {
                        db.close();
                        reject(err);
                    });
            });
        }

        static sanitizeUserProperties(userProperties) {

            var sanitizedProperties = {};
             
            sanitizedProperties['roles'] = RolesValidator.validateRoles(userProperties.roles);

            delete userProperties.roles;

            // sanitize rest of properties with a check on whether the properties are legal
            // define array of legal properties somewhere and use includes to check
            for (var key in userProperties) {
                // if legal then set property
                sanitizedProperties[key] = userProperties[key];
            }

            return sanitizedProperties;
        }

        static updateUser(query, userProperties) {
            return new Promise((resolve, reject) => {
                var propertiesToUpdate = this.sanitizeUserProperties(userProperties);
                
                            if (Object.keys(propertiesToUpdate).length === 0) {
                                reject('No valid properties to update');
                                return;
                            }
                
                            var update = (user) => {
                                for (var key in propertiesToUpdate) {
                                    user[key] = propertiesToUpdate[key];
                                }
                
                                options.mongo.connect()
                                    .then((db) => {
                                        db.collection(options.mongo.collectionNames.profile).save(user)
                                            .then((result) => {
                                                db.close();
                                                console.log('updated user')
                                                resolve(result);
                                            })
                                    })
                                    .catch((err) => {
                                        db.close();
                                        reject(err);
                                    });
                            };
                
                            if (!!query.user) {
                                update(query.user);
                            }
                            else if (!!query.userId) {
                                this.getUserById(query.userId)
                                    .then((loadedUser) => {
                                        update(loadedUser);
                                    })
                                    .catch((err) => {
                                        reject('user not found');
                                    })
                            }
                            else reject('invalid query');
            });
        }
    };
};