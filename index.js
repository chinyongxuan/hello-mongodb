const { MongoClient } = require('mongodb');

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