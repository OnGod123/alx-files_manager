import UserController from '../controllers/UsersController.js'; 
import dbClient from '../utils/db.js'; // Ensure correct path
import redisClient from '../utils/redis.js'; // Ensure correct path
import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const uri =  'mongodb://localhost:27017';
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
      const db = client.db('file_manager');
      const usersCollection = db.collection('users');

      // Check if email already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exists' });
      }

      // Hash the password
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      // Create the new user
      const result = await usersCollection.insertOne({ email, password: hashedPassword });

      // Return the new user with id and email
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

