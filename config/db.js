const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let database = client.db('EduQuest')

if(process.env.NODE_ENV === "test"){
  database = client.db("PintarLabsTest")
}

module.exports = database
