import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';
import sha1 from 'sha1';

class UsersController {
  // Method to register a new user (POST /users)
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const db = dbClient.db; // Use getter to access the db instance

      // Check if email already exists
      const userExists = await db.collection('users').findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: 'Already exists' });
      }

      // Hash the password and insert the new user
      const hashedPassword = sha1(password);
      const newUser = await db.collection('users').insertOne({
        email,
        password: hashedPassword,
      });

      return res.status(201).json({ id: newUser.insertedId, email });
    } catch (error) {
      console.error('Error in postNew:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Method to retrieve the current user (GET /users/me)
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Find the user in MongoDB using the userId stored in Redis
      const user = await dbClient.getDB().collection('users').findOne({ _id: dbClient.getObjectId(userId) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ id: user._id, email: user.email });
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
