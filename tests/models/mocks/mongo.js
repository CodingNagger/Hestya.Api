var db = {
    collection: (col) => {
        return {
            findOne: () => {
                return {
                    then: (cb) => {
                        cb({});
                    },
                };
            },
            save: (param) => {
                return {
                    then: (cb) => {
                        cb(param);
                    },
                };
            }
        };
    },
    close: () => {},
}

module.exports = {
    connect: () => {
        return {
            then: (callback) => {
                callback(db);
            },
        }
    },
    collectionNames: {
        profile: 'profile',
    },
    ObjectID: class {},
}