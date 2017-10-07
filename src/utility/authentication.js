var loginValidityInMilliseconds = 86400000;

module.exports = {
    generatePayload: (user) => {
        return { id: user.id, lastLogin: new Date().getTime() }
    },
    validatePayload: (payload) => {
        return new Date().getTime() - payload.lastLogin < loginValidityInMilliseconds
    }
}