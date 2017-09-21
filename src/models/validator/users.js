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
            if (!this.validateDisplayName(user.displayName)) {
                reject('invalid name');
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

            if (!this.validateDateOfBirth(user.dateOfBirth)) {
                reject('invalid date of birth');
            }

            bcrypt.hash(user.password, 1)
                .then((hash) => {
                    resolve({
                        displayName: user.displayName,
                        email: user.email,
                        encryptedPassword: hash,
                        dateOfBirth: user.dateOfBirth,
                        country: user.country
                    });
                })
                .catch(() => {
                    reject('password could not be encrypted');
                });
        });
    }

    /**
     * 
     * @param {string} displayName 
     */
    static validateDisplayName(displayName) {
        return !!displayName && 
            displayName.match(/^[\w]([\w][\.\-\ _]?)+$/i)
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