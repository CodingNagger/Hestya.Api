var RoleValidator = require('../../models/validator/roles');
var authorizedRoles = ['parent', 'nanny', 'aupair', 'babysitter'];

module.exports = (options) => {

    var ProfilesService = require('./profile')(options);

    return class RolesService {
        static hasRole(user, role) {
            console.log('hasRole ('+role+'): '+JSON.stringify(user))
            return !!user.roles && !!user.roles[role];
        }

        static addRole(userId, role) {
            return new Promise((resolve, reject) => {
                if (RoleValidator.isRoleKeyValid(role)) {
                    ProfilesService.getUserById(userId)
                        .then((loadedUser) => {
                            console.log('found user');
                            if (!loadedUser.roles) {
                                loadedUser.roles = {};
                            }
                            else if (this.hasRole(loadedUser, role)) {
                                reject('User is already a ' + role);
                            }

                            loadedUser.roles[role] = {};

                            ProfilesService.updateUser({ user: loadedUser }, loadedUser)
                                .then((result) => {
                                    console.log('save user')
                                    resolve(result);
                                })
                        })
                        .catch((err) => {
                            console.log('err' + err)
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