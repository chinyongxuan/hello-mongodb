const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const port = 3000;
const app = express();
app.use(express.json());
app.use(cors());

let db;

async function connectToMongoDB() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    db = client.db("week4db");
  } catch (err) {
    console.error("Error:", err);
  }
}

connectToMongoDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


//  CUSTOMER ENDPOINTS 

// POST /customers - Register new customer
app.post('/customers', async (req, res) => {
  try {
    const result = await db.collection('customers').insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Invalid customer data" });
  }
});

// GET /customers/:id - View customer profile
app.get('/customers/:id', async (req, res) => {
  try {
    const customer = await db.collection('customers').findOne({ _id: new ObjectId(req.params.id) });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: "Invalid customer ID" });
  }
});

// PATCH /customers/:id - Edit profile
app.patch('/customers/:id', async (req, res) => {
  try {
    const result = await db.collection('customers').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (!result.modifiedCount) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
});

// POST /rides - Request a new ride
app.post('/rides', async (req, res) => {
  try {
    req.body.status = "requested";
    const result = await db.collection('rides').insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Invalid ride data" });
  }
});

// DELETE /rides/:id - Cancel a ride
app.delete('/rides/:id', async (req, res) => {
  try {
    const result = await db.collection('rides').deleteOne({ _id: new ObjectId(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ error: "Ride not found" });
    res.status(200).json({ message: "Ride cancelled" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});

// GET /customers/:id/rides - View ride history
app.get('/customers/:id/rides', async (req, res) => {
  try {
    const rides = await db.collection('rides').find({ customerId: req.params.id }).toArray();
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ride history" });
  }
});

// POST /ratings - Add a rating
app.post('/ratings', async (req, res) => {
  try {
    const result = await db.collection('ratings').insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Invalid rating data" });
  }
});

// GET /customers/:id/ratings - View ratings by customer
app.get('/customers/:id/ratings', async (req, res) => {
  try {
    const ratings = await db.collection('ratings').find({ customerId: req.params.id }).toArray();
    res.status(200).json(ratings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

// POST /payments - Add payment card
app.post('/payments', async (req, res) => {
  try {
    const result = await db.collection('payments').insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Invalid payment data" });
  }
});

// DELETE /payments/:id - Remove payment card
app.delete('/payments/:id', async (req, res) => {
  try {
    const result = await db.collection('payments').deleteOne({ _id: new ObjectId(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ error: "Card not found" });
    res.status(200).json({ message: "Card removed" });
  } catch (err) {
    res.status(400).json({ error: "Invalid card ID" });
  }
});


//  DRIVER ENDPOINTS 

// POST /drivers - Register new driver
app.post('/drivers', async (req, res) => {
  try {
    const result = await db.collection('drivers').insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Invalid driver data" });
  }
});

// GET /drivers/:id - View driver profile
app.get('/drivers/:id', async (req, res) => {
  try {
    const driver = await db.collection('drivers').findOne({ _id: new ObjectId(req.params.id) });
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.status(200).json(driver);
  } catch (err) {
    res.status(400).json({ error: "Invalid driver ID" });
  }
});

// PATCH /drivers/:id - Edit driver profile
app.patch('/drivers/:id', async (req, res) => {
  try {
    const result = await db.collection('drivers').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (!result.modifiedCount) return res.status(404).json({ error: "Driver not found" });
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid driver data" });
  }
});

// PATCH /drivers/:id/status - Update availability
app.patch('/drivers/:id/status', async (req, res) => {
  try {
    const result = await db.collection('drivers').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { available: req.body.available } }
    );
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid driver ID" });
  }
});

// PATCH /rides/:id/accept - Accept ride
app.patch('/rides/:id/accept', async (req, res) => {
  try {
    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "accepted", driverId: req.body.driverId } }
    );
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});

// PATCH /rides/:id/reject - Reject ride
app.patch('/rides/:id/reject', async (req, res) => {
  try {
    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "rejected" } }
    );
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});

// PATCH /rides/:id/start - Start ride
app.patch('/rides/:id/start', async (req, res) => {
  try {
    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "ongoing" } }
    );
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});

// PATCH /rides/:id/end - End ride
app.patch('/rides/:id/end', async (req, res) => {
  try {
    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: "completed" } }
    );
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});

// GET /drivers/:id/rides - View ride history
app.get('/drivers/:id/rides', async (req, res) => {
  try {
    const rides = await db.collection('rides').find({ driverId: req.params.id }).toArray();
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ride history" });
  }
});

// GET /drivers/:id/ratings - View ratings for driver
app.get('/drivers/:id/ratings', async (req, res) => {
  try {
    const ratings = await db.collection('ratings').find({ driverId: req.params.id }).toArray();
    res.status(200).json(ratings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});


//  ADMIN ENDPOINTS 

// GET /admin/customers - View all customers
app.get('/admin/customers', async (req, res) => {
  try {
    const customers = await db.collection('customers').find().toArray();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// GET /admin/drivers - View all drivers
app.get('/admin/drivers', async (req, res) => {
  try {
    const drivers = await db.collection('drivers').find().toArray();
    res.status(200).json(drivers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

// PATCH /admin/drivers/:id/approve - Approve driver registration
app.patch('/admin/drivers/:id/approve', async (req, res) => {
  try {
    const result = await db.collection('drivers').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { approved: true } }
    );
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid driver ID" });
  }
});

// DELETE /admin/customers/:id - Delete customer
app.delete('/admin/customers/:id', async (req, res) => {
  try {
    const result = await db.collection('customers').deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid customer ID" });
  }
});

// DELETE /admin/drivers/:id - Delete driver
app.delete('/admin/drivers/:id', async (req, res) => {
  try {
    const result = await db.collection('drivers').deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid driver ID" });
  }
});
