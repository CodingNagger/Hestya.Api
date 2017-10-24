var UserModelValidator = require('../../models/validator/users');
var authorizedRoles = ['parent', 'nanny', 'aupair', 'babysitter'];

module.exports = (options) => {
    var ProfilesService = !!options.services && !!options.services.ProfilesService ?
        options.services.ProfilesService :
        require('./profile')(options);

    // user service to get user
    return class RolesService {
        static hasRole(user, role) {
            return !!user.roles && !!user.roles[role];
        }

        static addRole(user, role) {
            return new Promise((resolve, reject) => {
                if (this.hasRole(user, role)) {
                    reject('User is already a ' + role);
                }
                else if (authorizedRoles.includes(role)) {
                    options.mongo.connect()
                        .then((db) => {
                            console.log('got the db');
                            db.collection(options.mongo.collectionNames.profile)
                                .findOne({ email: user.email })
                                .then((loadedUser) => {
                                    if (!loadedUser.roles) {
                                        loadedUser.roles = {};
                                    }

                                    loadedUser.roles[role] = {};

                                    db.collection(options.mongo.collectionNames.profile).save(loadedUser)
                                        .then((result) => {
                                            resolve();
                                        })
                                })
                                .catch((err) => {
                                    db.close();
                                    reject(err);
                                });
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
                else {
                    reject('Invalid role');
                }
            });
        }
    };
};