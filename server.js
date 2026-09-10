require('dotenv').config({ path: 'atlas-credentials.env' })

const express = require('express')
const {MongoClient} = require('mongodb')
const app = express()
const port = 3000

app.use(express.json())
app.use(express.static('public'))

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('MONGODB_URI is not set. Check atlas-credentials.env.')
}

const client = new MongoClient(uri)

let db;
let bricks;

async function startServer() {
  await client.connect().then(() => {
    console.log('Connected to MongoDB Atlas')
  }) 
  
  db = client.db("brickWall") // Use the "brickWall" database
  bricks = db.collection('bricks')

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  });
}

app.post('/api/bricks', async (req, res) => {
  
  try{

    const newBrick = {
      title: req.body.title,
      body: req.body.body,
      parentID: req.body.parentID || -1, // Default to -1 if not provided
    }

    const result = await bricks.insertOne(newBrick);
    res.status(201).json({
      newBrick,
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

startServer().catch((error) => {
  console.error('Unable to start server:', error)
  process.exitCode = 1
})

