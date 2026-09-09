require("dotenv").config();

const express = require('express');
const {MongoClient} = require('mongodb');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON request bodies

const uri = process.env.MONGO_URI; // MongoDB connection string from environment variables
const client = new MongoClient(uri);

let db;

async function startServer() {
  await client.connect();
  console.log('Connected to MongoDB');
  db = client.db("brickWall"); // Use the "brickWall" database

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();

const bricks = db.collection("bricks");

app.post('/bricks', (req, res) => {

  const newBrick = req.body; // Assuming the request body contains the new brick data
  newBrick.id = bricks.length + 1; // Assign a unique ID to the new brick
  bricks.push(newBrick); // Add the new brick to the array
  res.json(newBrick); // Respond with the newly created brick

})



