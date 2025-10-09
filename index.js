const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function main() {
  try {
    //await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("testDB");
    const collection = db.collection("users");

    const result = await collection.insertOne({ name: "Alice", age: 25 });
    console.log("Inserted document:", result.insertedId);

    const docs = await collection.find().toArray();
    console.log("All documents:", docs);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
