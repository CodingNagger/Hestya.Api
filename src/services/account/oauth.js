module.exports = (options) => {
    
    var jwt = require('jsonwebtoken');
    
    // user service to get user
    return class OauthService {
        static generateRefreshToken(userId) {
            return new Promise((resolve, reject) => {
                options.mongo.connect()
                    .then((db) => {
                        db.collection(options.mongo.collectionNames.refreshToken)
                            .insertOne({ userId: userId })
                            .then((result) => {
                                resolve(result.insertedId.str);
                            });
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        }

        static getUserIdForRefreshToken(refreshToken) {
            options.mongo.connect()
                .then((db) => {
                    db.collection(options.mongo.collectionNames.refreshToken)
                        .findOne({ _id: new options.mongo.ObjectID(refreshToken) })
                        .then((tokenEntry) => {
                            resolve(tokenEntry.userId);
                        });
                })
                .catch((err) => {
                    reject(err);
                });
        }

        static deleteRefreshToken(refreshToken) {
            options.mongo.connect()
                .then((db) => {
                    db.collection(options.mongo.collectionNames.refreshToken)
                        .deleteOne({ _id: new options.mongo.ObjectID(refreshToken) })
                        .then(() => {
                            resolve();
                        });
                })
                .catch((err) => {
                    reject(err);
                });
        }

        static generateCredentials(userId) {
            return new Promise((resolve, reject) => {
                console.log('inside generateCredentials')

                var payload = options.authUtils.generatePayload({ id: userId });
                var token = jwt.sign(payload, options.jwt.secretOrKey);

                console.log('after payload generation')

                this.generateRefreshToken(userId)
                    .then((refreshToken) => {
                        console.log('refresh generated');
                        resolve({ token: token, refreshToken: refreshToken });
                    })
                    .catch((err) => {
                        console.log('refresh generation failed');
                        resolve({ token: token });
                    });
            });
        }
    };
};