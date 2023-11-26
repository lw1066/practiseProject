const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let database;

async function connectToDatabase() {
    try {
        const client = await MongoClient.connect(
            'mongodb+srv://user1:poiuhjkl@rest-test.sl9i8zv.mongodb.net/?retryWrites=true&w=majority'
        );
        database = client.db('project-practise');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        // Handle the error here, you might want to throw it or perform other actions
        throw error; // You can choose to rethrow the error or handle it differently
    }
}

function getDb() {
    if (!database) {
        throw { message: 'You must connect first' };
    }
    return database;
}

module.exports = {
    connectToDatabase: connectToDatabase,
    getDb: getDb
};
