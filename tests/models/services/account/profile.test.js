
// Dependencies
var assert = require('assert')
var sinon = require('sinon')

process.on('unhandledRejection', (reason, promise) => {
    console.log(JSON.stringify(promise));
    throw reason;
});

describe('services/account/profile', () => {
    it('sanitizeUserProperties returns same as input for valid user', () => {
        var role = 'nanny';
        var user = { roles: { [role]: {} } };
        var userJson = JSON.stringify(user);

        var ProfileService = require('../../../../src/services/account/profile')({});

        var result = ProfileService.sanitizeUserProperties(user);

        assert.equal(JSON.stringify(result), userJson, 'hasRole should return true');
    });
});