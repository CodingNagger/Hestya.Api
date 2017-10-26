// Tested component
var UserModelValidator = require('../../../src/models/validator/users');

// Dependencies
var assert = require('assert')
var sinon = require('sinon')

describe('models/validator/users', () => {
    it('Validates that actual sample data', (done) => {
        var user = JSON.parse(
            '{"email":"nguelejd@live.fr","country":"GB","password":"totototo","firstName":"Jean-Dominique","lastName":"Nguele","displayName":"JD","dateOfBirth":"1991-02-20","postcode":"se17 2pa"}');

        UserModelValidator.validateUser(user)
        .then((validUser) => {
            assert(user.email === validUser.email, 'wrong email');
            assert(user.dateOfBirth === validUser.dateOfBirth, 'wrong dateOfBirth');
            assert(user.country === validUser.country, 'wrong country');
            done();
        })
        .catch((err) => {
            console.log(err);
            assert(false, err);
            done();
        });
    });

    it('Validates happy path user', (done) => {
        var user = {
            email: 'test@hestya.io',
            password: 'totototo',
            country: 'GB',
            dateOfBirth: '1991-02-20',
            firstName: 'Jean-Dominique',
            lastName: 'Nguele',
            postcode: 'N1 1BA',
            gender: 'm',
        };

        UserModelValidator.validateUser(user)
            .then((validUser) => {
                assert(user.email === validUser.email, 'wrong email');
                assert(user.dateOfBirth === validUser.dateOfBirth, 'wrong dateOfBirth');
                assert(user.country === validUser.country, 'wrong country');
                done();
            })
            .catch((err) => {
                console.log(err);
                assert(false, err);
                done();
            });
    });

    it('Rejects invalid gender', (done) => {
        var user = {
            email: 'test@hestya.io',
            password: 'totototo',
            country: 'GB',
            dateOfBirth: '1991-02-20',
            firstName: 'Jean-Dominique',
            lastName: 'Nguele',
            postcode: 'N1 1BA',
            gender: 'bad',
        };

        UserModelValidator.validateUser(user)
            .then((validUser) => {
                assert.fail('should have failed');
            })
            .catch((err) => {
                done();
            });
    });

    it('Rejects wrong email user', (done) => {
        var user = {
            email: 'test@hestyaio',
            password: 'totototo',
            country: 'GB',
            dateOfBirth: '1991-02-20',
            firstName: 'Jean-Dominique',
            lastName: 'Nguele'
        };

        UserModelValidator.validateUser(user)
            .then((validUser) => {
                assert(false, 'should have failed');
            })
            .catch((err) => {
                done();
            });
    });

    it('Rejects wrong country', (done) => {
        var user = {
            email: 'test@hestya.io',
            password: 'totototo',
            country: 'GB1',
            dateOfBirth: '1991-02-20',
            firstName: 'Jean-Dominique',
            lastName: 'Nguele'
        };

        UserModelValidator.validateUser(user)
            .then((validUser) => {
                assert(false, 'should have failed');
            })
            .catch((err) => {
                done();
            });
    });

    it('Rejects wrong date of birth user', (done) => {
        var user = {
            email: 'test@hestya.io',
            password: 'totototo',
            country: 'GB',
            dateOfBirth: '2600-02-20',
            firstName: 'Jean-Dominique',
            lastName: 'Nguele'
        };

        UserModelValidator.validateUser(user)
            .then((validUser) => {
                assert(false, 'should have failed');
            })
            .catch((err) => {
                done();
            });
    });

    it('Rejects empty password', (done) => {
        var user = {
            email: 'test@hestya.io',
            password: '',
            country: 'GB',
            dateOfBirth: '1991-02-20',
            firstName: 'Jean-Dominique',
            lastName: 'Nguele'
        };

        UserModelValidator.validateUser(user)
            .then((validUser) => {
                assert(false, 'should have failed');
            })
            .catch((err) => {
                done();
            });
    });

    it('Checks user password properly', (done) => {
        var user = {
            encryptedPassword: '$2a$04$l4vE7JFvWhvp/9e5MLwdhOl2lgdUIwPfWLmm.L2ybQp.bt4buR7VC'
        };

        var password = 'totototo';

        UserModelValidator.checkUserPassword(password, user)
            .then(done);
    });
});