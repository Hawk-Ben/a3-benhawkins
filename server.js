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

const bricks = db.collection("bricks");

app.post('api/bricks', async (req, res) => {
  
  try{

    const newBrick = {
      title: req.body.title,
      body: req.body.body,
      parentID: req.body.parentID || null, // Default to null if not provided
    }

    const result = await bricks.insertOne(newBrick);
    res.status(201).json({ message: 'Brick created', brickId: result.insertedId });

    res.json({
      ...newBrick,
      id: result.insertedId
    })

  } catch (error) {
    console.error('Error creating brick:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

app.get('/api/bricks', async (req, res) => {

  try{
    const allBricks = await bricks.find().toArray()

    res.json(allBricks)
  } catch (error) {
    console.error('Error fetching bricks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

})

startServer()

