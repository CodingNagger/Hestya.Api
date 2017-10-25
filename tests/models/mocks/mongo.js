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
            save: () => {
                return {
                    then: (cb) => {
                        cb();
                    },
                };
            }
        };
    }
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
    }
}