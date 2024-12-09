import redisClient from '../utils/redis.js'; 
import DBClient from '../utils/db.js';

class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      // Validate email
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      // Validate password
      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // Check if the email already exists in the database
      const existingUser = await DBClient.db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Insert new user into the database
      const result = await DBClient.db.collection('users').insertOne({
        email,
        password: hashedPassword,
      });

      // Respond with the newly created user (only email and id)
      const newUser = {
        id: result.insertedId,
        email,
      };

      return res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  static async getMe(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'token not gotten' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'token not gotten from redis ' });
      }

      const user = await DBClient.db.collection('users').findOne({ _id: userId });
      if (!user) {
        return res.status(401).json({ error: 'not getting users' });
      }

      return res.status(200).json({
        id: user._id,
        email: user.email,
      });
    } catch (error) {
      console.error('Error retrieving user info:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;

