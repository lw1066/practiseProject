const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let database;

async function connectToDatabase() {
    const client = await MongoClient.connect(
        'mongodb+srv://user1:-pl,mko0@rest-test.sl9i8zv.mongodb.net/?retryWrites=true&w=majority'
    );
    database = client.db('project-practise')
};

function getDb() {
    if(!database) {
        throw {message: 'you must connect first'};
    }
    return database; 
};

module.exports = {
    connectToDatabase: connectToDatabase,
    getDb: getDb
};
