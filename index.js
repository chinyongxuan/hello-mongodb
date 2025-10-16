const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const drivers = [ 
  { 
    name: "John Doe", 
    vehicleType: "Sedan", 
    isAvailable: true, 
    rating: 4.8 
  },
  { 
    name: "Alice Smith", 
    vehicleType: "SUV", 
    isAvailable: false, 
    rating: 4.5 
  },
  { 
    name: "Bob Johnson", 
    vehicleType: "Truck", 
    isAvailable: true, 
    rating: 4.2 
  }
];

console.log(drivers);

// Read & Display Name
drivers.forEach(driver => { 
  console.log(driver.name); 
});

async function main() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        const db = client.db("testDB");
        const driversCollection = db.collection("drivers");
        
        // Create
        const result = await driversCollection.insertMany(drivers);
        console.log("New driver created with result: ", result);

        // Update
        const updateResult = await db.collection("drivers").updateOne(
            { name: "John Doe" },
            { $inc: { rating: 0.1 } }
        );
        console.log("Updated driver rating with result: ", updateResult);

        // Delete
        const deleteResult = await db.collection("drivers").deleteOne({ isAvailable: false });
        console.log("Deleted driver with result: ", deleteResult);

        // Query
        const availableDrivers = await driversCollection.find({
            isAvailable: true,
            rating: { $gte: 4.5 }
        }).toArray();
        console.log("Available drivers with rating >= 4.5:", availableDrivers);
    }
    finally {
        await client.close();
        console.log("Connection to MongoDB closed.");
    }
}

main();