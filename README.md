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

## Week 7 Tasks

## Part 1: Data Preparation
### Inserted sample data for customers collection (Alice & Bob).
![Driver Query Output](./images/customers.png)
### Inserted sample data for rides collection (Alice & Bob).
![Driver Query Output](./images/rides.png)


## Part 2: Pipeline Design in MongoDB Compass
### Built the 4-stage pipeline ($lookup, $unwind, $group, $project).
#### Stage 1: $lookup
![Driver Query Output](./images/stage1.png)

#### Stage 2: $unwind
![Driver Query Output](./images/stage2.png)

#### Stage 3: $group
![Driver Query Output](./images/stage3.png)

#### Stage 4: $project
![Driver Query Output](./images/stage4.png)

### Execution of Pipeline (4 Stages)
![Driver Query Output](./images/analyticcode.png)

## Part 3: Node.js Implementation
### Create API Endpoint in index.js to implement GET /analytics/passengers endpoint
![Driver Query Output](./images/analyticcode.png)

## Part 4: Postman Testing
### Test with Postman using http://localhost:3000/analytics/passengers
![Driver Query Output](./images/pipelineresult.png)

## Part 5: Analytic Dashboard
![Driver Query Output](./images/visualization.png)


### Generate Visualization Dashboard with Postman 
![Driver Query Output](./images/Diagram_EFDdrawio.png)

### DESIGN THE ERD Diagram
![Driver Name Output](./images/Use_Case_Diagram.drawio.png)

### DESIGN THE USE CASE DIAGRAM
![Driver Name Output](./images/Use_Case_Diagram.drawio.png)

### DEFINE API SPECIFICATIONS
![Driver Name Output](./images/Use_Case_Api_Specifications.png)

## MongoDB Data Model Structure
![Driver Name Output](./images/34.png)