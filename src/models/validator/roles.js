var authorizedRoles = ['parent', 'nanny', 'aupair', 'babysitter'];

module.exports = class RolesValidator {
    static isRoleKeyValid(role) {
        return authorizedRoles.includes(role);
    }

    static validateRoles(roles) {
        console.log('roles: '+JSON.stringify(roles))
        var validRoles = {};

        for (var key in roles) {
            if (this.isRoleKeyValid(key)) {
                validRoles[key] = roles[key];
            }
        }

        return validRoles;
    }
};