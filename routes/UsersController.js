
import { MongoClient } from 'mongodb';
import crypto from 'crypto';
const uri = 'mongodb://localhost:27017';  

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
  if (!client.isConnected()) {
    await client.connect();
  }
}

const UsersController = {
  async postNew(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      await connect();
      const db = client.db('mydb'); 
      const usersCollection = db.collection('users');

     
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exists' });
      }

      
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      
      const result = await usersCollection.insertOne({ email, password: hashedPassword });

     
      const newUser = {
        id: result.insertedId,
        email: result.ops[0].email,
      };

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export default UsersController;

