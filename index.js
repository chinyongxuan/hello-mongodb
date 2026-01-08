require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// defined in Lab Part 1
const saltRounds = 10; 

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

// MIDDLEWARE
// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Authorization Middleware (RBAC)
const authorize = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};


// GET /analytics/passengers
app.get('/analytics/passengers', async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'rides',
          localField: '_id',
          foreignField: 'customerId',
          as: 'rideData'
        }
      },
      {
        $unwind: '$rideData'
      },
      {
        $group: {
          _id: '$name',
          totalRides: { $sum: 1 },
          totalFare: { $sum: '$rideData.fare' },
          avgDistance: { $avg: '$rideData.distance' }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          totalRides: 1,
          totalFare: { $round: ['$totalFare', 2] },   // Added rounding
          avgDistance: { $round: ['$avgDistance', 2] } // Added rounding 
        }
      }
    ];

    const results = await db.collection('customers').aggregate(pipeline).toArray();
    res.status(200).json(results);

  } catch (err) {
    console.error("Aggregation Error:", err);
    res.status(500).json({ error: "Failed to fetch passenger analytics" });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// AUTHENTICATION ROUTES

// POST /auth/login - Unified Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        let user = await db.collection('customers').findOne({ email });
        if (!user) user = await db.collection('drivers').findOne({ email });
        
        if (!user) return res.status(401).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});


// CUSTOMER ENDPOINTS
// POST /customers - Register
app.post('/customers', async (req, res) => {
    try {
        const { password, ...otherData } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newCustomer = {
            ...otherData,
            password: hashedPassword,
            role: "customer"
        };
        
        await db.collection('customers').insertOne(newCustomer);
        res.status(201).json({ message: "Customer registered" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
});

// GET /customers/:id
app.get('/customers/:id', authenticate, async (req, res) => {
  if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const customer = await db.collection('customers').findOne({ _id: new ObjectId(req.params.id) });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: "Invalid customer ID" });
  }
});

// PATCH /customers/:id
app.patch('/customers/:id',authenticate, async (req, res) => {
  if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
  }
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

// POST /rides
app.post('/rides', authenticate, async (req, res) => {
  try {
    const rideData = {
        ...req.body,
        customerId: new ObjectId(req.user.userId), 
        status: "requested",
        createdAt: new Date()
    };

    const result = await db.collection('rides').insertOne(rideData);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid ride data" });
  }
});

// DELETE /rides/:id (Cancel Ride)
app.delete('/rides/:id', authenticate, async (req, res) => {
  try {
    const rideId = new ObjectId(req.params.id);
    
    const ride = await db.collection('rides').findOne({ _id: rideId });
    
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    if (ride.customerId.toString() !== req.user.userId) {
        return res.status(403).json({ error: "You can only cancel your own rides" });
    }

    if (ride.status === 'ongoing' || ride.status === 'completed') {
        return res.status(400).json({ error: "Cannot cancel an ongoing or completed ride" });
    }

    await db.collection('rides').deleteOne({ _id: rideId });
    res.status(200).json({ message: "Ride cancelled successfully" });

  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});

// GET /customers/:id/rides
app.get('/customers/:id/rides', authenticate, async (req, res) => {
  try {
    const rides = await db.collection('rides').find({ 
        customerId: new ObjectId(req.params.id) 
    }).toArray();
    
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ride history" });
  }
});

// POST /ratings (Add Rating)
app.post('/ratings', authenticate, async (req, res) => {
  try {
    const ratingData = {
        ...req.body,
        customerId: new ObjectId(req.user.userId), // recognize from Token
        driverId: new ObjectId(req.body.driverId), // recognize from Body
        rideId: new ObjectId(req.body.rideId),     // recognize from Body
        createdAt: new Date()
    };
    const result = await db.collection('ratings').insertOne(ratingData);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Invalid rating data" });
  }
});

// GET /ratings
app.get('/ratings', authenticate, async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'admin') {
        } 
        else if (req.user.role === 'driver') {
            query.driverId = new ObjectId(req.user.userId);
        } 
        else {
            query.customerId = new ObjectId(req.user.userId);
        }
        
        const ratings = await db.collection('ratings').find(query).toArray();
        res.status(200).json(ratings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch ratings" });
    }
});

