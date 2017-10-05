var Promise = require('promise');
var bcrypt = require('bcrypt');
var validator = require('validator');

var UsersModelValidator = class UsersModelValidator {
    /**
     * Validates input for user data then returns user info to be stored
     * @param {*} user 
     */
    static validateUser(user) {
        return new Promise((resolve, reject) => {
            if (!this.validateName(user.firstName)) {
                reject('invalid first name');
            }

            if (!this.validateName(user.lastName)) {
                reject('invalid last name');
            }

            if (!this.validateDisplayName(user.displayName)) {
                reject('invalid display name');
            }

            if (!this.validateEmail(user.email)) {
                reject('invalid email');
            }

            if (!this.validatePassword(user.password)) {
                reject('invalid password, password must me at least 8 characters long');
            }

            if (!this.validateCountry(user.country)) {
                reject('invalid country');
            }

            if (!this.validatePostcode(user.postcode, user.country)) {
                reject('invalid postcode');
            }

            if (!this.validateDateOfBirth(user.dateOfBirth)) {
                reject('invalid date of birth');
            }

            // add postcode validation

            bcrypt.hash(user.password, 1)
                .then((hash) => {
                    resolve({
                        displayName: user.displayName,
                        lastName: user.lastName,
                        firstName: user.firstName,
                        email: user.email,
                        encryptedPassword: hash,
                        dateOfBirth: user.dateOfBirth,
                        country: user.country,
                        postCode: user.postCode
                    });
                })
                .catch(() => {
                    reject('password could not be encrypted');
                });
        });
    }

    /**
     * 
     * @param {string} name 
     */
    static validateName(name) {
        return !!name && 
            name.match(/^[\w]([\w][\.\-\ ]?)+$/i)
    }

    /**
     * 
     * @param {string} displayName 
     */
    static validateDisplayName(displayName) {
        return !!displayName && 
            displayName.match(/^[a-zA-Z0-9_]+$/i)
    }

    /**
     * 
     * @param {string} email 
     */
    static validateEmail(email) {
        return validator.isEmail(email);
    }

    /**
     * 
     * @param {string} country 
     */
    static validateCountry(country) {
        return validator.isLength(country, { min: 2, max: 2 })
            && validator.isAlpha(country);
    }

    static validatePostcode(postcode, country) {
        return validator.isPostalCode(postcode, country);
    }

    /**
     * 
     * @param {string} password 
     */
    static validatePassword(password) {
        return validator.isLength(password, {min:8, max: undefined});
    }

    /**
     * 
     * @param {string} dateOfBirth 
     */
    static validateDateOfBirth(dateOfBirth) {
        return validator.isBefore(dateOfBirth);
    }
    /**
     * Returns a promise that resolves if the clear password matches the user's
     * @param {string} clearPassword 
     * @param {*} user 
     */
    static checkUserPassword(clearPassword, user) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(clearPassword, user.encryptedPassword)
                .then((res) => {
                    if (res === true) {
                        resolve();
                    }
                    else {
                        reject();
                    }
                })
                .catch(reject);
        });
    }
};

module.exports = UsersModelValidator;