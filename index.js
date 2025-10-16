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
  }
];

console.log(drivers);
drivers.forEach(driver => {
  console.log(driver.name);
});