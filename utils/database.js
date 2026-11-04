require("dotenv").config();

const { MongoClient } = require("mongodb");

const MONGO_URL = process.env.MONGODB_URL;

let _db;

const mongoConnect = (callback) => {

    console.log("Connecting to MongoDB...");

    const client = new MongoClient(MONGO_URL, {
        serverSelectionTimeoutMS: 10000,
        family: 4,
        tls: true
    });

    client.connect()
        .then(() => {

            console.log("Connected to MongoDB ✅");

            _db = client.db("airbnb");

            callback(client);

        })
        .catch(err => {

            console.log("Error while connecting to Mongo :", err);

        });
};

const getDB = () => {

    if (!_db) {
        throw new Error("Mongo not connected");
    }

    return _db;
};

module.exports = {
    mongoConnect,
    getDB
};