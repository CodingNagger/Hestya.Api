var mongodb =  require('mongodb');

class MongoConnector {
    constructor() {
        this._client = mongodb.MongoClient;
        this._dbUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/hestya';
    }

    connect() {
        return this._client.connect(this._dbUrl);
    }

    get ObjectID() {
        return mongodb.ObjectID;
    }
}

module.exports = new MongoConnector();