// POST /payments (Add Card)
app.post('/payments', authenticate, async (req, res) => {
  try {
    const paymentData = {
        ...req.body,
        customerId: new ObjectId(req.user.userId),
        createdAt: new Date()
    };
    const result = await db.collection('payments').insertOne(paymentData);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Invalid payment data" });
  }
});

// DELETE /payments/:id (Remove Card)
app.delete('/payments/:id', authenticate, async (req, res) => {
  try {
    const result = await db.collection('payments').deleteOne({ 
        _id: new ObjectId(req.params.id),
        customerId: new ObjectId(req.user.userId)
    });
    
    if (result.deletedCount === 0) return res.status(404).json({ error: "Card not found" });
    res.status(200).json({ message: "Card removed" });
  } catch (err) {
    res.status(400).json({ error: "Invalid card ID" });
  }
});


// DRIVER ENDPOINTS
// POST /drivers - Register
app.post('/drivers', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    
    const newDriver = {
      ...req.body,
      password: hashedPassword,
      role: 'driver',
      approved: false
    };

    await db.collection('drivers').insertOne(newDriver);
    res.status(201).json({ message: "Driver registered successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid driver data" });
  }
});

// GET /drivers/:id
app.get('/drivers/:id', authenticate,async (req, res) => {
  if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const driver = await db.collection('drivers').findOne({ _id: new ObjectId(req.params.id) });
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.status(200).json(driver);
  } catch (err) {
    res.status(400).json({ error: "Invalid driver ID" });
  }
});

// PATCH /drivers/:id
app.patch('/drivers/:id', authenticate, async (req, res) => {
  if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
  }
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

// PATCH /drivers/:id/status
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

// PATCH /rides/:id/accept (Driver Only)
app.patch('/rides/:id/accept', authenticate, authorize(['driver']), async (req, res) => {
  try {
    const driver = await db.collection('drivers').findOne({ _id: new ObjectId(req.user.userId) });
    
    if (!driver || driver.approved !== true) {
        return res.status(403).json({ error: "You are not approved to accept rides yet." });
    }

    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
          $set: { 
              status: "accepted", 
              driverId: new ObjectId(req.user.userId) 
          } 
      }
    );
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});

// PATCH /rides/:id/reject
app.patch('/rides/:id/reject', authenticate, authorize(['driver']), async (req, res) => {
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

// PATCH /rides/:id/start
app.patch('/rides/:id/start', async (req, res) => {
  try {
    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
          $set: { 
              status: "ongoing", 
              driverId: new ObjectId(req.user.userId)
          } 
      }
    );
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});

// PATCH /rides/:id/end
app.patch('/rides/:id/end', async (req, res) => {
  try {
    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
          $set: { 
              status: "completed", 
              driverId: new ObjectId(req.user.userId)
          } 
      }
    );
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});

// GET /drivers/:id/rides
app.get('/drivers/:id/rides', authenticate, async (req, res) => {
  try {
        const rides = await db.collection('rides').find({ 
        driverId: new ObjectId(req.params.id) 
    }).toArray();
    
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ride history" });
  }
});



// ADMIN ENDPOINTS (Protected)
// DELETE /admin/customers/:id ( Admin)
app.delete('/admin/customers/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await db.collection('customers').deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid customer ID" });
  }
});

// DELETE /admin/drivers/:id
app.delete('/admin/drivers/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const result = await db.collection('drivers').deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid driver ID" });
  }
});

// GET /admin/customers
app.get('/admin/customers', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const customers = await db.collection('customers').find().toArray();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// GET /admin/drivers
app.get('/admin/drivers', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const drivers = await db.collection('drivers').find().toArray();
    res.status(200).json(drivers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

// PATCH /admin/drivers/:id/approve (Admin Only)
app.patch('/admin/drivers/:id/approve', authenticate, authorize(['admin']), async (req, res) => {
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

// GET /admin/rides
app.get('/admin/rides', async (req, res) => {
  try {
   const rides = await db.collection('rides').find().toArray();
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ride history" });
  }
});

// GET /admin/ratings
app.get('/admin/ratings', async (req, res) => {
   try {
    const ratings = await db.collection('ratings').find().toArray();
    res.status(200).json(ratings);
   } catch (err) {
    res.status(500).json({ error: "Failed to fetch ratings" });
   }
});