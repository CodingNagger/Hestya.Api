
// Dependencies
var assert = require('assert')
var sinon = require('sinon')

process.on('unhandledRejection', (reason, promise) => {
    console.log(JSON.stringify(promise));
    throw reason;
});



describe('services/account/roles', () => {
    it('hasRole returns true when user has the role', () => {
        var role = 'nanny';
        var user = { roles: { [role]: {} } };

        var RolesServices = require('../../../../src/services/account/roles')({});

        var result = RolesServices.hasRole(user, role);

        assert.equal(result, true, 'hasRole should return true');
    });

    it('addRole should not try to add role if role exists', (done) => {
        var role = 'nanny';
        var user = { roles: { [role]: {} } };

        var RolesServices = require('../../../../src/services/account/roles')({});

        RolesServices.addRole(user, role)
            .then(() => { assert.fail() })
            .catch(() => done());
    });

    it('addRole should add role if role is not set', (done) => {
        var role = 'nanny';
        var user = { roles: {} };

        var RolesServices = require('../../../../src/services/account/roles')({
            mongo: require('../../mocks/mongo'),
        });

        RolesServices.addRole(user, role)
            .then(() => { done() })
            .catch((err) => { assert.fail() });
    });

    it('addRole should add role even if roles global doesn\'t exist', (done) => {
        var role = 'nanny';
        var user = {};

        var RolesServices = require('../../../../src/services/account/roles')({
            mongo: require('../../mocks/mongo'),
        });

        RolesServices.addRole(user, role)
            .then(() => { done() })
            .catch(() => { assert.fail() });
    });

    it('addRole should not add invalid role', (done) => {
        var invalidRole = 'trololo';
        var user = { roles: {} };

        var RolesServices = require('../../../../src/services/account/roles')({
            mongo: {

            }
        });

        RolesServices.addRole(user, invalidRole)
            .then(() => { assert.fail() })
            .catch(() => { done() });
    });
});