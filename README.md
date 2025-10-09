# Hello MongoDB Project

## Installation Steps

### 1. Install VSCode
- Download from [https://code.visualstudio.com](https://code.visualstudio.com)
- Install MongoDB extension.

### 2. Install Node.js and npm
```bash
node -v
npm -v
```

# Exercise Questions

## 1. Code Execution & Output
- After running your index.js script:
- What exact text does the console display when the document is inserted?
- What _id value is automatically assigned to the document?

### Answer 1:
Connected to MongoDB!
Document inserted!
Query result: {
  _id: new ObjectId('68e738cd9cc6e95ac61618ed'),
  name: 'Alice',
  age: 25
}

## 2. Modify and Observe
- Change the name field in index.js to your own name and the age to your birth year. Run the script again.
- What new _id is generated for this document?
- What error occurs if you forget to call await client.connect()?

### Answer 2:
{
    _id: new ObjectId('68e737b701ad475777c1b588'),
    name: 'Chin Yong Xuan',
    age: 2002
  }

For my case, No errors if forget to call await client.connect()


## 3. MongoDB Connection Failure
- Intentionally break the MongoDB connection string (e.g., change the
port to 27018).
- What error message does NodeJS throw?
- What is the exact text of the error code (e.g., ECONNREFUSED)?

### Answer 3:
Error: MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27018
    at Topology.selectServer (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\sdam\topology.js:327:38)
    at async Topology._connect (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\sdam\topology.js:200:28)
    at async Topology.connect (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\sdam\topology.js:152:13)
    at async topologyConnect (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\mongo_client.js:264:17)
    at async MongoClient._connect (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\mongo_client.js:277:13)
    at async MongoClient.connect (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\mongo_client.js:202:13)
    at async main (C:\Users\Asus\Downloads\hello-mongodb\index.js:9:5) {
  errorLabelSet: Set(0) {},
  reason: TopologyDescription {
    type: 'Unknown',
    servers: Map(1) { '127.0.0.1:27018' => [ServerDescription] },
    stale: false,
    compatible: true,
    heartbeatFrequencyMS: 10000,
    localThresholdMS: 15,
    setName: null,
    maxElectionId: null,
    maxSetVersion: null,
    commonWireVersion: 0,
    logicalSessionTimeoutMinutes: null
  },
  code: undefined,
  [cause]: MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27018
      at Socket.<anonymous> (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\cmap\connect.js:286:44)
      at Object.onceWrapper (node:events:622:26)
      at Socket.emit (node:events:507:28)
      at emitErrorNT (node:internal/streams/destroy:170:8)
      at emitErrorCloseNT (node:internal/streams/destroy:129:3)
      at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
    errorLabelSet: Set(1) { 'ResetPool' },
    beforeHandshake: false,
    [cause]: Error: connect ECONNREFUSED 127.0.0.1:27018
        at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16) {
      errno: -4078,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 27018
    }
  }
}


## 4. MongoDB Shell Query
- Use the MongoDB shell (not Compass) to:
- List all documents in the testDB.users collection.
- What command did you use? Paste the full output.

### Answer 4:
db.users.find()

{
  _id: ObjectId('68e737b701ad475777c1b588'),
  name: 'Chin Yong Xuan',
  age: 2002
}
{
  _id: ObjectId('68e738cd9cc6e95ac61618ed'),
  name: 'Alice',
  age: 25
}


## 5. File System & Dependencies
- What is the absolute path to your project’s package-lock.json file?
- What exact version of the mongodb driver is installed?

### Answer 5:
C:\Users\Asus\Downloads\hello-mongodb\package-lock.json
npm list mongodb
databaselab1@1.0.0 C:\Users\Asus\Downloads\hello-mongodb
└── mongodb@6.20.0



## 6. Troubleshooting Practice
- Stop the MongoDB service and run the script.
- What error occurs?
- What command restarts the service?

### Answer 6:
Error: MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
    at Topology.selectServer (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\sdam\topology.js:327:38)
    at async Topology._connect (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\sdam\topology.js:200:28)
    at async Topology.connect (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\sdam\topology.js:152:13)
    at async topologyConnect (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\mongo_client.js:264:17)
    at async MongoClient._connect (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\mongo_client.js:277:13)
    at async MongoClient.connect (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\mongo_client.js:202:13)
    at async autoConnect (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\operations\execute_operation.js:102:13)     
    at async abortable (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\utils.js:1188:16)
    at async executeOperation (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\operations\execute_operation.js:40:11) 
    at async Collection.insertOne (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\collection.js:154:16) {
  errorLabelSet: Set(0) {},
  reason: TopologyDescription {
    type: 'Unknown',
    servers: Map(1) { '127.0.0.1:27017' => [ServerDescription] },
    stale: false,
    compatible: true,
    heartbeatFrequencyMS: 10000,
    localThresholdMS: 15,
    setName: null,
    maxElectionId: null,
    maxSetVersion: null,
    commonWireVersion: 0,
    logicalSessionTimeoutMinutes: null
  },
  code: undefined,
  [cause]: MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
      at Socket.<anonymous> (C:\Users\Asus\Downloads\hello-mongodb\node_modules\mongodb\lib\cmap\connect.js:286:44)
      at Object.onceWrapper (node:events:622:26)
      at Socket.emit (node:events:507:28)
      at emitErrorNT (node:internal/streams/destroy:170:8)
      at emitErrorCloseNT (node:internal/streams/destroy:129:3)
      at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
    errorLabelSet: Set(1) { 'ResetPool' },
    beforeHandshake: false,
    [cause]: Error: connect ECONNREFUSED 127.0.0.1:27017
        at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16) {
      errno: -4078,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 27017
    }
  }
}
Command: net start MongoDB


## 7. GitHub Repository Structure
- On GitHub, navigate to your repository’s.
- What timestamp is listed for your last commit?
- How many files are present in this branch?

### Answer 7:
Commits on Oct 9, 2025

5 Files in the branch:
README.md
index.js
package.json
package-lock.json
.gitignore


## 8. Performance Observation
- Time how long it takes for the script to print "Connected to MongoDB!".
- What is the duration (in milliseconds)?
- Does this time change if you run the script again? Why?

### Answer 8:
Duration:18ms
Same Duration, Not Faster or Slower
