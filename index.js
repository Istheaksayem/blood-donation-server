const express = require('express')
const cors = require("cors")
const app = express()
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ba90y0b.mongodb.net/?appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db('blood_donation')
    const usersCollection = db.collection('users')



    // ==============User=========
    app.post('/users', async (req, res) => {
      const user = req.body;
      // prevent duplicate user
      const existingUser = await usersCollection.findOne({ email: user.email });
      if (existingUser) {
        return res.send({ message: 'user already exists' });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //  ============get profile===========
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });
      res.send(user);
    });

    // ================= UPDATE PROFILE =================
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email;
      const updatedData = req.body;

      delete updatedData.email;

      const result = await usersCollection.updateOne(
        { email },
        { $set: updatedData }
      );

      res.send(result);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Blood donation!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
